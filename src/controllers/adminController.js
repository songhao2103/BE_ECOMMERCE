import Store from "../models/storeModel.js";
import Product from "../models/productModel.js";
import Order from "../models/orderModel.js";

const adminController = {
  //[POST] /admin/get-product-pending  == admin lấy danh sách sản phẩm được thêm mới từ cửa hàng và đang chờ xác nhận "status: pending"
  adminProductComfirm: async (req, res) => {
    //lấy filters và sort từ client
    const { filters, sort } = req.body;

    //lấy từ query parameters
    const currentPage = parseInt(req.query.currentPage);
    const limit = parseInt(req.query.limit);

    //create object query
    let filterObject = {
      status: "pending",
    };

    let sortObject = {};
    try {
      if (!filters || !sort) {
        return res
          .status(400)
          .json({ error: "Not available filters or sort!!" });
      }

      //kiểm tra danh sách store của filters được gửi từ client
      if (filters.stores.length > 0) {
        //lưu danh sách productId có trong các store đó
        let productIds = [];

        //tạo danh sách các promise từ Store.fineOne
        const storePromises = filters.stores.map((storeName) =>
          Store.findOne({ storeName: storeName })
        );

        //chờ tất cả các promise hoàn thành
        const stores = await Promise.all(storePromises);

        // Gộp tất cả productIds từ các store
        stores.forEach((currentStore) => {
          if (currentStore) {
            productIds = [...productIds, ...currentStore.products];
          }
        });

        //thêm vào filterObject
        filterObject = {
          _id: {
            [filters.typeStore === "belong" ? "$in" : "$nin"]: productIds,
          },
        };
      }

      // kiểm tra danh sách deviceTypes được gửi lên từ client
      if (filters.deviceTypes.length > 0) {
        filterObject = {
          ...filterObject,
          deviceType: {
            [filters.typeDeviceType === "belong" ? "$in" : "$nin"]:
              filters.deviceTypes,
          },
        };
      }

      //kiểm tra phần search
      if (!!filters.search) {
        filterObject = {
          ...filterObject,
          ["$or"]: [
            { productName: { $regex: `${filters.search}`, $options: "i" } },
            { company: { $regex: `${filters.search}`, $options: "i" } },
          ],
        };
      }

      //sort
      if (sort.type !== "0") {
        sortObject[sort.field] = Number(sort.type);
      }

      const totalQuantity = await Product.countDocuments(filterObject);

      const products = await Product.find(filterObject)
        .skip((currentPage - 1) * limit)
        .limit(limit)
        .sort(sortObject);

      res.status(200).json({ products, totalQuantity });
    } catch (error) {
      console.log(
        "Server error when getting pending product list!!  --file: adminController.adminProductComfirm-- error:" +
          error.message
      );

      res
        .status(500)
        .send(
          "Server error when getting pending product list!!  --file: adminController.adminProductComfirm-- error:" +
            error.message
        );
    }
  },

  //[GET] /admin/get-select-product-confirm
  adminGetSelects: async (req, res) => {
    try {
      const [products, stores] = await Promise.all([
        Product.find(), //lấy danh sách của tất cả các sản phẩm
        Store.find(), //lấy dang sách các store
      ]);

      //tạo mảng lưu tất cả các tên của store
      let storeNames = new Set(stores.map((store) => store.storeName));

      //tạo mảng lưu danh sách các deviceType
      let deviceTypes = new Set(products.map((product) => product.deviceType));

      res.status(200).send({
        storeNames: Array.from(storeNames), // Chuyển Set thành mảng
        deviceTypes: Array.from(deviceTypes), // Chuyển Set thành mảng
      });
    } catch (error) {
      console.log(
        "Lỗi server khi lấy danh sách lựa chọn ở ProductConfirm!!  --file: adminController.addminGetSelects --" +
          error.message
      );

      res
        .status(500)
        .send(
          "Lỗi server khi lấy danh sách lựa chọn ở ProductConfirm!! --file: adminController.addminGetSelects --" +
            error.message
        );
    }
  },

  //[POST] /admin/accept-products
  adminAcceptProduct: async (req, res) => {
    const productIds = req.body;
    try {
      await Product.updateMany(
        {
          _id: { $in: productIds },
        },
        { status: "accept" }
      );

      res.status(200).json({ message: "Accept successfully!!" });
    } catch (error) {
      console.log(
        "Server error when admin accept product!! --file:adminController.adminAcceptProducts--- " +
          error.message
      );

      res
        .status(500)
        .send(
          "Server error when admin accept product!! --file:adminController.adminAcceptProducts--- " +
            error.message
        );
    }
  },

  //[POST]  /admin/refuse-product
  adminRefuseProduct: async (req, res) => {
    const { productId, reasonForRefusal } = req.body;

    try {
      const currentProduct = await Product.findByIdAndUpdate(productId, {
        status: "edit",
        reasonForRefusal,
      });

      res.status(200).json({
        message: "Refuse the product!!!",
      });
    } catch (error) {
      console.log(
        "Server error when admin refuse product!! --file:adminController.adminRefuseProducts--- " +
          error.message
      );

      res
        .status(500)
        .send(
          "Server error when admin refuse product!! --file:adminController.adminRefuseProducts--- " +
            error.message
        );
    }
  },

  //[GET] /admin/get-orders-shipping  lấy danh sách đơn hang đang được giao
  getOrderShipping: async (req, res) => {
    try {
      //lấy ra các đơn hàng có đang được giao
      const ordersList = await Order.find({
        status: "shipping",
      }).lean();

      //lấy ra danh sách id của các sản phẩm có trong ordersList
      const listProductIds = ordersList.reduce((acc, order) => {
        order.products.forEach((product) => {
          acc.push(product.productId);
        });
        return acc;
      }, []);

      //loại bỏ các id trùng lặp
      const uniqueProductId = [...new Set(listProductIds)];

      //lấy thông tin chi tiết của các sản phẩm trên
      const productsList = await Product.find({
        _id: { $in: uniqueProductId },
      }).lean();

      //tạo 1 map có key là id của sản phẩm và value là thông tin chi tiết của sản phẩm đó
      const productsMap = productsList.reduce((map, product) => {
        map[product._id] = product;
        return map;
      }, {});

      //cập nhật lại đơn hàng khi thêm các thông tin vào sản phẩm của đơn hàng đó
      const updateOrdersList = ordersList.map((order) => {
        const newProducts = order.products.map((productOnOrder) => {
          //lấy ra thông tin của sản phẩm hiện tại
          const currentProduct = productsMap[productOnOrder.productId];

          if (!currentProduct) {
            throw new Error("Sản phẩm trong đơn hàng không tồn tại!!");
          } else {
            const imageOrder = currentProduct.images.find(
              (image) => image.color === productOnOrder.color
            );
            return {
              ...productOnOrder,
              imageOrder: imageOrder,
              productName: currentProduct.productName,
              discount: currentProduct.discount,
              price: currentProduct.price,
            };
          }
        });

        return { ...order, products: newProducts };
      });

      res.status(200).send(updateOrdersList);
    } catch (error) {
      console.log(
        "Lỗi khi admin lấy danh sách đơn hàng đang được giao!! error: " +
          error.message
      );

      res
        .status(500)
        .send(
          "Lỗi khi admin lấy danh sách đơn hàng đang được giao!! error: " +
            error.message
        );
    }
  },

  //[GET] /admin/admin-complete-order/:orderId
  completeOrder: async (req, res) => {
    const { orderId } = req.params;

    try {
      if (!orderId) {
        throw new Error("Không có orderId");
      }

      //tìm và cập nhật lại order
      const orderUpdated = await Order.findByIdAndUpdate(orderId, {
        $set: { status: "completed" },
      });

      if (!orderUpdated) {
        throw new Error("Không tìm thấy đơn hàng!!");
      }

      res.status(200).send("OK");
    } catch (error) {
      console.log("Lỗi server khi admin complete đơn hàng!! " + error.message);
      res
        .status(500)
        .send("Lỗi server khi admin complete đơn hàng!! " + error.message);
    }
  },
};

export default adminController;
