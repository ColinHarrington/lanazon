import {Database} from "sqlite";
import {Request, Response} from "express";
import {getAllProducts} from "../lanazon/productService";

export const allProducts = (db: Database) => async (req: Request, res: Response): Promise<void> => {
    getAllProducts(db)
        .then(products => res.json({products:products}))
        .catch((err) => res.json({error: err}))
}