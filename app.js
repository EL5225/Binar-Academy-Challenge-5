import express from "express";
import swaggerUi from "swagger-ui-express";
import docs from "./docs/swagger.json" assert { type: "json" };
import cors from "cors";
import "dotenv/config";
import router from "./routes/index.js";
import {
  errorHandler,
  notFound,
  prismaErrorHandler,
  zodErrorHandler,
} from "./middlewares/index.js";

const app = express();
const swaggerDocument = docs;

app.use(cors());
app.use(express.json());

app.use("/api/v1/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use("/api/v1", router);
app.use(zodErrorHandler);
app.use(prismaErrorHandler);
app.use(notFound);
app.use(errorHandler);

export default app;
