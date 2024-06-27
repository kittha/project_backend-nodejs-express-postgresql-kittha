export const validateCreateUpdateQuestion = (req, res, next) => {
  if (!req.body.title) {
    return res.status(400).json({
      message: "400 Bad Request: Missing or invalid request data.",
    });
  }

  if (!(req.body.title.length >= 10 && req.body.title.length <= 100)) {
    return res.status(400).json({
      message:
        "400 Bad Request: Invalid request data. Please input between 10 to 100 characters.",
    });
  }

  if (!(req.body.description.length <= 300)) {
    return res.status(400).json({
      message:
        "400 Bad Request: Invalid request data. Please input not exceed 300 characters.",
    });
  }

  next();
};
