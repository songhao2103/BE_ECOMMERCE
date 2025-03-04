import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import passwordHandling from "../utils/passwordHandling.js";
import User from "../models/userModel.js";
import Cart from "../models/cartModel.js";

dotenv.config();

const authController = {
  //[POST] /register
  register: async (req, res) => {
    const { userName, email, password, rePassword } = req.body;
    const errors = {
      userName: "",
      email: "",
      password: "",
      rePassword: "",
    };

    try {
      //kiểm tra userName
      if (!userName) {
        errors.userName = "Name không được để trống!";
      }

      //Kiểm tra email

      if (!email) {
        errors.email = "Email không được để trống!";
      } else {
        const currentUser = await User.findOne({ email: email });

        if (!!currentUser) {
          errors.email = "Email đã được đăng ký!!";
        }
      }

      //Kiểm tra password
      if (!password) {
        errors.password = "Password không được để trống!";
      }

      //kiểm tra re-password
      if (!rePassword) {
        errors.rePassword = "Re-Password không được để trống!";
      } else if (rePassword !== password) {
        errors.password = "Mật khẩu không khớp!";
      }

      //nếu tất cả thông tin hợp lệ thì thêm user mới vào database
      if (
        !errors.userName &&
        !errors.email &&
        !errors.password &&
        !errors.rePassword
      ) {
        //tạo user mới với model User
        const newUser = new User({
          userName,
          email,
          password: passwordHandling.hashing(password),
        });

        //lưu vào database
        await newUser.save();

        return res.status(200).json({
          success: true,
          message: "Đăng ký thành công!!",
        });
      }

      res.status(400).json({
        success: false,
        errors: errors,
        message: "Đăng ký không thành công!!",
        formData: { userName, email, password, rePassword },
      });
    } catch (error) {
      res
        .status(500)
        .send(` Lỗi ở server khi người dùng đăng ký ${error.message}`);
    }
  },

  //[PUT] /login
  login: async (req, res) => {
    const currentUser = req.currentUser;
    try {
      //lấy giỏ hàng của user
      const currentCart = await Cart.findOne({ userId: currentUser._id });
      //tạo access token
      const accessToken = jwt.sign(
        {
          userId: currentUser.id,
        },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: "20s" }
      );

      //tạo refresh token
      const refreshToken = jwt.sign(
        {
          userId: currentUser.id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: "30d" }
      );

      res
        .status(200)

        //cập nhật refreshToken vào cookie
        .cookie("refreshToken", refreshToken, {
          sameSite: "none",
          secure: true,
        })

        //trả về data cho client
        .json({
          message: "Đăng nhập thành công!!",
          success: true,
          accessToken: accessToken, //trả về accessToken để client cập nhật vào LocalStorage
          user: currentUser, // trả về cho client thông tin người dùng đang đăng nhập để cập nhật vào state của redux
          cart: currentCart,
        });
    } catch (error) {
      res
        .status(500)
        .send(` Lỗi server khi thực hiện đăng nhập ${error.message}`);
    }
  },

  //[PUT]  /refresh-token
  refreshToken: async (req, res) => {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(403).send("Không có refresh token!");
    }

    try {
      //kiểm tra refresh token có hợp lệ không
      const checkRefreshToken = jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET
      );

      //lấy thông tin của người dùng gửi về client để cập nhật lại userLogged state của redux
      const currentUser = await User.findById(checkRefreshToken.userId);

      //tạo ra access token mới
      const newAccessToken = jwt.sign(
        { userId: checkRefreshToken.userId },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: "20s" }
      );

      res.status(200).json({
        message: "Cập nhật lại token thành công haha!!",
        accessToken: newAccessToken,
        user: currentUser,
      });
    } catch (error) {
      res
        .status(500)
        .send(
          ` Lỗi server khi thực hiện cập nhật lại refresh token ${error.message}`
        );
    }
  },
};

export default authController;
