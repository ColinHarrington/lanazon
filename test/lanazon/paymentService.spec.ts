import {capturePayment} from "../../src/lanazon/paymentService";

describe("paymentService", () => {
    it("always succeeds", () => {
        return capturePayment({lineItems: []})
    });
});