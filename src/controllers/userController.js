// import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../models/userModel.js";
import Cart from "../models/cartModel.js";
import passwordHandling from "../utils/passwordHandling.js";

dotenv.config();

const UserController = {
  //lấy thông tin người dùng
  //[GET], /user/:userId
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

  //[POST] /user/update-profile-user/:userId
  updateProfileUser: async (req, res) => {
    const { userId } = req.params;
    const { formData, addressSelect, isEmailChange } = req.body;

    try {
      //tạo mới address
      const newAddressSelect = {
        ...(addressSelect && { ...addressSelect }),
        ...(formData.specific && { specific: formData.specific }),
      };

      //kiểm tra email
      if (isEmailChange) {
        const currentUser = await User.findOne({ email: formData.email });
        if (currentUser) {
          return res
            .status(400)
            .json({ success: false, error: "Email này đã tồn tại!!" });
        }
      }

      //cập nhật user
      const userUpdated = await User.findByIdAndUpdate(userId, {
        $set: {
          userName: formData.userName,
          email: formData.email,
          ...(formData.phoneNumber && { phoneNumber: formData.phoneNumber }),
          ...(newAddressSelect && { address: newAddressSelect }),
        },
      });

      res.status(200).json({
        success: true,
      });
    } catch (error) {
      console.log(
        "Lỗi server khi cập nhật profile người dùng! error: " + error.message
      );
      res
        .status(500)
        .send(
          "Lỗi server khi cập nhật profile người dùng! error: " + error.message
        );
    }
  },

  //[POST] /user/update-avatar-user/:userId
  updateAvatarUser: async (req, res) => {
    const { userId } = req.params;
    const fileAvatar = req.fileAvatar;
    try {
      //tìm kiếm người dùng và cập nhật
      const newUser = await User.findByIdAndUpdate(
        userId,
        {
          $set: { avatar: fileAvatar.url },
        },
        { new: true }
      );

      if (!newUser) {
        throw new Error("Không tìm thấy người dùng!!");
      }
      res.status(200).json({ success: true, urlAvatar: fileAvatar.url });
    } catch (error) {
      console.log(
        "Lỗi server khi cập nhật avatar người dùng!!" + error.message
      );

      res
        .status(500)
        .send("Lỗi server khi cập nhật avatar người dùng!!" + error.message);
    }
  },

  //[POST] //user/change-password/:userId
  changePassword: async (req, res) => {
    const { userId } = req.params;
    const formData = req.body;

    try {
      const currentUser = await User.findById(userId);

      if (!currentUser) {
        throw new Error("Không tìm thấy người dùng!!");
      }

      const isPasswordMatch = await passwordHandling.verify(
        formData.oldPassword,
        currentUser.password
      );

      if (!isPasswordMatch) {
        res.status(200).json({
          success: false,
          error: {
            oldPassword: "Mật khẩu cũ không đúng, thử lại!!",
            newPassword: "",
            reNewPassword: "",
          },
          formData: formData,
        });
      }

      currentUser.password = passwordHandling.hashing(formData.newPassword);

      await currentUser.save();

      res.status(200).json({
        success: true,
      });
    } catch (error) {
      console.log(
        "Lỗi server khi thay đổi mật khẩu người dùng!! error: " + error.message
      );

      res
        .status(500)
        .send(
          "Lỗi server khi thay đổi mật khẩu người dùng!! error: " +
            error.message
        );
    }
  },
};

export default UserController;
