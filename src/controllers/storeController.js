import Store from "../models/storeModel.js";
import User from "../models/userModel.js";
import Product from "../models/productModel.js";

const storeController = {
  //[post] /store/create  // create new store
  createStore: async (req, res) => {
    const { storeName, storeEmail } = req.body;

    const newErrors = {
      storeName: "",
      storeEmail: "",
    };

    try {
      if (!storeName || !storeEmail) {
        newErrors.storeEmail = "Missing data!";

        return res.status(400).json({
          message: "Create new store failed!!",
          errors: newErrors,
          success: false,
        });
      }

      const nameExists = await Store.findOne({ storeName });
      const emailExists = await User.findOne({ email: storeEmail });

      if (!!nameExists) {
        newErrors.storeName = "The store name already exists!";

        return res.status(400).json({
          message: "Create new store failed!!",
          errors: newErrors,
          success: false,
        });
      }

      if (!emailExists) {
        newErrors.storeEmail = "Email is not registered!";

        return res.status(400).json({
          message: "Create new store failed!!",
          errors: newErrors,
          success: false,
        });
      }

      const newStore = new Store({
        storeName,
      });

      await newStore.save();

      emailExists.role = "store";
      emailExists.storeId = newStore.id;
      await emailExists.save();

      res.status(200).json({
        message: "Successfully created a new store!!",
        errors: newErrors,
        success: true,
      });
    } catch (error) {
      res.status(500).send("Lỗi server khi tạo mới store " + error.message);
    }
  },

  //[post] /store/add-product/:storeId
  addProduct: async (req, res) => {
    //lấy ở middleware authenProductData
    let currentStore = req.currentStore;
    const formData = req.formData;
    const listImages = req.listImages;

    try {
      //create images array
      let images = [];
      if (listImages.newBlackImage) {
        images.push({
          ...listImages.newBlackImage,
          color: "black",
        });
      }

      if (listImages.newWhiteImage) {
        images.push({
          ...listImages.newWhiteImage,
          color: "white",
        });
      }

      if (listImages.newPinkImage) {
        images.push({
          ...listImages.newPinkImage,
          color: "pink",
        });
      }

      if (listImages.newOtherImages) {
        images = [...images, ...listImages.newOtherImages];
      }

      //tạo mới sản phẩm
      const newProduct = new Product({
        ...formData,
        images: images,
        storeName: currentStore.storeName,
      });

      currentStore.products.push(newProduct.id);
      await newProduct.save();
      await currentStore.save();

      res.status(200).json({
        message: "Added new product successfully!!!",
        success: true,
        error: "",
      });
    } catch (error) {
      console.log(
        "Server error when updating new products!! --file: storeController.addProduct--" +
          error.message
      );
      res
        .status(500)
        .send(
          "Server error when updating new products!! --file: storeController.addProduct--" +
            error.message
        );
    }
  },

  //[POST] /store/get-address
  getAddressStore: async (req, res) => {
    const orderList = req.body;

    try {
      //Lấy danh sách storeName duy nhất
      const storeNames = [
        ...new Set(orderList.map((order) => order.storeName)),
      ];

      //Query cơ sở dữ liệu để lấy các cửa hàng đó
      const stores = await Store.find({ storeName: { $in: storeNames } });

      //  Tạo bảng tra cứu từ storeName sang storeAddress
      const storeLookup = {};
      stores.forEach((store) => {
        storeLookup[store.storeName] = store.storeAddress;
      });

      // Map qua orderList và thêm storeAddress tương ứng
      const newOrderList = orderList.map((order) => ({
        ...order,
        storeAddress: storeLookup[order.storeName] || null,
      }));

      return res.status(200).json(newOrderList);
    } catch (error) {
      console.error("Error in getAddressStore:", error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  },
};

export default storeController;
