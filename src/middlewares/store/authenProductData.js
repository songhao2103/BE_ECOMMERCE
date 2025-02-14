import Product from "../../models/productModel.js";
import Store from "../../models/storeModel.js";

const authenProductData = async (req, res, next) => {
  const formData = JSON.parse(req.body.formDataJson);
  const blackImage = req.files.blackImage ? req.files.blackImage[0] : null;
  const whiteImage = req.files.whiteImage ? req.files.whiteImage[0] : null;
  const pinkImage = req.files.pinkImage ? req.files.pinkImage[0] : null;
  const otherImages = req.files.otherImages;

  const { storeId } = req.params;

  try {
    //check store
    const currentStore = await Store.findById(storeId);

    if (!currentStore) {
      res.status(400).json({
        message: "Adding new product failed!!",
        success: false,
        error: "Store not found!!",
      });
      return;
    }

    //validate form data

    if (
      !formData.productName ||
      !formData.describe ||
      !formData.price ||
      !formData.discount ||
      !formData.company ||
      !formData.deviceType ||
      !formData.totalQuantity
    ) {
      res.status(400).json({
        message: "Adding new product failed",
        success: false,
        error: "Missing data!!",
      });
      return;
    }

    if (!blackImage && !whiteImage && !pinkImage) {
      res.status(400).json({
        message: "Adding new product failed",
        success: false,
        error: "Missing images!!",
      });
      return;
    }

    if (
      (!!blackImage && !formData.blackQuantity) ||
      (!!whiteImage && !formData.whiteQuantity) ||
      (!!pinkImage && !formData.pinkQuantity)
    ) {
      res.status(400).json({
        message: "Adding new product failed",
        success: false,
        error: "Missing quantity!!",
      });
      return;
    }

    if (isNaN(formData.price)) {
      res.status(400).json({
        message: "Adding new product failed",
        success: false,
        error: "Price is not in correct format!!",
      });
      return;
    }

    if (
      isNaN(formData.discount) ||
      formData.discount < 0 ||
      formData.discount > 100
    ) {
      res.status(400).json({
        message: "Adding new product failed",
        success: false,
        error: "Discount is not in correct format!!",
      });
      return;
    }

    //check the name of product
    const currentProduct = await Product.findOne({
      productName: formData.productName,
    });

    if (!!currentProduct) {
      res.status(400).json({
        message: "Adding new product failed!!",
        error: "Duplicate product name!!",
        success: false,
      });
      return;
    }

    //gửi dữ liệu sang storeController.addProduct
    req.currentStore = currentStore;
    req.formData = formData;
    req.blackImage = blackImage;
    req.whiteImage = whiteImage;
    req.pinkImage = pinkImage;
    req.otherImages = otherImages;

    next();
  } catch (error) {
    console.log(
      "authenProductData:  Server error when adding new product!! " +
        error.message
    );
    res
      .status(500)
      .send("Server error when adding new product!! " + error.message);
  }
};

export default authenProductData;
