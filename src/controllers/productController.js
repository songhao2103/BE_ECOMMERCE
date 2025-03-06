import Product from "../models/productModel.js";

const productController = {
  //[GET] /product/products-sale   == lấy danh sách sản phẩm đang được khuyễn mãi ở HomePage
  getProductsSale: async (req, res) => {
    try {
      const productsSale = await Product.find({
        discount: { $gt: 0 },
        status: "accept",
      }).sort({
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
      const productSelling = await Product.find({ status: "accept" })
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

  // [POST] /product/get-products  //lấy danh sách sản phẩm phẩm ở trang productsList
  getProducts: async (req, res) => {
    const { limit, page } = req.query;
    const { sortValue, filterValue, searchValue } = req.body;

    const limitNum = parseInt(limit, 10);
    const pageNum = parseInt(page, 10);

    //create object query
    let filterObject = {
      status: "accept",
    };

    let sortObject = {};

    try {
      if (!sortObject || !filterValue || !limit || !page) {
        console.log("Lỗi");

        return res.status(400).send("Missing data!!");
      }

      //kiểm tra danh sách store và thêm vào object filter
      if (filterValue.store.length > 0) {
        filterObject = {
          ...filterObject,
          company: {
            [filterValue.typeStore === "belong" ? "$in" : "$nin"]:
              filterValue.store,
          },
        };
      }

      //kiểm tra danh sách device và thêm vào object filter
      if (filterValue.deviceType.length > 0) {
        filterObject = {
          ...filterObject,
          deviceType: {
            [filterValue.typeDevice === "belong" ? "$in" : "$nin"]:
              filterValue.deviceType,
          },
        };
      }

      //kiểm tra phần search
      if (!!searchValue) {
        filterObject = {
          ...filterObject,
          ["$or"]: [
            { productName: { $regex: `${searchValue}`, $options: "i" } },
            { company: { $regex: `${searchValue}`, $options: "i" } },
            { deviceType: { $regex: `${searchValue}`, $options: "i" } },
          ],
        };
      }

      //sort
      if (sortValue.value !== 0) {
        sortObject[sortValue.field] = parseInt(sortValue.value, 10);
      } else {
        sortObject = { _id: 1 };
      }

      const totalQuantity = await Product.countDocuments(filterObject);

      const products = await Product.find(filterObject)
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum)
        .sort(sortObject);

      res.status(200).json({
        totalQuantity,
        products,
      });
    } catch (error) {
      console.log("Lỗi server khi lấy danh sách sản phẩm!! " + error.message);
    }
  },

  //[GET] /product/get-type-filter  //lấy danh sách các type filter ở trang productsList
  getTypeFilter: async (req, res) => {
    try {
      const products = await Product.find({ status: "accept" });
      const typeStore = [
        ...new Set(products.map((product) => product.company)),
      ];

      const typeDevice = [
        ...new Set(products.map((product) => product.deviceType)),
      ];

      res.status(200).json({
        store: typeStore,
        deviceType: typeDevice,
      });
    } catch (error) {
      console.log(
        "Lỗi server khi lấy danh sách type filter!! " + error.message
      );

      res
        .status(500)
        .send("Lỗi server khi lấy danh sách type filter!! " + error.message);
    }
  },

  //[POST] /product/get-product-search-home-page
  getProductsSearchHomePage: async (req, res) => {
    const { debouncedValueSearch, historySearchs } = req.body;
    try {
      let results = []; //Lưu danh sách sản phẩm trả về

      if (!debouncedValueSearch && historySearchs.length === 0) {
        const productSelling = await Product.find({ status: "accept" })
          .skip(0)
          .limit(8)
          .sort({ quantitySold: -1 })
          .lean();

        results.push(...productSelling);
      } else if (!debouncedValueSearch) {
        for (const search of historySearchs) {
          if (results.length >= 8) break;

          //lấy sản phẩm
          const products = await Product.find({
            productName: { $regex: search, $options: "i" },
            status: "accept",
          }).lean();

          //Loại bỏ sản phẩm trùng lặp
          const newProducts = products.filter(
            (pro) =>
              !results.some(
                (existing) => existing._id.toString() === pro._id.toString()
              )
          );

          results.push(...newProducts);
        }
      } else {
        const products = await Product.find({
          $or: [
            { productName: { $regex: debouncedValueSearch, $options: "i" } },
            { deviceType: { $regex: debouncedValueSearch, $options: "i" } },
            { company: { $regex: debouncedValueSearch, $options: "i" } },
          ],
          status: "accept",
        })

          .limit(8)
          .lean();

        results.push(...products);
      }

      // Giới hạn kết quả tối đa là 8 sản phẩm
      results = results.slice(0, 8);

      res.status(200).send(results);
    } catch (error) {
      console.log(
        "Lỗi server khi lấy danh sách sản phẩm search homepage!!" +
          error.message
      );

      res
        .status(500)
        .send(
          "Lỗi server khi lấy danh sách sản phẩm search homepage!!" +
            error.message
        );
    }
  },

  //[GET] /product/get-products-of-search  //lấy danh sách sản phẩm để hiện thị ở trang ProductsListOfSearch
  getProductsOfSearch: async (req, res) => {
    const { debouncedValueSearch, limit, page, sortValue } = req.query;
    try {
      if (!debouncedValueSearch || !limit || !page || !sortValue) {
        throw new Error("Missing data!!");
      }

      const totalQuantity = await Product.countDocuments({
        $or: [
          { productName: { $regex: debouncedValueSearch, $options: "i" } },
          { deviceType: { $regex: debouncedValueSearch, $options: "i" } },
          { company: { $regex: debouncedValueSearch, $options: "i" } },
        ],
        status: "accept",
      });

      const sortObject = [1, -1].includes(Number(sortValue))
        ? { price: Number(sortValue) }
        : {};

      const products = await Product.find({
        $or: [
          { productName: { $regex: debouncedValueSearch, $options: "i" } },
          { deviceType: { $regex: debouncedValueSearch, $options: "i" } },
          { company: { $regex: debouncedValueSearch, $options: "i" } },
        ],
        status: "accept",
      })
        .skip((page - 1) * limit)
        .limit(limit)
        .sort(sortObject);

      res.status(200).json({ products, totalQuantity });
    } catch (error) {
      console.log(
        "Lỗi server khi lấy danh sách sản phẩm ở ProductsListOfSearch! error: " +
          error.message
      );

      res
        .status(500)
        .send(
          "Lỗi server khi lấy danh sách sản phẩm ở ProductsListOfSearch! error: " +
            error.message
        );
    }
  },
};

export default productController;
