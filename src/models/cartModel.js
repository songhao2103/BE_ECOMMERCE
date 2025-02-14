import mongoose from "mongoose";

const cartSchema = mongoose.Schema(
  {
    userId: {
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

    rejectMessage: {
      type: String,
    },
  },

  { timestamps: true }
);

const Cart = mongoose.model("Cart", cartSchema);

export default Cart;
