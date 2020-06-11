import {Database} from "sqlite";
import {DbProduct} from "./definitions";

export const productsBySkus = async (db: Database, skus: string[]): Promise<DbProduct[]> =>
    db.all(`SELECT sku, name, price, qty FROM PRODUCT where sku in (${skus.map(() => '?').join(',')})`, skus)
        .then(rows => rows.map(row => row as DbProduct));

export const getAllProducts = async (db: Database): Promise<DbProduct[]> => {
    return db.all("SELECT sku, name, price, qty FROM Product").then(rows => rows.map(row => row as DbProduct))
}