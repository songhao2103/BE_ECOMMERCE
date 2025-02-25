import Store from "../models/storeModel.js";
import User from "../models/userModel.js";
import Product from "../models/productModel.js";
import Order from "../models/orderModel.js";

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

  //[GET] /store/get-store-orders-list  //lấy danh sách đơn hàng của cửa hàng
  getStoreOrdersList: async (req, res) => {
    const { storeId } = req.params;
    try {
      //lấy thông tin của cửa hàng hiện tại
      const currentStore = await Store.findById(storeId).lean();

      //lấy danh sách đơn hàng của cửa hàng
      const storeOrdersList = await Order.find({
        storeName: currentStore.storeName,
      }).lean();

      //tập hợp tất cả các Id của sản phẩm để query 1 lần
      const allProductsId = storeOrdersList.reduce((acc, order) => {
        order.products.forEach((product) => {
          acc.push(product.productId);
        });
        return acc;
      }, []);

      //tập hợp tất cả các id của người dùng đặt đơn hàng
      const allUserIds = storeOrdersList.reduce((acc, order) => {
        acc.push(order.userId);
        return acc;
      }, []);

      //loại bỏ các id trùng lặp
      const uniqueProductIds = [...new Set(allProductsId)];

      //loại bỏ các giá trị trùng lặp của userIds
      const uniqueUserIds = [...new Set(allUserIds)];

      //query để lấy danh sách sản phẩm
      const productsList = await Product.find({
        _id: { $in: uniqueProductIds },
      });

      //query để lấy danh sách user
      const usersList = await User.find({
        _id: { $in: uniqueUserIds },
      });

      //tạo map có key là Id của sản phẩm và value là thông tin của sản phẩm đó
      const productsMap = productsList.reduce((map, product) => {
        map[product._id.toString()] = product;
        return map;
      }, {});

      //tạo map có key là id của user và value là thông tin của user đó
      const usersMap = usersList.reduce((map, user) => {
        map[user._id.toString()] = user;
        return map;
      }, {});

      //cập nhật lại thông tin đơn hàng, thêm các thông tin cần thiết của sản phẩm
      const updateStoreOrdersList = storeOrdersList.map((order) => {
        //lấy thông tin người dùng tương ứng
        const currentUser = usersMap[order.userId];

        if (!currentUser) {
          throw new Error({
            message: "Lỗi khi không tìm thấy người dùng tương ứng với order",
            order: order,
          });
        }

        const newProductsList = order.products.map((productOfOrder) => {
          //lấy thông tin sản phẩm tương ứng
          const currentProduct = productsMap[productOfOrder.productId];

          if (!currentProduct) {
            throw new Error({
              message: "Lỗi khi không không tìm thấy sản phẩm tương ứng!!r",
              productOfOrder: productOfOrder,
            });
          }

          const imageOrder = currentProduct.images.find(
            (image) => image.color === productOfOrder.color
          );

          return {
            ...productOfOrder,
            imageOrder: imageOrder,
            productName: currentProduct.productName,
            discount: currentProduct.discount,
            price: currentProduct.price,
            quantityStock: currentProduct[productOfOrder.color + "Quantity"],
          };
        });

        return {
          ...order,
          products: newProductsList,
          userName: currentUser.userName,
        };
      });

      res.status(200).send(updateStoreOrdersList);
    } catch (error) {
      console.log(
        "Lỗi server khi lấy danh sách các đơn hàng của cửa hàng!! error: " +
          error.message
      );

      res
        .status(500)
        .send(
          "Lỗi server khi lấy danh sách các đơn hàng của cửa hàng!! error: " +
            error.message
        );
    }
  },
};

export default storeController;
