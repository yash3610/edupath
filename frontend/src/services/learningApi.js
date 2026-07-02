import { apiRequest } from "./api.js";

async function unwrap(request) {
  const result = await request();
  return result.data;
}

export const learningApi = {
  getMyCourses: (params = {}) => {
    const query = new URLSearchParams(params);
    return unwrap(() => apiRequest(`/api/student/my-courses${query.size ? `?${query}` : ""}`));
  },
  getContinueLearning: () => unwrap(() => apiRequest("/api/student/continue-learning")),
  getCourse: (courseId) => unwrap(() => apiRequest(`/api/learning/course/${courseId}`)),
  getCourseModules: (courseId) => unwrap(() => apiRequest(`/api/learning/course/${courseId}/modules`)),
  getLecture: (lectureId) => unwrap(() => apiRequest(`/api/learning/lecture/${lectureId}`)),
  getProgress: (courseId) => unwrap(() => apiRequest(`/api/student/course-progress/${courseId}`)),
  completeLecture: (lectureId) => unwrap(() => apiRequest(`/api/learning/lecture/${lectureId}/complete`, { method: "PATCH", body: JSON.stringify({ completed: true }) })),
  saveProgress: (lectureId, payload) => unwrap(() => apiRequest(`/api/learning/lecture/${lectureId}/progress`, { method: "PATCH", body: JSON.stringify(payload) })),
  bookmarkLecture: (lectureId, payload = {}) => unwrap(() => apiRequest(`/api/learning/lecture/${lectureId}/bookmark`, { method: "POST", body: JSON.stringify(payload) })),
};
