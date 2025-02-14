// import mongoose from "mongoose";
import User from "../models/userModel.js";
import Cart from "../models/cartModel.js";

const UserController = {
  //lấy thông tin người dùng
  //[GET], user/:userId
  getUser: async (req, res) => {
    //được truyền từ middleware xác thực token
    const userId = req.userId;

    try {
      const currentUser = await User.findById(userId);

      if (!currentUser) {
        return res.status(400).json({
          message: "Không tìm thấy thông tin người dùng!",
          userId: userId,
        });
      }

      const currentCart = await Cart.findOne({ userId: currentUser._id });

      res.status(200).json({
        message: "Lấy thông tin user thành công!!",
        user: currentUser,
        cart: currentCart ? currentCart : {},
      });
    } catch (error) {
      res.status(500).send("Lỗi khi lấy thông tin người dùng!", error.message);
    }
  },
};

export default UserController;
