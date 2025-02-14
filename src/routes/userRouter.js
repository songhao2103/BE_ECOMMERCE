import express from "express";
import UserController from "../controllers/userController.js";
import authenToken from "../middlewares/authenToken.js";

const userRouter = express.Router();

//lấy thông tin người dùng hiện tại thông qua token
userRouter.get("/", authenToken, UserController.getUser);

export default userRouter;
