import {Database} from "sqlite";
import {DbProduct} from "./definitions";

export const productsBySkus = async (db: Database, skus: string[]) => db.all(`SELECT sku, name, price, qty FROM PRODUCT where sku in (${skus.map(sku => '?').join(',')})`, skus)
    .then(rows => rows.map(row => row as DbProduct));

export const all = async (db: Database) => {
    return db.all("SELECT sku, name, price, qty FROM Product").then(rows=> rows.map(row => row as DbProduct))
}