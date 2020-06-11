import {ArrayMinSize, IsAlphanumeric, IsInt, IsPositive, Length, ValidateNested} from "class-validator";

export const ALEXA_SPEAKER = {sku: "A304SD", name: "Alexa Speaker", price: 109.50}
export const GOOGLE_HOME = {sku: "120P90", name: "Google Home", price: 49.99}
export const MACBOOK_PRO = {sku: "43N23P", name: "MacBook Pro", price: 5399.99}
export const RASPBERRY_PI = {sku: "234234", name: "Raspberry Pi", price: 30.00}

export interface Cart {
    [sku: string]: number;
}

export class Checkout {
    constructor(items: CartItem[]) {
        this.items = items;
    }

    @ArrayMinSize(1)
    @ValidateNested()
    items: CartItem[]
}

export class CartItem {
    constructor(sku: string, qty: number) {
        this.sku = sku;
        this.qty = qty
    }

    @IsAlphanumeric()
    @Length(6, 8)
    sku: string;

    @IsInt()
    @IsPositive()
    qty: number;
}

export interface Order {
    lineItems: LineItem[];
    total?: number;
}

export interface Product {
    sku: string;
    name: string;
    price: number;
}

export interface DbProduct extends Product {
    qty: number;
}

export interface LineItem {
    product: Product;
    quantity: number;
    amount: number;
    discount?: Discount;
    total?: number;
}

export interface Discount {
    amount: number;
    description: string;
}

export interface Promotion {
    sku: string;
    description: string;
    apply: PromoApplicationFn;
}

type PromoApplicationFn = (order: Order, lineItem: LineItem, promo: Promotion) => void;

export class ProductNotFoundError extends Error {
    constructor(sku: string) {
        super(`SKU: '${sku}' not found!!`);
        this.sku = sku;
    }

    sku: string;
}

export function notUndefined<T>(x: T | undefined): x is T {
    return x !== undefined;
}

export const roundMoney = (amount: number) => Math.round(amount * 100) / 100