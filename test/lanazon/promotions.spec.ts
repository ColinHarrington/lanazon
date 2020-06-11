import {ALEXA_SPEAKER, GOOGLE_HOME, LineItem, MACBOOK_PRO, RASPBERRY_PI} from "../../src/lanazon/definitions";
import {
    AlexaApplyPromo,
    alexaPromotion, applyActivePromotions,
    googleHomePromotion,
    HeyGoogleApplyPromo,
    mbpPromotion, SiriApplyPromo
} from "../../src/lanazon/promotion";
import {expect} from "chai";

describe("Alexa Promo", () => {
    const alexa = ALEXA_SPEAKER;

    it("applies a discount when ordering 3", () => {
        const alexaLineItem: LineItem = {product: alexa, quantity: 3, amount: alexa.price * 3}

        AlexaApplyPromo({lineItems: [alexaLineItem]}, alexaLineItem, alexaPromotion)

        expect(alexaLineItem.discount?.amount).to.equal(32.85)
        expect(alexaLineItem.discount?.description).to.equal(alexaPromotion.description)
    });

    it("does not apply a discount when ordering 2", () => {
        const alexaLineItem: LineItem = {product: alexa, quantity: 2, amount: alexa.price * 2}

        AlexaApplyPromo({lineItems: [alexaLineItem]}, alexaLineItem, alexaPromotion)

        expect(alexaLineItem.discount).to.be.undefined
    });

    it("applies a discount when ordering 10", () => {
        const alexaLineItem: LineItem = {product: alexa, quantity: 10, amount: alexa.price * 10}

        AlexaApplyPromo({lineItems: [alexaLineItem]}, alexaLineItem, alexaPromotion)

        expect(alexaLineItem.discount?.amount).to.equal(109.5)
    });
});

describe("Google Home Promo", () => {
    const googlehome = GOOGLE_HOME;
    const promo = googleHomePromotion

    it("applies a discount when ordering 3", () => {
        const lineItem: LineItem = {product: googlehome, quantity: 3, amount: googlehome.price * 3}

        HeyGoogleApplyPromo({lineItems: [lineItem]}, lineItem, promo)

        expect(lineItem.discount?.amount).to.equal(49.99)
        expect(lineItem.discount?.description).to.equal(promo.description)
    });

    it("does not apply a discount when ordering 2", () => {
        const lineItem: LineItem = {product: googlehome, quantity: 2, amount: googlehome.price * 2}

        HeyGoogleApplyPromo({lineItems: [lineItem]}, lineItem, promo)

        expect(lineItem.discount).to.be.undefined
    });

    it("applies a discount when ordering 10", () => {
        const lineItem: LineItem = {product: googlehome, quantity: 10, amount: googlehome.price * 10}

        HeyGoogleApplyPromo({lineItems: [lineItem]}, lineItem, promo)

        expect(lineItem.discount?.amount).to.equal(149.97)
    });
});

describe("MacBookPro Promo", () => {
    const mbp = MACBOOK_PRO;
    const rPi = RASPBERRY_PI
    const promo = mbpPromotion

    it("applies a discount to an existing raspberry pi in the cart", () => {
        const mbpLineItem: LineItem = {product: mbp, quantity: 1, amount: mbp.price}
        const rPiLineItem: LineItem = {product: rPi, quantity: 1, amount: rPi.price}

        SiriApplyPromo({lineItems: [mbpLineItem, rPiLineItem]}, mbpLineItem, promo)

        expect(rPiLineItem.discount?.amount).to.equal(30.00)
        expect(rPiLineItem.discount?.description).to.equal(promo.description)
    });

    it("applies no discount without a raspberry pi in the cart", () => {
        const mbpLineItem: LineItem = {product: mbp, quantity: 1, amount: mbp.price}

        SiriApplyPromo({lineItems: [mbpLineItem]}, mbpLineItem, promo)

        expect(mbpLineItem.discount).to.be.undefined
    });

    it("applies a discount to an one raspberry pi in the cart", () => {
        const mbpLineItem: LineItem = {product: mbp, quantity: 1, amount: mbp.price}
        const rPiLineItem: LineItem = {product: rPi, quantity: 3, amount: rPi.price * 3}

        SiriApplyPromo({lineItems: [mbpLineItem, rPiLineItem]}, mbpLineItem, promo)

        expect(rPiLineItem.discount?.amount).to.equal(30.00)
        expect(rPiLineItem.discount?.description).to.equal(promo.description)
    });

    it("applies a discount for 2 rapsberry pis when ordering 2 macbook pros", () => {
        const mbpLineItem: LineItem = {product: mbp, quantity: 2, amount: mbp.price * 2}
        const rPiLineItem: LineItem = {product: rPi, quantity: 3, amount: rPi.price * 3}

        SiriApplyPromo({lineItems: [mbpLineItem, rPiLineItem]}, mbpLineItem, promo)

        expect(rPiLineItem.discount?.amount).to.equal(60.00)
        expect(rPiLineItem.discount?.description).to.equal(promo.description)
    });
});

describe("applyActivePromotions", () => {
    it("applies promotions", () => {
        const alexaLineItem: LineItem = {product: ALEXA_SPEAKER, quantity: 3, amount: ALEXA_SPEAKER.price * 3}
        const googleHomeLineItem: LineItem = {product: GOOGLE_HOME, quantity: 3, amount: GOOGLE_HOME.price * 3}
        const mbpLineItem: LineItem = {product: MACBOOK_PRO, quantity: 1, amount: MACBOOK_PRO.price}
        const rPiLineItem: LineItem = {product: RASPBERRY_PI, quantity: 1, amount: RASPBERRY_PI.price}

        applyActivePromotions({lineItems: [alexaLineItem, googleHomeLineItem, mbpLineItem, rPiLineItem]});

        expect(alexaLineItem.discount?.amount).to.equal(32.85);
        expect(googleHomeLineItem.discount?.amount).to.equal(49.99);
        expect(mbpLineItem.discount).to.be.undefined;
        expect(rPiLineItem.discount?.amount).to.equal(30);
    })
})