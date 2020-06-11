import {expect} from "chai";
import {checkoutFromRequest, checkoutHandler, checkoutValidatorMiddleware} from "../../src/api/checkout";
import {Request, Response, Send} from "express";
import {fake, spy} from "sinon";
import {initDb} from "../../src/lanazon/database";
import {CartItem, Checkout, MACBOOK_PRO, Order, RASPBERRY_PI} from "../../src/lanazon/definitions";

describe("checkout", () => {
    describe("checkoutFromRequest", () => {
        it("produces a Checkout object", () => {
            const request = {body: {cart: {"123456": 7}}} as Request

            const checkout = checkoutFromRequest(request)

            expect(checkout.items).length(1)
            expect(checkout.items[0].sku).equals("123456")
            expect(checkout.items[0].qty).equals(7)
        });

        it("produces an empty cart without a request body", () => {
            const request = {body: {}} as Request

            const checkout = checkoutFromRequest(request)

            expect(checkout.items).empty
        });
    });
    describe("checkoutValidatorMiddleware", () => {
        it("validates the cart and stores produces a Checkout object", () => {
            const request = {body: {cart: {"123456": 7}}} as Request
            const response = {locals: {}} as Response
            const nextfn = fake()

            return checkoutValidatorMiddleware(request, response, nextfn).then(() => {
                expect(nextfn.called).true;

                expect(response.locals.checkout.items).length(1)
                const cartItem = response.locals.checkout.items[0]
                expect(cartItem.sku).equals("123456")
                expect(cartItem.qty).equals(7)
            });
        });

        it("yeilds a 400 with validation errors", () => {
            const request = {body: {cart: {"123456": -1}}} as Request

            const response = {} as Response;
            const json = fake.returns(response);
            const status = fake.returns(response);
            response.status = status;
            response.json = json;

            const nextfn = fake()

            return checkoutValidatorMiddleware(request, response, nextfn).then(() => {
                expect(nextfn.called).false;
                expect(status.calledWith(400)).true
                expect(json.args[0]).length(1)
            });
        });
    });

    describe("checkoutHandler", () => {
        const request = {} as Request

        it("validates the cart and stores produces a Checkout object", async () => {
            const db = await initDb();
            const checkout: Checkout = new Checkout([
                new CartItem(MACBOOK_PRO.sku, 1),
                new CartItem(RASPBERRY_PI.sku, 1)
            ])

            let order: Order | undefined = undefined
            const response = {locals: {checkout}, json: (obj) => order = obj} as Response

            return checkoutHandler(db)(request, response).then(() => {
                expect(order?.total).eql(5399.99)
                expect(order?.lineItems).length(2)
            })
        });

        it("handles missing product", async () => {
            const db = await initDb();
            const checkout: Checkout = new Checkout([
                new CartItem("123456", 1)
            ])
            let json: any = undefined

            const response = {
                locals: {checkout},
                send: (body) => json = body
            } as Response
            const status = fake.returns(response);
            response.status = status;

            return checkoutHandler(db)(request, response).then(() => {
                expect(status.calledOnceWith(400)).true
                expect(json).eql({error: {message: "Product not found", sku: "123456"}})
            })
        });

        it("handles inventory checks", async () => {
            const db = await initDb();
            const checkout: Checkout = new Checkout([
                new CartItem(RASPBERRY_PI.sku, 7)
            ])

            let json: any = undefined
            const response = {
                locals: {checkout},
                send: (body) => json = body
            } as Response
            const status = fake.returns(response);
            response.status = status;

            return checkoutHandler(db)(request, response).then(() => {
                expect(status.calledOnceWith(410)).true
                expect(json.error.message).eql("Insufficient quantity")
            })
        });
    });
});
