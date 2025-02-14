import mongoose from "mongoose";

const userSchema = mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      match: [/.+\@.+\..+/, "Email không hợp lệ"], // Validation email
    },
    
    password: {
      type: String,
      required: true,
    },

    userName: {
      type: String,
      required: true,
      minLength: 3,
      maxLength: 150,
      trim: true, //loại bỏ khoảng trắng dư thừa
    },

    avatar: {
      type: String,
    },

    role: {
      type: String,
      default: "customer",
      enum: ["customer", "store", "admin"],
    },

    address: {
      cityOrProvince: {
        type: String,
      },

      district: {
        type: String,
      },

      wardOrCommune: {
        type: String,
      },

      specific: {
        type: String,
      },
    },

    isActive: {
      type: Boolean,
      default: false,
    },

    phoneNumber: {
      type: String,
      match: [/^(\+84|0)[3|5|7|8|9][0-9]{8}$/, "Số điện thoại không hợp lệ"],
    },

    storeId: {
      type: String,
    },
  },
  {
    timestamps: true, // Tự động thêm createdAt và updatedAt
  }
);

const User = mongoose.model("User", userSchema);

export default User;
