import mongoose from "mongoose";

const orderSchema = mongoose.Schema(
  {
    storeName: {
      type: String,
      required: true,
    },

    products: [
      {
        productId: {
          type: String,
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
        },
        color: {
          type: String,
          required: true,
        },
      },
    ],

    status: {
      type: "String",
      default: "pending",
      enum: [
        "pending", // đang chờ cửa hàng xử lý
        "comfirmed", //cửa hàng đã xác nhận đơn hàng
        "shipping", // đang được giao
        "delivered", // đã giao
        "canceled", // người hủy đơn hàng
        "returned", // người dùng từ chối nhận hàng
        "rejected", // Cửa hàng từ chối
        "completed", // Hoàn thành đơn hàng
      ],
    },

    userId: {
      type: String,
      required: true,
    },

    orderAddress: {
      cityOrProvince: {
        type: String,
        required: true,
      },
      district: {
        type: String,
        required: true,
      },
      wardOrCommune: {
        type: String,
        riquired: true,
      },
      specific: {
        type: String,
        required: true,
      },
    },
    phoneNumber: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const Order = mongoose.model("Order", orderSchema);

export default Order;
