// uploadConfig.js
import multer from "multer";

// Cấu hình Multer
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

export default upload;
