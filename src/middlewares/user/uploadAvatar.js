import { uploadSingleFile } from "../../utils/uploadFile.js";
const uploadAvatar = async (req, res, next) => {
  try {
    const fileAvatar = req.file;
    if (!fileAvatar) {
      throw new Error("Lỗi khi lấy file avatar!!");
    }
    const fileAvatarAfterUpload = await uploadSingleFile(fileAvatar);
    req.fileAvatar = fileAvatarAfterUpload;
    next();
  } catch (error) {
    console.log("Lỗi server khi cập nhật avatar!! error: " + error.message);

    res
      .status(500)
      .send("Lỗi server khi cập nhật avatar!! error: ", error.message);
  }
};

export default uploadAvatar;
