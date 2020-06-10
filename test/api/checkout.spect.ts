import {expect} from "chai";
import {checkoutFromRequest, checkoutValidatorMiddleware} from "../../src/api/checkout";
import {Request, Response} from "express";
import {fake, mock} from "sinon";

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
        var response = {locals: {}} as Response
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

        var response = {} as Response;
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