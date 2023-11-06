import express from "express";
import swaggerUi from "swagger-ui-express";
import docs from "./docs/swagger.json" assert { type: "json" };
import cors from "cors";
import "dotenv/config";
import Sentry from "@sentry/node";
import router from "./routes/index.js";
import {
  errorHandler,
  notFound,
  prismaErrorHandler,
  zodErrorHandler,
} from "./middlewares/index.js";
const { SENTRY_DNS } = process.env;
const app = express();

Sentry.init({
  dsn: SENTRY_DNS,
  integrations: [
    // enable HTTP calls tracing
    new Sentry.Integrations.Http({ tracing: true }),
    // enable Express.js middleware tracing
    new Sentry.Integrations.Express({ app }),
  ],
  // Performance Monitoring
  tracesSampleRate: 1.0,
});

app.use(cors());
app.use(express.json());
const swaggerDocument = docs;

// The request handler must be the first middleware on the app
app.use(Sentry.Handlers.requestHandler());

// TracingHandler creates a trace for every incoming request
app.use(Sentry.Handlers.tracingHandler());

// All your controllers should live here
app.get("/", (req, res) => {
  console.log(object);
  res.json({
    status: true,
    message: "Welcome to API, open api docs at /api/docs",
  });
});
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use("/api/v1", router);

// The error handler must be registered before any other error middleware and after all controllers
app.use(Sentry.Handlers.errorHandler());

app.use(zodErrorHandler);
app.use(prismaErrorHandler);
app.use(notFound);
app.use(errorHandler);

export default app;
