import authRouter from "./authRouter.js";
import userRouter from "./userRouter.js";
import storeRouter from "./storeRouter.js";
import adminRouter from "./adminRouter.js";
import productRouter from "./productRouter.js";
import cartRouter from "./cartRouter.js";
import orderRouter from "./orderRouter.js";

const route = (app) => {
  //storeRouter
  app.use("/store", storeRouter);

  //userRouter
  app.use("/user", userRouter);

  //admin router
  app.use("/admin", adminRouter);

  //productRouter
  app.use("/product", productRouter);

  //cartRouter
  app.use("/cart", cartRouter);

  //orderRouter
  app.use("/order", orderRouter);

  //authRouter
  app.use("/", authRouter);
};

export default route;
