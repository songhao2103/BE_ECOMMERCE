import mongoose from "mongoose";

const dbUrl =
  "mongodb+srv://braumsp1:dragonfly1122@cluster0.jzl6v.mongodb.net/database-e-commerce";

const dbConnect = async () => {
  try {
    await mongoose.connect(dbUrl, {
      tls: true,
      tlsAllowInvalidCertificates: false,
    });
    console.log("Connected to the database successfully!");
  } catch (error) {
    console.log("Connection to database failed!");
  }
};

export default dbConnect;
