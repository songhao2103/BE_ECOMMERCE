import mongoose from "mongoose";
import Order from "../models/orderModel.js";
import Cart from "../models/cartModel.js";
import Product from "../models/productModel.js";

const ObjectId = mongoose.Types.ObjectId;

const orderController = {
  //[POST] /order/create-order //tạo các order mới
  createOrder: async (req, res) => {
    try {
      //lấy dữ liệu từ client
      const { userId, currentOrderAddress, ordersList } = req.body;

      //lọc qua các order được gửi lên
      const ordersPromises = ordersList.map((order) => {
        //tạo danh sách sản phẩm mới
        const newProducts = order.products.map((product) => {
          return {
            productId: product._id,
            quantity: product.quantityOnCart,
            color: product.colorOnCart,
          };
        });

        //tạo các order mới
        return Order.create({
          userId: userId,
          products: newProducts,
          storeName: order.storeName,
          orderAddress: {
            cityOrProvince: currentOrderAddress.cityOrProvince.name,
            district: currentOrderAddress.district.name,
            wardOrCommune: currentOrderAddress.wardOrCommune.name,
            specific: currentOrderAddress.specificAddress,
          },
          phoneNumber: currentOrderAddress.phoneNumber,
          shippingFee:
            currentOrderAddress.cityOrProvince.name === order.storeAddress
              ? 15000
              : order.storeAddress === "foreign"
              ? 50000
              : 30000,
        });
      });

      await Promise.all(ordersPromises); // Đợi tất cả đơn hàng hoàn thành

      //================xóa các sản phẩm đã được mua ra khỏi giỏ hàng của người dùng========================
      //lấy ra danh sách các sản phẩm có trong orderList
      let productsOfOrderList = [];
      ordersList.forEach((order) => {
        productsOfOrderList = [...productsOfOrderList, ...order.products];
      });

      //lấy giỏ hàng của người dùng xuống
      let currentCart = await Cart.findOne({ userId: userId });

      //lấy ra danh sách Id của các sản phẩm trong orderList
      const listProductIdOfOrderList = productsOfOrderList.map(
        (product) => product._id
      );

      //xóa sản phẩm
      const newProductsOfCart = currentCart.products.filter(
        (product) => !listProductIdOfOrderList.includes(product.productId)
      );

      //cập nhật giỏ hàng
      currentCart.products = newProductsOfCart;
      const newCart = await currentCart.save();

      //==========Xóa giảm bớt số lượng của sản phẩm được đặt ở trong kho===========================

      const productPromises = productsOfOrderList.map((product) => {
        return Product.findByIdAndUpdate(product._id, {
          $set: {
            [product.colorOnCart + "Quantity"]:
              product[product.colorOnCart + "Quantity"] -
              product.quantityOnCart,
            totalQuantity: product.totalQuantity - product.quantityOnCart,
          },
        }).catch((error) => {
          // Xử lý lỗi nếu có (có thể log hoặc xử lý tùy theo yêu cầu)
          console.error(
            `Error updating product with ID: ${product._id}`,
            error
          );
        });
      });

      await Promise.all(productPromises); // Đợi tất cả sản phẩm hoàn thành

      res.status(200).send(newCart);
    } catch (error) {
      console.log({ error: "Lỗi khi tạo đơn hàng", details: error.message });

      res
        .status(500)
        .json({ error: "Lỗi khi tạo đơn hàng", details: error.message });
    }
  },

  //[GET] /order/order-of-user/:userId
  getOrderOfUser: async (req, res) => {
    const { userId } = req.params;
    try {
      //lấydanh sách đơn hàng của user, dùng lean() để lấy plain object, không lấy mongoose document
      const ordersOfUser = await Order.find({ userId: userId }).lean();

      //Tập hợp tất các id của sản phẩm ở các đơn hàng để query 1 lần
      const allProductIds = ordersOfUser.reduce((acc, order) => {
        order.products.forEach((product) => {
          acc.push(product.productId.toString());
        });
        return acc;
      }, []);

      //loại bỏ các ID trùng lặp
      const uniqueProductIds = [...new Set(allProductIds)].map(
        (id) => new ObjectId(id)
      );

      //query các sản phẩm của đơn hàng
      const productsList = await Product.find({
        _id: { $in: uniqueProductIds },
      });

      //tạo 1 object có key là Id sản phẩm và value  là thông tin của sản phẩm đó
      const productsMap = productsList.reduce((map, product) => {
        map[product._id.toString()] = product;
        return map;
      }, {});

      //cập nhật lại thông tin các đơn hàng
      const updatedOrders = ordersOfUser.map((order) => {
        const newProductsList = order.products.map((productOfOrder) => {
          // tìm kiếm sản phẩm hiện tại theo productId
          const currentProduct = productsMap[productOfOrder.productId];
          if (!currentProduct) {
            return productOfOrder;
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
          };
        });

        return { ...order, products: newProductsList };
      });

      res.status(200).send(updatedOrders);
    } catch (error) {
      console.log(
        "Lỗi server khi lấy danh sách đơn hàng của user!! error: " +
          error.message
      );

      res
        .status(500)
        .send(
          "Lỗi server khi lấy danh sách đơn hàng của user!! error: " +
            error.message
        );
    }
  },

  //[POST] //order/store-confirm-order   //cửa hàng xác nhận đơn hàng
  storeConfirmOrder: async (req, res) => {
    const listOrderIds = req.body;
    try {
      await Order.updateMany(
        { _id: { $in: listOrderIds } },
        { $set: { status: "shipping" } },
        { upsert: false } //không tạo mới bản ghi nếu không tìm thấy
      );

      res.status(200).send("Ok  ");
    } catch (error) {
      console.log(
        "Lỗi server khi cửa hàng xác nhận đơn hàng!! error: " + error.message
      );

      res
        .status(500)
        .send(
          "Lỗi server khi cửa hàng xác nhận đơn hàng!! error: " + error.message
        );
    }
  },

  //[GET] //order//order/store-reject-order/:orderId    //cửa hàng từ chối nhận đơn hàng
  storeRejectOrder: async (req, res) => {
    const { orderId } = req.params;
    try {
      //lấy cập nhật và lấy về thông tin order bị từ chối
      const orderRejected = await Order.findByIdAndUpdate(
        orderId,
        { $set: { status: "rejected" } },
        { new: true } //trả về bản ghi sau khi cập nhật
      );

      //lấy ra danh sách id sản phẩm có trong order
      const listProductIds = orderRejected.products.map(
        (product) => product.productId
      );

      //lấy thông tin chi tiết sản phẩm từ database
      const productsList = await Product.find({ _id: { $in: listProductIds } });

      //cập nhật lại số lượng sản phẩm
      const productsPromise = orderRejected.products.map((productOnOrder) => {
        //tìm kiếm sản phẩm tương ứng trong productsList
        const currentProduct = productsList.find(
          (product) => product._id.toString() === productOnOrder.productId
        );

        return Product.findByIdAndUpdate(productOnOrder.productId, {
          $set: {
            [productOnOrder.color + "Quantity"]:
              currentProduct[productOnOrder.color + "Quantity"] +
              productOnOrder.quantity,
            totalQuantity:
              currentProduct.totalQuantity + productOnOrder.quantity,
          },
        });
      });

      //chờ tất cả các promise hoàn thành
      await Promise.all(productsPromise);
      res.status(200).send("OK");
    } catch (error) {
      console.log(
        "Lỗi server khi cửa hàng từ chối đơn hàng!! error: " + error.message
      );

      res
        .status(500)
        .send(
          "Lỗi server khi cửa hàng từ chối đơn hàng!! error: " + error.message
        );
    }
  },

  //[GET] /order/cancel-order/:orderId    //người dùng hủy đơn hàng
  userCancelOrder: async (req, res) => {
    const { orderId } = req.params;
    try {
      //cập nhật và trả về order
      const canceledOrder = await Order.findByIdAndUpdate(
        orderId,
        { $set: { status: "canceled" } },
        { new: true }
      );

      //lấy danh sách Id sản phẩm có trong order
      const listProductIds = canceledOrder.products.map(
        (product) => product.productId
      );

      //lấy thông tin của cá sản phẩm từ database có trong order
      const productsList = await Product.find({ _id: { $in: listProductIds } });

      //tạo danh sách promise khi cập nhật lại số lượng sản phẩm
      const productPromises = canceledOrder.products.map((productOnOrder) => {
        const currentProduct = productsList.find(
          (product) => product._id.toString() === productOnOrder.productId
        );

        if (!currentProduct) {
          throw new Error("Sản phẩm trong đơn hàng không tồn tại!!");
        } else {
          return Product.findByIdAndUpdate(productOnOrder.productId, {
            $set: {
              [productOnOrder.color + "Quantity"]:
                currentProduct[productOnOrder.color + "Quantity"] +
                productOnOrder.quantity,
              totalQuantity:
                currentProduct.totalQuantity + productOnOrder.quantity,
            },
          });
        }
      });

      //chờ tất cả các promise hoàn thành
      await Promise.all(productPromises);

      res.status(200).send("Ok");
    } catch (error) {
      console.log(
        "Lỗi server khi người dùng hủy đơn hàng!! error: " + error.message
      );

      res
        .status(500)
        .send(
          "Lỗi server khi người dùng hủy đơn hàng!! error: " + error.message
        );
    }
  },
};

export default orderController;
