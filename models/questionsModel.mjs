import connectionPool from "../utils/db.mjs";

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

// GET
export const getAllQuestions = async (req) => {
  const title = req.query.title ? `%${req.query.title}%` : null;
  const category = req.query.category ? `%${req.query.category}%` : null;

  try {
    let query = `
      SELECT id, title, description, category, created_at, updated_at
      FROM questions
      WHERE 1=1`;

    const queryParams = [];

    if (title !== null) {
      query += ` AND title ILIKE $${queryParams.length + 1}`;
      queryParams.push(title);
    }

    if (category !== null) {
      query += ` AND category ILIKE $${queryParams.length + 1}`;
      queryParams.push(category);
    }

    const result = await connectionPool.query(query, queryParams);

    if (result.rows.length === 0) {
      return false;
    }

    return result;
  } catch (error) {
    console.error("Error fetching question: ", error);
  }
};

export const getQuestionById = async (id) => {
  try {
    const questionIdFromClient = id;

    const result = await connectionPool.query(
      `
            SELECT id, title, description, category, created_at, updated_at
            FROM questions
            WHERE id=$1
            `,
      [questionIdFromClient]
    );

    if (result.rows.length === 0) {
      return false;
    }

    const question = result.rows[0];

    return question;
  } catch (error) {
    console.error("Error fetching question by ID: ", error);
  }
};

export const getAnswersByQuestionId = async (id) => {
  try {
    const questionId = id;

    const answers = await connectionPool.query(
      `
        SELECT id, question_id, content, created_at, updated_at
        FROM answers
        WHERE question_id=$1
        `,
      [questionId]
    );

    if (answers.rows.length === 0) {
      return false;
    }

    return answers;
  } catch (error) {
    console.error("Error fetching answers: ", error);
  }
};

// POST
export const createQuestion = async (reqBodyData) => {
  try {
    const { title, description, category } = reqBodyData;
    const newQuestion = { title, description, category };

    const result = await connectionPool.query(
      `
    INSERT INTO questions (title, description, category)
    VALUES ($1, $2, $3)
    RETURNING id, title, description, category, created_at, updated_at
    `,
      [newQuestion.title, newQuestion.description, newQuestion.category]
    );

    if (result.rowCount === 0) {
      return false;
    }

    const question = result.rows[0];

    return question;
  } catch (error) {
    console.error("Error creating question: ", error);
  }
};

export const createAnswerByQuestionId = async (req) => {
  try {
    const questionId = req.params.id;

    if (!(await checkIfQuestionExists(questionId))) {
      return false;
    }

    const result = await connectionPool.query(
      `
        INSERT INTO answers (question_id, content)
        VALUES ($1, $2)
        RETURNING id, question_id, content, created_at, updated_at
        `,
      [questionId, req.body.content]
    );

    const answer = result.rows[0];

    return answer;
  } catch (error) {
    console.error("Error creating answer: ", error);
  }
};

export const handleQuestionVote = async (id, voteValue) => {
  try {
    const questionId = id;

    if (!(await checkIfQuestionExists(questionId))) {
      return false;
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
      return false;
    }

    const question = fetchQuestionResult.rows[0];
    return question;
  } catch (error) {
    console.error("Error voting question: ", error);
  }
};

// PUT
export const updateQuestion = async (req) => {
  try {
    const questionIdFromClient = req.params.id;

    if (!(await checkIfQuestionExists(questionIdFromClient))) {
      return false;
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

    if (result.rowCount === 0) {
      return false;
    }

    const updatedQuestionResult = result.rows[0];

    return updatedQuestionResult;
  } catch (error) {
    console.error("Error updating question: ", error);
  }
};

// DELETE
export const deleteQuestion = async (id) => {
  try {
    const questionIdFromClient = id;

    if (!(await checkIfQuestionExists(questionIdFromClient))) {
      return false;
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

    if (result.rowCount === 0) {
      return false;
    }

    return result;
  } catch (error) {
    console.error("Error deleting question: ", error);
  }
};
