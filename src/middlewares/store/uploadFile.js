// import upload from "../../config/uploadFile.js";
import {
  uploadSingleFile,
  uploadMultipleFiles,
} from "../../utils/uploadFile.js";

const uploadFile = async (req, res, next) => {
  //lấy ở middleware authenProductData
  const blackImage = req.blackImage;
  const whiteImage = req.whiteImage;
  const pinkImage = req.pinkImage;
  const otherImages = req.otherImages;

  try {
    //upload black image
    const newBlackImage = blackImage
      ? await uploadSingleFile(blackImage)
      : null;
    const newWhiteImage = whiteImage
      ? await uploadSingleFile(whiteImage)
      : null;
    const newPinkImage = pinkImage ? await uploadSingleFile(pinkImage) : null;
    const newOtherImages = otherImages
      ? await uploadMultipleFiles(otherImages)
      : null;

    req.listImages = {
      newBlackImage,
      newWhiteImage,
      newPinkImage,
      newOtherImages,
    };

    next();
  } catch (error) {
    res.status(500).send("Server error when uploading file!! " + error.message);
  }
};

export default uploadFile;
