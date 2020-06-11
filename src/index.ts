import * as dotenv from "dotenv";
import express from "express";
import {Logger} from "tslog";
import {checkoutHandler, checkoutValidatorMiddleware} from "./api/checkout";
import {initDb} from "./lanazon/database";
import {allProducts} from "./api/products";
import morgan from "morgan"
import * as swaggerUi from "swagger-ui-express"
import * as swaggerDocument from "../swagger.json"

const log: Logger = new Logger({name: "expressLogger"});

dotenv.config();

//express app
const PORT: number = parseInt(process.env.PORT as string, 10);
const app = express();

app.use(morgan('dev'))
app.use(express.json());

initDb().then((db) => {
    app.get("/api/products", allProducts(db));
    app.post("/api/checkout", checkoutValidatorMiddleware, checkoutHandler(db));
});

app.listen(PORT, () => {
    log.info(`Server is running in http://localhost:${PORT}`);
})

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));