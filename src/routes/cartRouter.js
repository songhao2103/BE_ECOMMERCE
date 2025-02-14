import express from "express";
import cartController from "../controllers/cartController.js";
import authenToken from "../middlewares/authenToken.js";

const cartRouter = express.Router();

//Thêm sản phẩm mới vào cart
cartRouter.post(
  "/add-product-to-cart",
  authenToken,
  cartController.addproductToCart
);

//lấy danh sách sản phẩm của giỏ hàng
cartRouter.post("/products", authenToken, cartController.getProductsOfCart);

//cập nhật lại giỏ hàng
cartRouter.post("/update-cart", authenToken, cartController.updateCart);

export default cartRouter;
