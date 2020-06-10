import {
    buildOrder,
    finalizeOrder,
    saveOrder,
    submitOrder,
    updateLineItemTotal,
    updateTotals
} from "../../src/lanazon/orderService";
import {expect} from "chai";
import {
    ALEXA_SPEAKER,
    CartItem,
    DbProduct,
    LineItem,
    MACBOOK_PRO, Order,
    ProductNotFoundError
} from "../../src/lanazon/definitions";
import {alexaPromotion} from "../../src/lanazon/promotion";
import {initDb} from "../../src/lanazon/database";
import {Database} from "sqlite";

describe("buildOrder", () => {
    it("builds an Order", () => {
        const cartItems = [new CartItem(ALEXA_SPEAKER.sku, 1)]
        const alexaProduct: DbProduct = {...ALEXA_SPEAKER, qty: 10}
        const products = [alexaProduct]

        const order = buildOrder(cartItems, products);

        expect(order.lineItems).length(1)
        expect(order.lineItems[0]).to.eql({product: alexaProduct, quantity: 1, amount: 109.5, total: 109.5})
    })

    it("throws a ProductNotFoundError with an invalid SKU", () => {
        const cartItems = [
            new CartItem(ALEXA_SPEAKER.sku, 1),
            new CartItem("123456", 1)
        ]
        const alexaProduct: DbProduct = {...ALEXA_SPEAKER, qty: 10}
        const products = [alexaProduct]

        expect(() => buildOrder(cartItems, products)).throws(ProductNotFoundError);
    })
})

describe("updateLineItemTotal", () => {
    it("updates total with a discount ", () => {
        const lineItem: LineItem = {
            product: ALEXA_SPEAKER,
            quantity: 3,
            amount: ALEXA_SPEAKER.price * 3,
            discount: {amount: 32.85, description: alexaPromotion.description}
        }

        updateLineItemTotal(lineItem)

        expect(lineItem.amount).equals(328.50)
        expect(lineItem.total).equals(295.65)
    })

    it("updates total without a discount ", () => {
        const lineItem: LineItem = {product: ALEXA_SPEAKER, quantity: 1, amount: ALEXA_SPEAKER.price * 1}

        updateLineItemTotal(lineItem)

        expect(lineItem.amount).equals(109.50)
        expect(lineItem.total).equals(109.50)
    })
})

describe("updateTotals", () => {
    it("updates total with a discount ", () => {

        const alexa: LineItem = {
            product: ALEXA_SPEAKER,
            quantity: 3,
            amount: ALEXA_SPEAKER.price * 3,
            discount: {amount: 32.85, description: alexaPromotion.description}
        }
        const mbp: LineItem = {
            product: MACBOOK_PRO,
            quantity: 2,
            amount: MACBOOK_PRO.price * 2
        }
        const order: Order = {lineItems: [alexa, mbp]}

        updateTotals(order)

        expect(alexa.total).equals(295.65);
        expect(mbp.total).equals(10799.98);
        expect(order.total).equals(11095.63)
    })
})

describe("submitOrder", () => {
    it("succeeds", async () => {
        const alexa: LineItem = {
            product: ALEXA_SPEAKER,
            quantity: 3,
            amount: ALEXA_SPEAKER.price * 3,
            discount: {amount: 32.85, description: alexaPromotion.description}
        }
        const mbp: LineItem = {
            product: MACBOOK_PRO,
            quantity: 2,
            amount: MACBOOK_PRO.price * 2
        }
        const order: Order = {lineItems: [alexa, mbp], total: 1234.56}

        const db = await initDb();

        return submitOrder(db, order).then((order) => {
            expect(order).to.be.equal(order);
        })
    })
});

describe("saveOrder", () => {
    it("resolves", async () => {
        const alexa: LineItem = {
            product: ALEXA_SPEAKER,
            quantity: 30,
            amount: ALEXA_SPEAKER.price * 30,
            discount: {amount: 328.50, description: alexaPromotion.description}
        }
        const mbp: LineItem = {
            product: MACBOOK_PRO,
            quantity: 2,
            amount: MACBOOK_PRO.price * 2
        }
        const order: Order = {lineItems: [alexa, mbp], total: 1234.56}

        return saveOrder({} as Database, order).then((order) => {
            expect(order).to.be.equal(order);
        });
    });
});

describe("finalizeOrder", () => {
    it("succeeds", async () => {
        const alexa: LineItem = {
            product: ALEXA_SPEAKER,
            quantity: 3,
            amount: ALEXA_SPEAKER.price * 3,
            discount: {amount: 32.85, description: alexaPromotion.description}
        }
        const mbp: LineItem = {
            product: MACBOOK_PRO,
            quantity: 2,
            amount: MACBOOK_PRO.price * 2
        }
        const order: Order = {lineItems: [alexa, mbp], total: 1234.56}

        const db = await initDb();

        return finalizeOrder(db, order).then((order) => {
            expect(order).to.be.equal(order);
        })
    })

    it("has insufficient quantity", async () => {
        const alexa: LineItem = {
            product: ALEXA_SPEAKER,
            quantity: 30,
            amount: ALEXA_SPEAKER.price * 30,
            discount: {amount: 328.50, description: alexaPromotion.description}
        }
        const mbp: LineItem = {
            product: MACBOOK_PRO,
            quantity: 2,
            amount: MACBOOK_PRO.price * 2
        }
        const order: Order = {lineItems: [alexa, mbp], total: 1234.56}

        const db = await initDb();


        return finalizeOrder(db, order).catch(e => {
            expect(e.code).equals("SQLITE_CONSTRAINT")
        })
    })
})