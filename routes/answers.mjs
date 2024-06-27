import { Router } from "express";
import connectionPool from "../utils/db.mjs";

const answersRouter = Router();

// CREATE

answersRouter.post("/:id/upvote", async (req, res) => {
  const answerId = req.params.id;
  const voteValue = 1;

  try {
    const checkIsAnswerExist = await connectionPool.query(
      `
            SELECT id
            FROM answers
            WHERE id=$1
            `,
      [answerId]
    );

    if (checkIsAnswerExist.rows.length === 0) {
      return res.status(404).json({
        message: "404 Not Found: Answer not found.",
      });
    }

    const result = await connectionPool.query(
      `
        INSERT INTO answer_votes (answer_id, vote)
        VALUES ($1, $2)
        RETURNING *
        `,
      [answerId, voteValue]
    );

    const fetchAnswerResult = await connectionPool.query(
      `
        SELECT
            a.id,
            a.question_id,
            a.content,
            a.created_at,
            a.updated_at,
            COALESCE(SUM(CASE WHEN av.vote = 1 THEN 1 ELSE 0 END), 0) AS upvotes,
            COALESCE(SUM(CASE WHEN av.vote = -1 THEN 1 ELSE 0 END), 0) AS downvotes
        FROM
            answers a
        LEFT JOIN
            answer_votes av ON a.id = av.answer_id
        WHERE
            a.id = $1
        GROUP BY
            a.id;
        `,
      [answerId]
    );

    if (fetchAnswerResult.rows.length === 0) {
      return res.status(404).json({
        message: "404 Not Found: Answer not found.",
      });
    }

    const updatedAnswer = fetchAnswerResult.rows[0];

    return res.status(200).json({
      message: "200 OK: Successfully upvoted the answer.",
      data: updatedAnswer,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Server could not process the request due to database issue.",
    });
  }
});

answersRouter.post("/:id/downvote", async (req, res) => {
  const answerId = req.params.id;
  const voteValue = -1;

  try {
    const checkIsAnswerExist = await connectionPool.query(
      `
            SELECT id
            FROM answers
            WHERE id=$1
            `,
      [answerId]
    );

    if (checkIsAnswerExist.rows.length === 0) {
      return res.status(404).json({
        message: "404 Not Found: Answer not found.",
      });
    }

    const result = await connectionPool.query(
      `
        INSERT INTO answer_votes (answer_id, vote)
        VALUES ($1, $2)
        RETURNING *
        `,
      [answerId, voteValue]
    );

    const fetchAnswerResult = await connectionPool.query(
      `
        SELECT
            a.id,
            a.question_id,
            a.content,
            a.created_at,
            a.updated_at,
            COALESCE(SUM(CASE WHEN av.vote = 1 THEN 1 ELSE 0 END), 0) AS upvotes,
            COALESCE(SUM(CASE WHEN av.vote = -1 THEN 1 ELSE 0 END), 0) AS downvotes
        FROM
            answers a
        LEFT JOIN
            answer_votes av ON a.id = av.answer_id
        WHERE
            a.id = $1
        GROUP BY
            a.id;
        `,
      [answerId]
    );

    if (fetchAnswerResult.rows.length === 0) {
      return res.status(404).json({
        message: "404 Not Found: Answer not found.",
      });
    }

    const updatedAnswer = fetchAnswerResult.rows[0];

    return res.status(200).json({
      message: "200 OK: Successfully downvoted the answer.",
      data: updatedAnswer,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Server could not process the request due to database issue.",
    });
  }
});

// READ
answersRouter.get("/:id", async (req, res) => {
  const answerId = req.params.id;

  try {
    const result = await connectionPool.query(
      `
            SELECT id, question_id, content, created_at, updated_at
            FROM answers
            WHERE id=$1
            `,
      [answerId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "404 Not Found: Answer not found.",
      });
    }

    return res.status(200).json({
      message: "200 OK: Successfully retrieved the answer.",
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
answersRouter.put("/:id", async (req, res) => {
  const answerId = req.params.id;
  const { content } = req.body;

  try {
    const checkIsAnswerExist = await connectionPool.query(
      `
            SELECT id
            FROM answers
            WHERE id=$1
            `,
      [answerId]
    );

    if (checkIsAnswerExist.rows.length === 0) {
      return res.status(404).json({
        message: "404 Not Found: Answer not found.",
      });
    }

    const result = await connectionPool.query(
      `
            UPDATE answers
            SET content = $1,
                updated_at = NOW()
            WHERE id=$2
            RETURNING id, question_id, content, created_at, updated_at
            `,
      [content, answerId]
    );

    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ message: "404 Not Found: Answer not found." });
    }

    return res.status(200).json({
      message: "200 OK: Successfully updated the answer.",
      data: result.rows[0],
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Server could not process the request due to database issue.",
    });
  }
});
// DELETE
answersRouter.delete("/:id", async (req, res) => {
  const answerId = req.params.id;

  try {
    const checkIsAnswerExist = await connectionPool.query(
      `
        SELECT id
        FROM answers
        WHERE id=$1
        `,
      [answerId]
    );

    if (checkIsAnswerExist.rows.length === 0) {
      return res.status(404).json({
        message: "404 Not Found: Answer not found.",
      });
    }

    const result = await connectionPool.query(
      `
        DELETE FROM answers
        WHERE id=$1
        `,
      [answerId]
    );

    return res.status(200).json({
      message: "200 OK: Answer deleted successfully.",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Server could not process the request due to database issue.",
    });
  }
});

export default answersRouter;
