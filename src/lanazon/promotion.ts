import {
    ALEXA_SPEAKER,
    GOOGLE_HOME,
    MACBOOK_PRO,
    RASPBERRY_PI,
    LineItem,
    Order,
    Promotion,
    roundMoney
} from "./definitions";

export const HeyGoogleApplyPromo = (order: Order, lineItem: LineItem, promo: Promotion): void => {
    const {quantity, product: {price}} = lineItem;
    if (quantity >= 3) {
        const freeDevices = Math.floor(quantity / 3)
        lineItem.discount = {amount: roundMoney(freeDevices * price), description: promo.description}
    }
}

export const AlexaApplyPromo = (order: Order, lineItem: LineItem, promo: Promotion): void => {
    const {quantity, amount} = lineItem;
    if (quantity >= 3) {
        lineItem.discount = {amount: roundMoney(amount * 0.10), description: promo.description}
    }
}

//Expand the cart here if it doesn't exist? Seems that it should be a param passed in to take that action of adding items to a cart.
export const SiriApplyPromo = (order: Order, lineItem: LineItem, promo: Promotion): void => {
    const mbpQuantity = lineItem.quantity
    const piLineItem = order.lineItems.find(li => li.product.sku === RASPBERRY_PI.sku)//TODO fix with Enum or something?
    if (piLineItem) {
        piLineItem.discount = {
            amount: roundMoney(Math.min(mbpQuantity, piLineItem.quantity) * piLineItem.product.price),
            description: promo.description
        }
    }
}

export const mbpPromotion = {
    sku: MACBOOK_PRO.sku,
    description: "Each sale of a MacBook Pro comes with a free Raspberry Pi B",
    apply: SiriApplyPromo
}
export const googleHomePromotion = {
    sku: GOOGLE_HOME.sku,
    description: "Buy 3 Google Homes for the price of 2",
    apply: HeyGoogleApplyPromo
}
export const alexaPromotion = {
    sku: ALEXA_SPEAKER.sku,
    description: "Buying more than 3 Alexa Speakers will have a 10% discount on all Alexa speakers",
    apply: AlexaApplyPromo
}
const promotions: Promotion[] = [mbpPromotion, googleHomePromotion, alexaPromotion];

export type PromotionMap = Map<string, Promotion>;
export const activePromotions: PromotionMap = new Map<string, Promotion>(promotions.map(promo => [promo.sku, promo]));

export const applyActivePromotions = (order: Order): void => {
    const promoApplicator = (promos: PromotionMap) => (lineItem: LineItem) => {
        const promo = promos.get(lineItem.product.sku);
        if (promo) {
            promo.apply(order, lineItem, promo)
        }
    }
    order.lineItems.forEach(promoApplicator(activePromotions))
}