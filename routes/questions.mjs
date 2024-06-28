import { Router } from "express";
import connectionPool from "../utils/db.mjs";
import { validateCreateUpdateQuestion } from "../middlewares/post-put-questions.validation.mjs";
import { validateCreateUpdateAnswer } from "../middlewares/post-put-answers.validation.mjs";
import { rateLimiter } from "../middlewares/basic-rate-limit.mjs";

const questionsRouter = Router();

const checkIfQuestionExists = async (questionId) => {
  const result = await connectionPool.query(
    `
        SELECT id
        FROM questions
        WHERE id=$1 
        `,
    [questionId]
  );
  return result.rows.length !== 0;
};

// CREATE
questionsRouter.post(
  "/",
  [validateCreateUpdateQuestion, rateLimiter(10, 60000)],
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

questionsRouter.post(
  "/:id/answers",
  [validateCreateUpdateAnswer, rateLimiter(10, 60000)],
  async (req, res) => {
    const questionId = req.params.id;
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({
        message: "400 Bad Request: Missing or invalid request data.",
      });
    }
    try {
      if (!(await checkIfQuestionExists(questionId))) {
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
  }
);
questionsRouter.post(
  "/:id/upvote",
  [rateLimiter(1, 1440000)],
  async (req, res) => {
    const questionId = req.params.id;
    const voteValue = 1;

    try {
      if (!(await checkIfQuestionExists(questionId))) {
        return res.status(404).json({
          message: "404 Not Found: Question not found.",
        });
      }

      await connectionPool.query(
        `
        INSERT INTO question_votes (question_id, vote)
        VALUES ($1, $2)
        RETURNING * 
        `,
        [questionId, voteValue]
      );

      const fetchQuestionResult = await connectionPool.query(
        `
        SELECT
            q.id,
            q.title,
            q.description,
            q.category,
            q.created_at,
            q.updated_at,
            COALESCE(SUM(CASE WHEN qv.vote = 1 THEN 1 ELSE 0 END), 0) AS upvotes,
            COALESCE(SUM(CASE WHEN qv.vote = -1 THEN 1 ELSE 0 END), 0) AS downvotes
        FROM
            questions q
        LEFT JOIN
            question_votes qv ON q.id = qv.question_id
        WHERE
            q.id = $1
        GROUP BY
            q.id;
      `,
        [questionId]
      );
      if (fetchQuestionResult.rows.length === 0) {
        return res.status(404).json({
          message: "404 Not Found: Question not found.",
        });
      }

      const question = fetchQuestionResult.rows[0];

      return res.status(200).json({
        message: "200 OK: Successfully upvoted the question.",
        data: question,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        message: "Server could not process the request due to database issue.",
      });
    }
  }
);

questionsRouter.post(
  "/:id/downvote",
  [rateLimiter(1, 1440000)],
  async (req, res) => {
    const questionId = req.params.id;
    const voteValue = -1;

    try {
      if (!(await checkIfQuestionExists(questionId))) {
        return res.status(404).json({
          message: "404 Not Found: Question not found.",
        });
      }

      const result = await connectionPool.query(
        `
        INSERT INTO question_votes (question_id, vote)
        VALUES ($1, $2)
        RETURNING * 
        `,
        [questionId, voteValue]
      );

      const fetchQuestionResult = await connectionPool.query(
        `
        SELECT
            q.id,
            q.title,
            q.description,
            q.category,
            q.created_at,
            q.updated_at,
            COALESCE(SUM(CASE WHEN qv.vote = 1 THEN 1 ELSE 0 END), 0) AS upvotes,
            COALESCE(SUM(CASE WHEN qv.vote = -1 THEN 1 ELSE 0 END), 0) AS downvotes
        FROM
            questions q
        LEFT JOIN
            question_votes qv ON q.id = qv.question_id
        WHERE
            q.id = $1
        GROUP BY
            q.id;
      `,
        [questionId]
      );
      if (fetchQuestionResult.rows.length === 0) {
        return res.status(404).json({
          message: "404 Not Found: Question not found.",
        });
      }

      const question = fetchQuestionResult.rows[0];

      return res.status(200).json({
        message: "200 OK: Successfully downvoted the question.",
        data: question,
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
        WHERE   (title ILIKE $1 OR $1 IS NULL) OR
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

questionsRouter.get("/:id/answers", async (req, res) => {
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
questionsRouter.put(
  "/:questionId",
  [validateCreateUpdateQuestion],
  async (req, res) => {
    try {
      const questionIdFromClient = req.params.questionId;

      if (!(await checkIfQuestionExists(questionIdFromClient))) {
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

    if (!(await checkIfQuestionExists(questionIdFromClient))) {
      return res.status(404).json({
        message: "404 Not Found: Question not found",
      });
    }

    // create PostgreSQL script: table already linked questions with answers and using ON DELETE CASCADE
    // When delete the question, the answers will be deleted automatically.
    await connectionPool.query(
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
