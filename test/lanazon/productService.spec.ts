import {initDb} from "../../src/lanazon/database";
import {getAllProducts, productsBySkus} from "../../src/lanazon/productService";
import {ALEXA_SPEAKER, GOOGLE_HOME, MACBOOK_PRO, RASPBERRY_PI} from "../../src/lanazon/definitions";
import {expect} from "chai";

describe("productService", () => {

    describe("productsBySkus", () => {
        it("retrieves products", async () => {
            const db = await initDb();
            const skus = [GOOGLE_HOME.sku, ALEXA_SPEAKER.sku]
            return productsBySkus(db, skus).then((products) => {
                expect(products).length(2)
                expect(products.find(p=> p.sku === GOOGLE_HOME.sku)).eql({...GOOGLE_HOME, qty: 10})
                expect(products.find(p=> p.sku === ALEXA_SPEAKER.sku)).eql({...ALEXA_SPEAKER, qty: 10})
            });
        });
    });

    describe("all", () => {
        it("retrieves all products", async () => {
            const db = await initDb();
            return getAllProducts(db).then((products) => {
                expect(products).length(4)
                expect(products.find(p=> p.sku === GOOGLE_HOME.sku)).eql({...GOOGLE_HOME, qty: 10})
                expect(products.find(p=> p.sku === ALEXA_SPEAKER.sku)).eql({...ALEXA_SPEAKER, qty: 10})
                expect(products.find(p=> p.sku === MACBOOK_PRO.sku)).eql({...MACBOOK_PRO, qty: 5})
                expect(products.find(p=> p.sku === RASPBERRY_PI.sku)).eql({...RASPBERRY_PI, qty: 2})
            });
        });
    })
});