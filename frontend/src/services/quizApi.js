import { apiBlobRequest, apiRequest } from "./api.js";
import { fallbackAttempt, fallbackHistory, fallbackInstructions, fallbackQuizzes, fallbackResult } from "../data/quizData.js";

async function withFallback(request, fallback) {
  try {
    const result = await request();
    return result.data;
  } catch {
    return fallback;
  }
}

export const quizApi = {
  getStudentQuizzes: () => withFallback(() => apiRequest("/api/quizzes/student"), fallbackQuizzes),
  getCourseQuizzes: (courseId) => withFallback(() => apiRequest(`/api/quizzes/student/course/${courseId}`), fallbackQuizzes.filter((quiz) => quiz.course?._id === courseId)),
  getQuizInstructions: (id) => withFallback(() => apiRequest(`/api/quizzes/${id}/instructions`), fallbackInstructions),
  startQuiz: (id) => withFallback(() => apiRequest(`/api/quizzes/${id}/start`, { method: "POST" }), fallbackAttempt),
  getAttempt: (attemptId) => withFallback(() => apiRequest(`/api/quizzes/attempt/${attemptId}`), fallbackAttempt),
  saveAnswer: (attemptId, payload) => withFallback(() => apiRequest(`/api/quizzes/attempt/${attemptId}/save-answer`, { method: "PATCH", body: JSON.stringify(payload) }), { ok: true }),
  markReview: (attemptId, payload) => withFallback(() => apiRequest(`/api/quizzes/attempt/${attemptId}/mark-review`, { method: "PATCH", body: JSON.stringify(payload) }), { ok: true }),
  clearAnswer: (attemptId, questionId) => withFallback(() => apiRequest(`/api/quizzes/attempt/${attemptId}/clear-answer`, { method: "PATCH", body: JSON.stringify({ questionId }) }), { ok: true }),
  submitQuiz: (attemptId) => withFallback(() => apiRequest(`/api/quizzes/attempt/${attemptId}/submit`, { method: "POST" }), fallbackResult.attempt),
  getQuizResult: (attemptId) => withFallback(() => apiRequest(`/api/quizzes/attempt/${attemptId}/result`), fallbackResult),
  getQuizHistory: (quizId) => withFallback(() => apiRequest(`/api/quizzes/${quizId}/history`), fallbackHistory),
  downloadResultPdf: (attemptId) => apiBlobRequest(`/api/quizzes/attempt/${attemptId}/download-result`),
};
