import { apiRequest, assetUrl } from "./api";

const json = (method, payload) => ({
  method,
  body: JSON.stringify(payload),
});

export function normalizeQuestion(question = {}) {
  const author = question.user || question.author || {};
  const tags = Array.isArray(question.tags) ? question.tags : [];
  const answerCount = Number(question.answerCount ?? question.replies ?? 0);

  return {
    ...question,
    id: question._id || question.id,
    authorName: author.name || question.authorName || "Learner",
    authorRole: author.role || question.authorRole || "student",
    avatar: assetUrl(author.avatar || question.avatar),
    courseTitle: question.course?.title || question.courseTitle || "General",
    title: question.title || "Question",
    body: question.body || "",
    tag: tags[0] || question.tag || "Q&A",
    tags,
    answerCount,
    status: answerCount > 0 ? "answered" : "open",
  };
}

export function normalizeAnswer(answer = {}) {
  const author = answer.user || {};
  return {
    ...answer,
    id: answer._id || answer.id,
    authorName: author.name || answer.authorName || "User",
    authorRole: author.role || answer.authorRole || "member",
    avatar: assetUrl(author.avatar || answer.avatar),
    body: answer.body || "",
    upvotes: Array.isArray(answer.upvotes) ? answer.upvotes.length : Number(answer.upvotes || 0),
    accepted: Boolean(answer.accepted),
  };
}

export const communityApi = {
  questions: async () => {
    const result = await apiRequest("/api/community/questions");
    return (result.data || []).map(normalizeQuestion);
  },
  questionDetails: async (questionId) => {
    const result = await apiRequest(`/api/community/questions/${encodeURIComponent(questionId)}`);
    return {
      question: normalizeQuestion(result.data?.question),
      answers: (result.data?.answers || []).map(normalizeAnswer),
    };
  },
  createQuestion: async (payload) => {
    const result = await apiRequest("/api/community/questions", json("POST", payload));
    return normalizeQuestion(result.data);
  },
  createAnswer: async (questionId, body) => {
    const result = await apiRequest(`/api/community/questions/${encodeURIComponent(questionId)}/answers`, json("POST", { body }));
    return normalizeAnswer(result.data);
  },
  instructorDoubts: async () => {
    const result = await apiRequest("/api/instructor/doubts");
    return (result.data || []).map(normalizeQuestion);
  },
  adminCommunity: async () => {
    const result = await apiRequest("/api/admin/community");
    return (result.data || []).map(normalizeQuestion);
  },
  deleteQuestion: (questionId) =>
    apiRequest(`/api/admin/community/${encodeURIComponent(questionId)}`, { method: "DELETE" }),
};
