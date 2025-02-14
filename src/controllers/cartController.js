import Cart from "../models/cartModel.js";
import Product from "../models/productModel.js";
import User from "../models/userModel.js";

const cartController = {
  //[POST] /cart/add-product-to-cart  thêm sản phẩm mới vào giỏ hàng
  addproductToCart: async (req, res) => {
    const infoProductToCart = req.body;

    try {
      const currentCart = await Cart.findOne({
        userId: infoProductToCart.userId,
      });

      //nếu chưa có giỏ hàng thì tạo mới và thêm sản phẩm vào giỏ hàng cho user
      if (!currentCart) {
        //tạo mới bản ghi
        const newCart = {
          userId: infoProductToCart.userId,
          products: [
            {
              color: infoProductToCart.productColor,
              quantity: infoProductToCart.quantity,
              productId: infoProductToCart.productId,
            },
          ],
        };

        const cartOnDatabase = await Cart.create(newCart);

        return res.status(200).json({
          message: "Thêm mới sản phẩm thành công!",
          success: true,
          cart: cartOnDatabase.toObject(),
        });
      }

      //kiểm tra sản phẩm đã có trong giỏ hàng hay chưa
      const isDuplicate = currentCart.products.find(
        (product) => product.productId === infoProductToCart.productId
      );

      if (!isDuplicate) {
        const newProduct = {
          color: infoProductToCart.productColor,
          quantity: infoProductToCart.quantity,
          productId: infoProductToCart.productId,
        };

        // Cập nhật giỏ hàng bằng MongoDB
        const newCart = await Cart.findOneAndUpdate(
          { userId: currentCart.userId }, // Tìm giỏ hàng theo ID
          { $push: { products: newProduct } }, // Thêm sản phẩm vào mảng products
          { new: true } // Trả về document mới sau khi cập nhật
        );

        return res.status(200).send({
          message: "Thêm mới sản phẩm thành công!",
          success: true,
          cart: newCart.toObject(),
        });
      }

      res.status(400).send({
        message: "Sản phẩm đã có trong giỏ hàng!",
        success: false,
        cart: currentCart.toObject(),
      });
    } catch (error) {
      console.log(
        "Lỗi server khi thêm mới sản phẩm vào giỏ hàng!! --cartController.addProductToCart--" +
          error.message
      );

      res
        .status(500)
        .send(
          "Lỗi server khi thêm mới sản phẩm vào giỏ hàng!! --cartController.addProductToCart--" +
            error.message
        );
    }
  },

  //[POST] /cart/products   Lấy danh sách sản phẩm của giỏ hàng
  getProductsOfCart: async (req, res) => {
    const productsOfRedux = req.body.products;
    const productId = productsOfRedux.map((product) => product.productId);
    try {
      let products = await Product.find({
        _id: { $in: productId },
      });

      products = products.map((product) => {
        //chuyển Mongoose document thành plain object
        const plainProduct = product.toObject ? product.toObject() : product;

        // Tìm object tương ứng trong productsOfRedux
        const matchingItem = productsOfRedux.find(
          (item) => item.productId === plainProduct._id.toString()
        );

        // Nếu tìm thấy, thêm các thông tin từ giỏ hàng vào sản phẩm
        if (matchingItem) {
          return {
            ...plainProduct,
            quantityOnCart: matchingItem.quantity,
            colorOnCart: matchingItem.color,
            imageDefault: product.images.find(
              (image) => image.color === matchingItem.color
            ),
          };
        }
        // Nếu không tìm thấy, trả về sản phẩm gốc
        return plainProduct;
      });

      res.status(200).json({
        message: "Successfully!!",
        products,
      });
    } catch (error) {
      console.log(
        "Lỗi server khi lấy danh sách của giỏ hàng!! --cartController.getProductsOfCart--  error: " +
          error.message
      );

      res
        .status(500)
        .send(
          "Lỗi server khi lấy danh sách của giỏ hàng!! --cartController.getProductsOfCart--  error: " +
            error.message
        );
    }
  },

  //[POST] /cart/update-cart  cập nhật lại giỏ hàng
  updateCart: async (req, res) => {
    const newCart = req.body;

    try {
      const updateCart = await Cart.findByIdAndUpdate(newCart._id, newCart);

      if (!updateCart) {
        console.log("Cart not found!! --- cartController.updateCart-- ");
        return res.status(400).send("Cart not found!!");
      }

      res.status(200).send("Cập nhật giỏ hàng thành công!!");
    } catch (error) {
      console.log(
        "Cập nhật giỏ hàng không thành công!! --- cartController.updateCart-- " +
          error.message
      );

      response
        .status(500)
        .send(
          "Cập nhật giỏ hàng không thành công!! --- cartController.updateCart-- " +
            error.message
        );
    }
  },
};

export default cartController;
