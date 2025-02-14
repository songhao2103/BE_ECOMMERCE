import mongoose from "mongoose";

const productSchema = mongoose.Schema(
  {
    productName: {
      type: String,
      required: true,
      unique: true,
      minLength: 5,
      maxLength: 150,
    },

    describe: {
      type: String,
      required: true,
      minLength: 5,
      maxLength: 550,
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    discount: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    company: {
      type: String,
      required: true,
      minLength: 2,
      maxLength: 150,
    },

    deviceType: {
      type: String,
      required: true,
      minLength: 5,
      maxLength: 150,
    },

    images: [
      {
        color: {
          type: String,
          enum: ["black", "white", "pink", "other"],
        },
        url: {
          type: String,
          required: true,
          product_id: { type: String, required: true },
        },
      },
    ],

    totalQuantity: {
      type: Number,
      required: true,
    },

    blackQuantity: {
      type: Number,
    },

    whiteQuantity: {
      type: Number,
    },

    pinkQuantity: {
      type: Number,
    },

    quantityOrdered: {
      type: Number,
      default: 0,
    },

    rating: {
      type: Number,
      default: 0,
    },

    numberOfReview: {
      type: Number,
      default: 0,
    },

    status: {
      type: String,
      default: "pending",
      enum: ["pending", "accept", "refuse", "edit"],
    },

    storeName: {
      type: String,
    },

    reasonForRefusal: {
      type: String,
    },

    quantitySold: {
      type: Number, 
    },
  },
  {
    timestamps: true, //tự động thêm createAt và updateAt
  }
);

const Product = mongoose.model("Product", productSchema);

export default Product;
