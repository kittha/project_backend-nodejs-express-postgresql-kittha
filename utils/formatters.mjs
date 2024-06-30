function formatQuestion(question) {
  return {
    id: question.id,
    title: question.title,
    description: question.description,
    catgory: question.category,
    created_at: question.created_at,
    updated_at: question.updated_at,
  };
}

function formatAnswer(answer) {
  return {
    id: answer.id,
    question_id: answer.question_id,
    content: answer.content,
    created_at: answer.created_at,
    updated_at: answer.updated_at,
  };
}

function formatAnswerWithUpvoteDownvote(answer, aggregatedVoteData) {
  return {
    ...formatAnswer(answer),
    upvotes: aggregatedVoteData.total_upvotes || 0,
    downvotes: aggregatedVoteData.total_downvotes || 0,
  };
}

export { formatQuestion, formatAnswer, formatAnswerWithUpvoteDownvote };
