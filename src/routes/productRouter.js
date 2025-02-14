import express from "express";
import productController from "../controllers/productController.js";

const productRouter = express.Router();

productRouter.get("/products-sale", productController.getProductsSale);

productRouter.get("/product-selling", productController.getProductSelling);

productRouter.get(
  "/product-detail/:productId",
  productController.getProductDetail
);

export default productRouter;
