import express from "express";
import orderController from "../controllers/orderController.js";
import authenToken from "../middlewares/authenToken.js";

const orderRouter = express.Router();

// create order
orderRouter.post("/create-order", authenToken, orderController.createOrder);

export default orderRouter;
