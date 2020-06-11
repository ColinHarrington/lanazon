import {Logger} from "tslog";
import {Database} from "sqlite";
import {capturePayment} from "./paymentService";
import {CartItem, DbProduct, LineItem, notUndefined, Order, ProductNotFoundError, roundMoney} from "./definitions";

const log: Logger = new Logger({name: "orderLogger"});

export const buildOrder = (cartItems: CartItem[], products: DbProduct[]): Order => {
    const lineItems: LineItem[] = cartItems.map(({sku, qty}) => {
        const product = products.find(item => item.sku === sku)
        if (product) {
            const amount = qty * product.price;
            return {product: product, quantity: qty, amount, total: amount}
        } else {
            throw new ProductNotFoundError(sku);
        }
    })

    return {lineItems}
}

export const updateTotals = (order: Order): void => {
    const {lineItems} = order;
    lineItems.forEach(updateLineItemTotal)

    // Calculate total
    const lineItemTotals: number[] = lineItems.map(value => value.total).filter(notUndefined)
    const sum = (a: number| undefined, b: number | undefined) => (a || 0) + (b || 0);
    order.total = roundMoney(lineItemTotals.reduce(sum, 0));
}

export const updateLineItemTotal = (lineItem: LineItem): void => {
    const {amount, discount} = lineItem;
    lineItem.total = roundMoney(amount - (discount?.amount || 0));
}

export const submitOrder = async (db: Database, order: Order): Promise<Order> => {
    await saveOrder(db, order); //Initialized
    await capturePayment(order); //capture Payment //Charged
    return finalizeOrder(db, order)//Transactional inventory update. //Comfirmed;
}

export const saveOrder = async (db: Database, order: Order): Promise<Order> => {
    log.info("Order Submitted", order)
    //TODO write order to DB with 'Submitted' status
    return Promise.resolve(order)
}

export const finalizeOrder = async (db: Database, order: Order): Promise<Order> => {
    const completed: LineItem[] = []

    return new Promise<Order>((success, failure) => {
        const rollback = (error: Error | null) => failure(error)
        const commited = (error: Error | null) => error ? failure(error) : success()
        const db3 = db.getDatabaseInstance()
        db3.serialize(() => {
            db3.run("BEGIN TRANSACTION")
            order.lineItems.forEach(lineItem => {
                const updateComplete = (err: Error | null) => {
                    if (err) {
                        db3.run("ROLLBACK;", rollback);
                        return failure(err)
                    } else {
                        completed.push(lineItem)
                        if (completed.length === order.lineItems.length) {
                            return success()
                        }
                    }
                }
                db3.run("UPDATE PRODUCT SET qty = qty - ? WHERE sku = ?", [lineItem.quantity, lineItem.product.sku], updateComplete)
            })
            //TODO write order to the DB
            db3.run("COMMIT", commited)
        })
    }).then(() => Promise.resolve(order)).catch(reason => Promise.reject(reason))
}
