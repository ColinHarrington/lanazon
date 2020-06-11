import {NextFunction, Request, Response} from "express";
import {Logger} from "tslog";
import {Database} from "sqlite";
import {validate, ValidationError} from "class-validator";
import {productsBySkus} from "../lanazon/productService";
import {buildOrder, submitOrder, updateTotals} from "../lanazon/orderService";
import {applyActivePromotions} from "../lanazon/promotion";
import {Cart, CartItem, Checkout, DbProduct, Order, ProductNotFoundError} from "../lanazon/definitions";

const log: Logger = new Logger({name: "checkoutLogger"});

/**
 * Express middleware that parses and validates the items in the users' cart.
 *
 * @param req Express Request
 * @param res Express Response
 * @param next NextFunction moving execution down the chain
 */
export const checkoutValidatorMiddleware = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const checkout = checkoutFromRequest(req)

    return validate(checkout).then((errors: ValidationError[]) => {
        if (errors.length > 0) {
            log.warn("validation failed. errors: ", errors);
            res.status(400).json(errors);
        } else {
            res.locals.checkout = checkout;
            next()
        }
    }).catch((reason => {
        log.warn("Unexpected Error", reason)
        res.status(500).json("Unexpected during validation")
    }))
}

/**
 * Marshalls a Checkout Object out of an incoming request
 * if there are no params, it will yeild an empty Checkout/Cart
 *
 * @param req Express Request
 * @returns a parsed Checkout objects
 */
export const checkoutFromRequest = (req: Request): Checkout => {
    const cart: Cart = req.body.cart || {}
    const items = Object.entries(cart).map(([sku, qty]) => new CartItem(sku, qty))
    return new Checkout(items)
}

/**
 * Express Handler that serves as the request/response adapter for our Checkout Logic
 *
 * @param db the sqlite database
 */
export const checkoutHandler = (db: Database) => async (req: Request, res: Response):Promise<Response> => {
    const checkout = res.locals.checkout

    return processCheckout(db, checkout)
        .then((result) => res.json(result))
        .catch(err => {
            log.warn("Error in checkout process", err)
            if (err instanceof ProductNotFoundError) {
                return res.status(400).send({error: {message: "Product not found", sku: err.sku}})
            }
            if (err?.code === 'SQLITE_CONSTRAINT') {
                return res.status(410).send({error: {message: "Insufficient quantity"}})
            } else {
                return res.status(500).send("Unexpected Error");
            }
        })
}

/**
 * Checkout Logic
 *  -> Builds the order
 *  -> Applies the promotions
 *  -> Tally the $$ considering discounts/promos
 *  -> Submits and captures the order
 *
 * @param db
 * @param checkout a valid Checkout/Cart build by the checkoutValidatorMiddleware
 *
 * @returns the successful Order
 */
export const processCheckout = async (db: Database, checkout: Checkout): Promise<Order> => {
    const {items} = checkout
    const skus = items.map(item => item.sku);

    const applicableProducts: DbProduct[] = await productsBySkus(db, skus)

    const order: Order = buildOrder(checkout.items, applicableProducts);
    applyActivePromotions(order);
    updateTotals(order);

    const submittedOrder = await submitOrder(db, order)
    log.info("Order Completed", submittedOrder)
    return submittedOrder
}




