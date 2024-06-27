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
    RETURNING id, title, description, category, created_at, updated_at
    `,
        [newQuestion.title, newQuestion.description, newQuestion.category]
      );

      const question = result.rows[0];

      return res.status(201).json({
        message: "201 Created: Question created successfully.",
        data: {
          id: question.id,
          title: question.title,
          description: question.description,
          catgory: question.category,
          created_at: question.created_at,
          updated_at: question.updated_at,
        },
      });
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
    const result = await connectionPool.query(
      `
        SELECT id, title, description, category, created_at, updated_at
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
      data: result.rows.map((question) => ({
        id: question.id,
        title: question.title,
        description: question.description,
        category: question.category,
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

questionsRouter.get("/:questionId", async (req, res) => {
  try {
    const questionIdFromClient = req.params.questionId;

    const result = await connectionPool.query(
      `
            SELECT id, title, description, category, created_at, updated_at
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

    const question = result.rows[0];

    return res.status(200).json({
      message: "200 OK: Successfully retrieved the question",
      data: {
        id: question.id,
        title: question.title,
        description: question.description,
        category: question.category,
        created_at: question.created_at,
        updated_at: question.updated_at,
      },
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
            category=$4,
            updated_at=NOW()
        WHERE id=$1
        RETURNING id, title, description, category, created_at, updated_at
        `,
        [
          questionIdFromClient,
          updatedQuestion.title,
          updatedQuestion.description,
          updatedQuestion.category,
        ]
      );
      const updatedQuestionResult = result.rows[0];

      return res.status(200).json({
        message: "200 OK: Successfully updated the question.",
        data: {
          id: updatedQuestionResult.id,
          title: updatedQuestionResult.title,
          description: updatedQuestionResult.description,
          category: updatedQuestionResult.category,
          created_at: updatedQuestionResult.created_at,
          updated_at: updatedQuestionResult.updated_at,
        },
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

    // create PostgreSQL script: table already linked questions with answers and using ON DELETE CASCADE
    // When delete the question, the answers will be deleted automatically.
    const result = await connectionPool.query(
      `
        DELETE
        FROM questions
        WHERE id=$1
        `,
      [questionIdFromClient]
    );

    return res.status(200).json({
      message: "Question and its answers deleted successfully.",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Server could not process the request due to database issue.",
    });
  }
});

export default questionsRouter;
