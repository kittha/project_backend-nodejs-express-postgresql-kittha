import { Router } from "express";
import connectionPool from "../utils/db.mjs";

const answersRouter = Router();

// CREATE
answersRouter.post("/:id/answers", async (req, res) => {
  const questionId = req.params.id;
  console.log(req.body);
  const { content } = req.body;

  if (!content) {
    return res.status(400).json({
      message: "400 Bad Request: Missing or invalid request data.",
    });
  }
  try {
    const checkIsQuestionExist = await connectionPool.query(
      `
        SELECT id
        FROM questions
        WHERE id=$1
        `,
      [questionId]
    );

    if (checkIsQuestionExist.rows.length === 0) {
      return res.status(404).json({
        message: "404 Not Found: Question not found.",
      });
    }

    const result = await connectionPool.query(
      `
        INSERT INTO answers (question_id, content)
        VALUES ($1, $2)
        RETURNING *
        `,
      [questionId, content]
    );

    return res.status(201).json({
      message: "201 Created: Answer created successfuly.",
      data: result.rows[0],
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server could not process the request due to database issue.",
    });
  }
});

// READ
answersRouter.get("/:id/answers", async (req, res) => {
  const questionId = req.params.id;

  try {
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Server could not process the request due to database issue.",
    });
  }
});
// UPDATE

// DELETE

export default answersRouter;
