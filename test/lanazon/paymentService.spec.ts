
import {expect} from "chai";
import {capturePayment} from "../../src/lanazon/paymentService";
import {Order} from "../../src/lanazon/definitions";

describe("paymentService", () => {
    it("always succeeds", () => {
        return capturePayment({lineItems: []})
    });
});