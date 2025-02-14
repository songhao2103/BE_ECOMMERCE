import express from "express";
import storeController from "../controllers/storeController.js";
import authenToken from "../middlewares/authenToken.js";
import authenProductData from "../middlewares/store/authenProductData.js";
import uploadFile from "../middlewares/store/uploadFile.js";
import uploadFileMulter from "../middlewares/store/uploadFileMulter.js";

const storeRouter = express.Router();

//admin tạo store mới
storeRouter.post("/create", authenToken, storeController.createStore);

//the store add new product
storeRouter.post(
  "/add-product/:storeId",
  uploadFileMulter,
  authenToken,
  authenProductData,
  uploadFile,
  storeController.addProduct
);

//get-store address in order page
storeRouter.post("/get-address", authenToken, storeController.getAddressStore);

export default storeRouter;
