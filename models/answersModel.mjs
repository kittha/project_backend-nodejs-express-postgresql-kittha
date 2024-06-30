import connectionPool from "../utils/db.mjs";
import { validateCreateUpdateAnswer } from "../middlewares/post-put-answers.validation.mjs";

const checkIfAnswerExists = async (answerId) => {
  const result = await connectionPool.query(
    `
        SELECT id
        FROM answers
        WHERE id=$1
        `,
    [answerId]
  );
  return result.rows.length !== 0;
};

// GET
export const getAnswerById = async (id) => {
  try {
    const answerId = id;

    const result = await connectionPool.query(
      `
            SELECT id, question_id, content, created_at, updated_at
            FROM answers
            WHERE id=$1
            `,
      [answerId]
    );

    if (result.rows.length === 0) {
      return false;
    }

    return result.rows[0];
  } catch (error) {
    console.error("Error fetching question: ", error);
  }
};

// POST
export const handleAnswerVote = async (id, voteValue) => {
  try {
    const answerId = id;

    if (!(await checkIfAnswerExists(answerId))) {
      return false;
    }

    await connectionPool.query(
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
      return false;
    }

    const updatedAnswer = fetchAnswerResult.rows[0];

    return updatedAnswer;
  } catch (error) {
    console.error("Error voting answer: ", error);
  }
};

// PUT
export const updateAnswer = async (req) => {
  try {
    const answerId = req.params.id;
    const { content } = req.body;

    if (!(await checkIfAnswerExists(answerId))) {
      return false;
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
      return false;
    }

    return result.rows[0];
  } catch (error) {
    console.error("Error updating answer: ", error);
  }
};

// DELETE
export const deleteAnswer = async (id) => {
  try {
    const answerId = id;

    if (!(await checkIfAnswerExists(answerId))) {
      return false;
    }

    const result = await connectionPool.query(
      `
        DELETE FROM answers
        WHERE id=$1
        `,
      [answerId]
    );

    if (result.rowCount === 0) {
      return false;
    }

    return result;
  } catch (error) {
    console.error("Error deleting answer: ", error);
  }
};
