import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import dbConnect from "./config/db.js";
import route from "./src/routes/indexRouter.js";
import Product from "./src/models/productModel.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 2103;

// express middleware
app.use(express.json());
app.use(cookieParser());

//connect database
dbConnect();

//cấu hình origin
app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true, // Nếu cần gửi cookie, session
  })
);

app.options("*", cors()); // Đảm bảo tất cả yêu cầu OPTIONS được xử lý

//route
route(app);

// API thử nghiệm
app.get("/check", async (req, res) => {
  const product = await Product.find();
  res.send(product[0]);
});

//+=======================================================
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}...`);
});
