import express from "express";
import productController from "../controllers/productController.js";

const productRouter = express.Router();

productRouter.get(
  "/get-products-of-search",
  productController.getProductsOfSearch
);

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
productRouter.get("/get-products", productController.getProductsV2);

productRouter.get("/get-type-filter", productController.getTypeFilter);

export default productRouter;
