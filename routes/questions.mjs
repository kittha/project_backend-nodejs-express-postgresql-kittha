import { Router } from "express";
import connectionPool from "../utils/db.mjs";
import { validateCreatePostUpdatePutData } from "../middlewares/post-put.validation.mjs";

const questionsRouter = Router();

// CREATE
questionsRouter.post(
  "/",
  [validateCreatePostUpdatePutData],
  async (req, res) => {
    try {
      const { title, description, category } = req.body;
      const newQuestion = { title, description, category };

      const result = await connectionPool.query(
        `
    INSERT INTO questions (title, description, category)
    VALUES ($1, $2, $3)
    `,
        [newQuestion.title, newQuestion.description, newQuestion.category]
      );
      return res
        .status(201)
        .json({ message: "201 Created: Question created successfully." });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        message: "Server could not process the request due to database issue.",
      });
    }
  }
);
// READ
questionsRouter.get("/", async (req, res) => {
  const title = req.query.title ? `%${req.query.title}%` : null;
  const category = req.query.category ? `%${req.query.category}%` : null;

  try {
    if (!title && !category) {
      return res.status(400).json({
        message: "400 Bad Request: Invalid query parameters.",
      });
    }

    const result = await connectionPool.query(
      `
        SELECT *
        FROM questions
        WHERE   (title ILIKE $1 OR $1 IS NULL) AND
                (category ILIKE $2 OR $2 IS NULL)
        `,
      [title, category]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "404 Not Found: Question not found",
      });
    }

    return res.status(200).json({
      message: "200 OK: Successfully retrieved the list of questions.",
      data: result.rows,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Server could not process the request due to database issue.",
    });
  }
});

questionsRouter.get("/:questionId", async (req, res) => {
  try {
    const questionIdFromClient = req.params.questionId;

    const result = await connectionPool.query(
      `
            SELECT *
            FROM questions
            WHERE id=$1
            `,
      [questionIdFromClient]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "404 Not Found: Question not found",
      });
    }

    return res.status(200).json({
      message: "200 OK: Successfully retrieved the question",
      data: result.rows[0],
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Server could not process the request due to database issue.",
    });
  }
});
// UPDATE
questionsRouter.put(
  "/:questionId",
  [validateCreatePostUpdatePutData],
  async (req, res) => {
    try {
      const questionIdFromClient = req.params.questionId;

      const checkIsQuestionExist = await connectionPool.query(
        `
        SELECT *
        FROM questions
        WHERE id=$1
        `,
        [questionIdFromClient]
      );

      if (checkIsQuestionExist.rows.length === 0) {
        return res.status(404).json({
          message: "404 Not Found: Question not found",
        });
      }

      const { title, description, category } = req.body;
      const updatedQuestion = { title, description, category };

      const result = await connectionPool.query(
        `
        UPDATE questions
        SET title=$2,
            description=$3,
            category=$4
        WHERE id=$1
        RETURNING *
        `,
        [
          questionIdFromClient,
          updatedQuestion.title,
          updatedQuestion.description,
          updatedQuestion.category,
        ]
      );

      return res.status(200).json({
        message: "200 OK: Successfully updated the question.",
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        message: "Server could not process the request due to database issue.",
      });
    }
  }
);

// DELETE
questionsRouter.delete("/:questionId", async (req, res) => {
  try {
    const questionIdFromClient = req.params.questionId;

    const checkIsQuestionExist = await connectionPool.query(
      `
        SELECT *
        FROM questions
        WHERE id=$1
        `,
      [questionIdFromClient]
    );

    if (checkIsQuestionExist.rows.length === 0) {
      return res.status(404).json({
        message: "404 Not Found: Question not found",
      });
    }

    const result = await connectionPool.query(
      `
        DELETE
        FROM questions
        WHERE id=$1
        `,
      [questionIdFromClient]
    );

    return res.status(200).json({
      message: "200 OK: Successfully deleted the question",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Server could not process the request due to database issue.",
    });
  }
});

export default questionsRouter;
