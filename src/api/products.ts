import {Database} from "sqlite";
import {Request, Response} from "express";
import {all} from "../lanazon/productService";

export const allProducts = (db: Database) => async (req: Request, res: Response) => {
    all(db)
        .then(products => res.json({products:products}))
        .catch((err) => res.json({error: err}))
}