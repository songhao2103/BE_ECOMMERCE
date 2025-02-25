import express from "express";
import orderController from "../controllers/orderController.js";
import authenToken from "../middlewares/authenToken.js";

const orderRouter = express.Router();

// create order
orderRouter.post("/create-order", authenToken, orderController.createOrder);

//lấy danh sách order của người dùng
orderRouter.get(
  "/order-of-user/:userId",
  authenToken,
  orderController.getOrderOfUser
);

//cửa hàng xác nhận đơn hàng
orderRouter.post(
  "/store-confirm-order",
  authenToken,
  orderController.storeConfirmOrder
);

//cửa hàng từ chối nhận đơn hàng
orderRouter.get(
  "/store-reject-order/:orderId",
  authenToken,
  orderController.storeRejectOrder
);

//người dùng hủy đơn hàng
orderRouter.get(
  "/cancel-order/:orderId",
  authenToken,
  orderController.userCancelOrder
);

export default orderRouter;
