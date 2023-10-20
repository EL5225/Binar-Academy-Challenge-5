import express from "express";
import "dotenv/config";
import router from "./routes/index.js";
import {
  errorHandler,
  notFound,
  prismaErrorHandler,
  zodErrorHandler,
} from "./middlewares/index.js";

const app = express();
app.use(express.json());

app.use("/api/v1", router);
app.use(zodErrorHandler);
app.use(prismaErrorHandler);
app.use(notFound);
app.use(errorHandler);

export default app;
