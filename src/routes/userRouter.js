import express from "express";
import UserController from "../controllers/userController.js";
import authenToken from "../middlewares/authenToken.js";
import uploadFileMuterSingle from "../middlewares/user/uploadFileMuterSingle.js";
import uploadAvatar from "../middlewares/user/uploadAvatar.js";

const userRouter = express.Router();

//thay đổi mật khẩu
userRouter.post(
  "/change-password/:userId",
  authenToken,
  UserController.changePassword
);

//cập nhật avatar user
userRouter.post(
  "/update-avatar-user/:userId",
  uploadFileMuterSingle,
  authenToken,
  uploadAvatar,
  UserController.updateAvatarUser
);

//cập nhật thông tin user
userRouter.post(
  "/update-profile-user/:userId",
  authenToken,
  UserController.updateProfileUser
);

//lấy thông tin người dùng hiện tại thông qua token
userRouter.get("/", authenToken, UserController.getUser);

export default userRouter;
