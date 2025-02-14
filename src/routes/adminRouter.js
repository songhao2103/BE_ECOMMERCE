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

export default adminRouter;
