import {NextFunction, Request, Response} from "express";
import {Logger} from "tslog";
import {Database} from "sqlite";
import {validate, ValidationError} from "class-validator";
import {productsBySkus} from "../lanazon/productService";
import {buildOrder, submitOrder, updateTotals} from "../lanazon/orderService";
import {applyActivePromotions} from "../lanazon/promotion";
import {Cart, CartItem, Checkout, DbProduct, Order, ProductNotFoundError} from "../lanazon/definitions";

const log: Logger = new Logger({name: "checkoutLogger"});

export const checkoutValidatorMiddleware = async (req: Request, res: Response, next: NextFunction) => {
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
export const checkoutFromRequest = (req: Request) => {
    const cart: Cart = req.body.cart || {}
    const items = Object.entries(cart).map(([sku, qty]) => new CartItem(sku, qty))
    return new Checkout(items)
}

export const checkoutHandler = (db: Database) => async (req: Request, res: Response) => {
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

export const processCheckout = async (db: Database, checkout: Checkout) => {
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




