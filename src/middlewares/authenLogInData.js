import dotenv from "dotenv";

import passwordHandling from "../utils/passwordHandling.js";
import User from "../models/userModel.js";

dotenv.config();

const authenLogInData = async (req, res, next) => {
  const { email, password } = req.body;
  const newErrors = {
    email: "",
    password: "",
  };

  const currentUser = await User.findOne({ email: email });

  try {
    //kiểm tra email
    if (!email) {
      newErrors.email = "Email không được để trống!!";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Email không đúng định dạng!!";
    } else if (!currentUser) {
      newErrors.email = "Email không đúng, thử lại!!";
    }

    //kiểm tra password
    if (!password) {
      newErrors.password = "Password không được để trống!!";
    } else if (!!currentUser) {
      const isPasswordMatch = await passwordHandling.verify(
        password,
        currentUser.password
      );

      if (!isPasswordMatch) {
        newErrors.password = "Password không đúng, thử lại!!!";
      }
    }

    if (!newErrors.email && !newErrors.password) {
      req.currentUser = currentUser;
      return next();
    }

    return res.status(400).json({
      message: "Đăng nhập không thành công!",
      success: false,
      errors: newErrors,
    });
  } catch (error) {
    res
      .status(500)
      .send(` Lỗi server khi thực hiện đăng nhập ${error.message}`);
  }
};

export default authenLogInData;
