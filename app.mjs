import express from "express";
import { loadSwaggerDocument } from "./utils/swagger.mjs";
import swaggerUi from "swagger-ui-express";
import { rateLimiter } from "./middlewares/basic-rate-limit.mjs";
import questionsRouter from "./routes/questionsRoutes.mjs";
import answersRouter from "./routes/answersRoutes.mjs";
import authRouter from "./routes/authRouter.mjs";
import requestLogger from "./middlewares/loggerMiddleware.mjs";
import logger from "./utils/logger.mjs";
import errorHandler from "./middlewares/errorHandler.mjs";

const app = express();
const port = 4000;

app.use(express.json());

app.use(rateLimiter(50, 60000));

app.use(requestLogger);

const swaggerDocument = await loadSwaggerDocument("./swagger.yaml");
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use("/auth", authRouter);
app.use("/questions", questionsRouter);
app.use("/answers", answersRouter);

app.get("/test", (req, res) => {
  return res.json("Server API is working 🚀");
});

app.get("*", (req, res) => {
  return res.json("Not Found");
});

app.use(errorHandler);

app.listen(port, () => {
  logger.info(`Server started on port ${port}`);
});

process.on("SIGTERM", () => {
  ServerApiVersion.close(() => {
    logger.info("Process terminated");
  });
});
