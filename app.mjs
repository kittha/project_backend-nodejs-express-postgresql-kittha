import express from "express";
import fs from "fs";
import yaml from "js-yaml";
import swaggerUi from "swagger-ui-express";
import { rateLimiter } from "./middlewares/basic-rate-limit.mjs";
import questionsRouter from "./routes/questionsRoutes.mjs";
import answersRouter from "./routes/answersRoutes.mjs";

const app = express();
const port = 4000;

const yamlFile = fs.readFileSync("./swagger.yaml", "utf8");
const swaggerDocument = yaml.load(yamlFile);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use(express.json());
app.use(rateLimiter(50, 60000));

app.use("/questions", questionsRouter);
app.use("/answers", answersRouter);

app.get("/test", (req, res) => {
  return res.json("Server API is working 🚀");
});

app.get("*", (req, res) => {
  return res.json("Not Found");
});
app.listen(port, () => {
  console.log(`Server is running at ${port}`);
});
