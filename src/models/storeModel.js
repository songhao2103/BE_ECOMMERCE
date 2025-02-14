import mongoose from "mongoose";

const storeSchema = mongoose.Schema({
  storeName: {
    type: String,
    required: true,
    unique: true,
    minLength: 2,
    maxlength: 150,
  },
  //[apple, dell, asus]

  avatar: {
    type: String,
  },

  products: [],

  storeAddress: { type: String, required: true },
});

const Store = mongoose.model("Store", storeSchema);

export default Store;
