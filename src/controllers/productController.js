import Product from "../models/productModel.js";

const productController = {
  //[GET] /product/products-sale   == lấy danh sách sản phẩm đang được khuyễn mãi ở HomePage
  getProductsSale: async (req, res) => {
    try {
      const productsSale = await Product.find({ discount: { $gt: 0 } }).sort({
        discount: -1,
      });

      const newProductsSale =
        productsSale.length > 12 ? productsSale.slice(0, 12) : productsSale;

      res.status(200).send(newProductsSale);
    } catch (error) {
      console.log(
        "Server error when getting discount product list!!  --file: productController.getProductSale-- error:" +
          error.message
      );

      res
        .status(500)
        .send(
          "Server error when getting discount product list!!  --file: productController.getProductSale-- error:" +
            error.message
        );
    }
  },

  //[GET] /product/product-selling  == lấy danh sách sản phẩm bán chạy ở trang HomePage
  getProductSelling: async (req, res) => {
    try {
      const productSelling = await Product.find()
        .skip(0)
        .limit(4)
        .sort({ quantitySold: -1 });

      res.status(200).send(productSelling);
    } catch (error) {
      console.log(
        "Server error when getting best products selling -- file: productController.getProductSelling-- " +
          error.message
      );

      res
        .status(500)
        .send(
          "Server error when getting best products selling -- file: productController.getProductSelling-- " +
            error.message
        );
    }
  },

  //[GET] /product/product-detail == lấy thông tin sản phẩm ở trang detail
  getProductDetail: async (req, res) => {
    const { productId } = req.params;

    try {
      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({
          message: "Not Found!!",
        });
      }

      res.status(200).send(product);
    } catch (error) {
      console.log(
        "Server error when get product detail!!  --error: " + error.message
      );
      res
        .status(500)
        .send("Server error when get product detail!! " + error.message);
    }
  },
};

export default productController;
