import express from "express";
import authenToken from "../middlewares/authenToken.js";
import adminController from "../controllers/adminController.js";

const adminRouter = express.Router();

//lấy danh sách các lựa chọn ở trang <ProductConfirm></ProductConfirm>
adminRouter.get(
  "/get-select-product-confirm",
  authenToken,
  adminController.adminGetSelects
);

//lấy danh sách các sản phẩm ở trang <ProductConfirm></ProductConfirm>
adminRouter.post(
  "/get-product-pending",
  authenToken,
  adminController.adminProductComfirm
);

//accept sản phẩm mà cửa hàng thêm mới
adminRouter.post(
  "/accept-products",
  authenToken,
  adminController.adminAcceptProduct
);

//admin từ chối sản phẩm
adminRouter.post(
  "/refuse-product",
  authenToken,
  adminController.adminRefuseProduct
);

//admin lấy danh sách đơn hàng đang được giao
adminRouter.get(
  "/get-orders-shipping",
  authenToken,
  adminController.getOrderShipping
);

//admin complete đơn hàng
adminRouter.get(
  "/admin-complete-order/:orderId",
  adminController.completeOrder
);

export default adminRouter;
