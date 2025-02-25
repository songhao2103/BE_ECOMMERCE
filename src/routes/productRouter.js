import express from "express";
import productController from "../controllers/productController.js";

const productRouter = express.Router();

productRouter.post(
  "/get-product-search-home-page",
  productController.getProductsSearchHomePage
);

productRouter.get("/products-sale", productController.getProductsSale);

productRouter.get("/product-selling", productController.getProductSelling);

productRouter.get(
  "/product-detail/:productId",
  productController.getProductDetail
);

productRouter.post("/get-products", productController.getProducts);

productRouter.get("/get-type-filter", productController.getTypeFilter);

export default productRouter;
