import Order from "../models/orderModel.js";
import Cart from "../models/cartModel.js";
import Product from "../models/productModel.js";

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
        });
      });

      // await Promise.all(ordersPromises); // Đợi tất cả đơn hàng hoàn thành

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
};

export default orderController;
