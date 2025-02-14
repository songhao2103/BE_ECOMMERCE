import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const authenToken = (req, res, next) => {
  //lấy token tử header của req
  const token = req.headers["authorization"].split(" ")[1];

  if (!token) {
    return res.status(401).send("Chưa đăng nhập!!");
  }

  try {
    //kiểm tra token được gửi lên
    const checkToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    //đưa id của người dùng có trong token cho các hàm tiếp theo của request
    req.userId = checkToken.userId;
    next();
  } catch (error) {
    res.status(403).json({
      message: "Token không hợp lệ, " + error.message,
      token: token,
    });
  }
};

export default authenToken;
