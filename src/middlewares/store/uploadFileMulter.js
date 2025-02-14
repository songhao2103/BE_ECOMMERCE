// middleware/uploadMiddleware.js
import upload from "../../../config/uploadFile.js";

const uploadMiddleware = upload.fields([
  { name: "blackImage", maxCount: 1 }, // File đơn
  { name: "whiteImage", maxCount: 1 }, // File đơn
  { name: "pinkImage", maxCount: 1 }, // File đơn
  { name: "otherImages", maxCount: 10 }, // Mảng file
  { name: "formDataJson", maxCount: 1 },
]);

export default uploadMiddleware;
