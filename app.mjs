import express from "express";
import { rateLimiter } from "./middlewares/basic-rate-limit.mjs";
import questionsRouter from "./routes/questions.mjs";
import answersRouter from "./routes/answers.mjs";

const app = express();
const port = 4000;

app.use(express.json());
const limiter = rateLimiter(50, 60000);
app.use(limiter);
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
