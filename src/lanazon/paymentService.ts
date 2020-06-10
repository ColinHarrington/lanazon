import {Order} from "./definitions";
import {Logger} from "tslog";

const log: Logger = new Logger({name: "paymentLogger"});

export const capturePayment = async (order: Order) => log.info("Pretending to capture payment") //TODO update order status to 'Charged'