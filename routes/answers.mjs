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
        RETURNING id, question_id, content, created_at, updated_at
        `,
      [questionId, content]
    );

    const question = result.rows[0];

    return res.status(201).json({
      message: "201 Created: Answer created successfuly.",
      data: {
        id: question.id,
        question_id: question.question_id,
        content: question.content,
        created_at: question.created_at,
        updated_at: question.updated_at,
      },
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
    const result = await connectionPool.query(
      `
        SELECT id, question_id, content, created_at, updated_at
        FROM answers
        WHERE question_id=$1
        `,
      [questionId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "404 Not Found: Question not found.",
      });
    }

    return res.status(200).json({
      message: "200 OK: Successfully retrieved the answers.",
      data: result.rows.map((question) => ({
        id: question.id,
        question_id: question.question_id,
        content: question.content,
        created_at: question.created_at,
        updated_at: question.updated_at,
      })),
    });
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
