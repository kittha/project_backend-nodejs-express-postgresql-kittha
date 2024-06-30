import {
  getAllQuestions as getAllQuestionsFromModel,
  getQuestionById as getQuestionByIdFromModel,
  getAnswersByQuestionId as getAnswersByQuestionIdFromModel,
  createQuestion as createQuestionFromModel,
  createAnswerByQuestionId as createAnswerByQuestionIdFromModel,
  handleQuestionVote as handleQuestionVoteFromModel,
  updateQuestion as updateQuestionFromModel,
  deleteQuestion as deleteQuestionFromModel,
} from "../models/questionsModel.mjs";
import { formatQuestion, formatAnswer } from "../utils/formatters.mjs";

// GET
export const getAllQuestions = async (req, res) => {
  try {
    const questions = await getAllQuestionsFromModel(req);

    if (!questions) {
      return res.status(404).json({
        message: "404 Not Found: Question not found",
      });
    }

    const formattedQuestions = questions.rows.map(formatQuestion);

    return res.status(200).json({
      message: "200 OK: Successfully retrieved the list of questions.",
      data: formattedQuestions,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Server could not process the request due to database issue.",
    });
  }
};

export const getQuestionById = async (req, res) => {
  try {
    const question = await getQuestionByIdFromModel(req.params.id);

    if (!question) {
      return res.status(404).json({
        message: "404 Not Found: Question not found",
      });
    }

    const formattedQuestion = formatQuestion(question);

    return res.status(200).json({
      message: "200 OK: Successfully retrieved the question",
      data: formattedQuestion,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Server could not process the request due to database issue.",
    });
  }
};

export const getAnswersByQuestionId = async (req, res) => {
  try {
    const answers = await getAnswersByQuestionIdFromModel(req.params.id);

    if (!answers) {
      return res.status(404).json({
        message: "404 Not Found: Question not found.",
      });
    }

    const formattedAnswers = answers.rows.map(formatAnswer);

    return res.status(200).json({
      message: "200 OK: Successfully retrieved the answers.",
      data: formattedAnswers,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Server could not process the request due to database issue.",
    });
  }
};

// POST
export const createQuestion = async (req, res) => {
  try {
    const result = await createQuestionFromModel(req.body);

    if (!result) {
      return res.status(404).json({
        message: "404 Not Found: Question not found.",
      });
    }

    const formattedQuestion = formatQuestion(result);

    return res.status(201).json({
      message: "201 Created: Question created successfully.",
      data: formattedQuestion,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Server could not process the request due to database issue.",
    });
  }
};

export const createAnswerByQuestionId = async (req) => {
  try {
    const answer = await createAnswerByQuestionIdFromModel(req.params.id);

    if (!answer) {
      return res.status(404).json({
        message: "404 Not Found: Question not found.",
      });
    }

    const formattedAnswer = formatAnswer(answer);

    return res.status(201).json({
      message: "201 Created: Answer created successfuly.",
      data: formattedAnswer,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server could not process the request due to database issue.",
    });
  }
};

export const handleQuestionUpvote = async (req, res) => {
  try {
    const voteValue = 1;
    const result = await handleQuestionVoteFromModel(req.params.id, voteValue);

    if (!result) {
      return res.status(404).json({
        message: "404 Not Found: Question not found.",
      });
    }

    return res.status(200).json({
      message: `200 OK: Successfully ${
        voteValue === 1 ? "upvoted" : "downvoted"
      } the question.`,
      data: result,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Server could not process the request due to database issue.",
    });
  }
};

export const handleQuestionDownvote = async (req, res) => {
  try {
    const voteValue = -1;
    const result = await handleQuestionVoteFromModel(req.params.id, voteValue);

    if (!result) {
      return res.status(404).json({
        message: "404 Not Found: Question not found.",
      });
    }

    return res.status(200).json({
      message: `200 OK: Successfully ${
        voteValue === 1 ? "upvoted" : "downvoted"
      } the question.`,
      data: result,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Server could not process the request due to database issue.",
    });
  }
};

// PUT
export const updateQuestion = async (req, res) => {
  try {
    const result = await updateQuestionFromModel(req);

    if (!result) {
      return res.status(404).json({
        message: "404 Not Found: Question not found",
      });
    }

    const formattedQuestion = formatQuestion(result);
    return res.status(200).json({
      message: "200 OK: Successfully updated the question.",
      data: formattedQuestion,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Server could not process the request due to database issue.",
    });
  }
};

// DELETE
export const deleteQuestion = async (req, res) => {
  try {
    const result = await deleteQuestionFromModel(req.params.id);

    if (!result) {
      return res.status(404).json({
        message: "404 Not Found: Question not found",
      });
    }

    return res.status(200).json({
      message: "Question and its answers deleted successfully.",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Server could not process the request due to database issue.",
    });
  }
};
