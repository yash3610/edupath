import { apiBlobRequest, apiRequest } from "./api.js";

export const quizApi = {
  getAdminQuizzes: (status = "") => apiRequest(`/api/admin/quizzes${status ? `?status=${encodeURIComponent(status)}` : ""}`),
  getAdminQuizAnalytics: (id) => apiRequest(`/api/admin/quizzes/${id}/analytics`),
  approveAdminQuiz: (id) => apiRequest(`/api/admin/quizzes/${id}/approve`, { method: "PATCH" }),
  rejectAdminQuiz: (id) => apiRequest(`/api/admin/quizzes/${id}/reject`, { method: "PATCH" }),
  deleteAdminQuiz: (id) => apiRequest(`/api/admin/quizzes/${id}`, { method: "DELETE" }),

  getInstructorCourses: () => apiRequest("/api/instructor/my-courses"),
  getInstructorQuizzes: () => apiRequest("/api/instructor/quizzes"),
  createInstructorQuiz: (payload) => apiRequest("/api/instructor/quizzes", { method: "POST", body: JSON.stringify(payload) }),
  updateInstructorQuiz: (id, payload) => apiRequest(`/api/instructor/quizzes/${id}`, { method: "PATCH", body: JSON.stringify(payload) }),
  publishInstructorQuiz: (id) => apiRequest(`/api/instructor/quizzes/${id}/publish`, { method: "PATCH" }),
  deleteInstructorQuiz: (id) => apiRequest(`/api/instructor/quizzes/${id}`, { method: "DELETE" }),
  getInstructorQuizAnalytics: (id) => apiRequest(`/api/instructor/quizzes/${id}/analytics`),

  getStudentQuizzes: () => apiRequest("/api/quizzes/student"),
  getCourseQuizzes: (courseId) => apiRequest(`/api/quizzes/student/course/${courseId}`),
  getQuizInstructions: (id) => apiRequest(`/api/quizzes/${id}/instructions`),
  startQuiz: (id) => apiRequest(`/api/quizzes/${id}/start`, { method: "POST" }),
  getAttempt: (attemptId) => apiRequest(`/api/quizzes/attempt/${attemptId}`),
  saveAnswer: (attemptId, payload) => apiRequest(`/api/quizzes/attempt/${attemptId}/save-answer`, { method: "PATCH", body: JSON.stringify(payload) }),
  markReview: (attemptId, payload) => apiRequest(`/api/quizzes/attempt/${attemptId}/mark-review`, { method: "PATCH", body: JSON.stringify(payload) }),
  clearAnswer: (attemptId, questionId) => apiRequest(`/api/quizzes/attempt/${attemptId}/clear-answer`, { method: "PATCH", body: JSON.stringify({ questionId }) }),
  submitQuiz: (attemptId) => apiRequest(`/api/quizzes/attempt/${attemptId}/submit`, { method: "POST" }),
  getQuizResult: (attemptId) => apiRequest(`/api/quizzes/attempt/${attemptId}/result`),
  getQuizHistory: (quizId) => apiRequest(`/api/quizzes/${quizId}/history`),
  downloadResultPdf: (attemptId) => apiBlobRequest(`/api/quizzes/attempt/${attemptId}/download-result`),
};
