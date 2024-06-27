export const validateCreatePostData = (req, res, next) => {
  if (!req.body.title) {
    return res.status(400).json({
      message: "400 Bad Request: Missing or invalid request data.",
    });
  }

  if (!(req.body.title.length >= 10 && req.body.title.length <= 300)) {
    return res.status(400).json({
      message:
        "400 Bad Request: Invalid request data. Please input between 10 to 300 characters.",
    });
  }

  if (!(req.body.description.length <= 10000)) {
    return res.status(400).json({
      message:
        "400 Bad Request: Invalid request data. Please input not exceed 10,000 characters.",
    });
  }

  next();
};
