import { Router } from "express";
import connectionPool from "../utils/db.mjs";

const answersRouter = Router();

// CREATE
answersRouter.post("/:id/answers", async (req, res) => {
  const questionId = req.params.id;
  const { content } = req.body;

  try {
  } catch (error) {
    return res.status(500).json({
      message: "Server could not process the request due to database issue.",
    });
  }
});
export default answersRouter;
