import express from "express";
import authController from "../controllers/authController.js";
import authenLogInData from "../middlewares/authenLogInData.js";

const authRouter = express.Router();
//đăng ký
authRouter.post("/register", authController.register);

//đăng nhập
authRouter.put("/login", authenLogInData, authController.login);

//cập nhật lại access token bằng refresh token
authRouter.get ("/refresh-token", authController.refreshToken);

export default authRouter;
