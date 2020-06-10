import {CartItem, Checkout} from "../../src/lanazon/definitions";
import {validate} from "class-validator";
import {expect} from "chai";

describe("Checkout class", () => {
    it("should Validate", () => {
        const checkout = new Checkout([new CartItem("abcdef", 42)])

        return validate(checkout).then(errors => {
            expect(errors).to.be.empty
        });
    });

    it("requires cart items", () => {
        const checkout = new Checkout([])

        return validate(checkout).then(errors => {
            expect(errors).to.not.be.empty
            expect(errors).to.have.length(1)

            const error = errors[0]
            expect(error.property).to.equal("items");
            expect(error.constraints).to.haveOwnProperty('arrayMinSize')
        });
    });

    it("validates cart items", () => {
        const checkout = new Checkout([new CartItem("", 42)])

        return validate(checkout).then(errors => {
            expect(errors).to.not.be.empty
            expect(errors).to.have.length(1)

            expect(errors[0].children).to.have.length(1)
        });
    });
});

describe("CartItem class", () => {
    it("should Validate", () => {
        const cartItem = new CartItem("abcdef", 42);

        return validate(cartItem).then(errors => {
            expect(errors).to.be.empty
        });
    });

    it("errors with non-alphanumeric skus", () => {
        const cartItem = new CartItem("😁😁😁😁😁😁😁", 42);

        return validate(cartItem).then(errors => {
            expect(errors[0].property).to.equal("sku");
            expect(errors[0].constraints).to.haveOwnProperty('isAlphanumeric')
        });
    });

    it("errors with skus under 6 characters", () => {
        const cartItem = new CartItem("1234", 42);

        return validate(cartItem).then(errors => {
            expect(errors[0].property).to.equal("sku");
            expect(errors[0].constraints).to.haveOwnProperty('length')
        });
    });
    it("errors with skus over 8 characters", () => {
        const cartItem = new CartItem("123456789", 42);

        return validate(cartItem).then(errors => {
            expect(errors[0].property).to.equal("sku");
            expect(errors[0].constraints).to.haveOwnProperty('length')
        });
    });

    it("errors with negative qty", () => {
        const cartItem = new CartItem("123456", -1);

        return validate(cartItem).then(errors => {
            expect(errors[0].property).to.equal("qty");
            expect(errors[0].constraints).to.haveOwnProperty('isPositive')
        });
    });
    it("errors when qty = 0", () => {
        const cartItem = new CartItem("123456", 0);

        return validate(cartItem).then(errors => {
            expect(errors[0].property).to.equal("qty");
            expect(errors[0].constraints).to.haveOwnProperty('isPositive')
        });
    });
    it("errors when qty = NaN ", () => {
        const cartItem = new CartItem("123456", NaN);

        return validate(cartItem).then(errors => {
            expect(errors[0].property).to.equal("qty");
            expect(errors[0].constraints).to.haveOwnProperty('isInt')
        });
    });
    it("errors when qty = Infinity ", () => {
        const cartItem = new CartItem("123456", Infinity);

        return validate(cartItem).then(errors => {
            expect(errors[0].property).to.equal("qty");
            expect(errors[0].constraints).to.haveOwnProperty('isInt')
        });
    });
    it("errors when qty is a decimal", () => {
        const cartItem = new CartItem("123456", 2.71828);

        return validate(cartItem).then(errors => {
            expect(errors[0].property).to.equal("qty");
            expect(errors[0].constraints).to.haveOwnProperty('isInt')
        });
    });
});