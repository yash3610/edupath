import { apiBlobRequest, apiFormRequest, apiRequest } from "./api.js";

const json = (method, body) => ({ method, body: body === undefined ? undefined : JSON.stringify(body) });

export const liveClassApi = {
  getAdminLiveClasses: (status = "") => apiRequest(`/api/admin/live-classes${status ? `?status=${encodeURIComponent(status)}` : ""}`),
  getAdminLiveClass: (id) => apiRequest(`/api/admin/live-classes/${id}`),
  approveLiveClass: (id) => apiRequest(`/api/admin/live-classes/${id}/approve`, json("PATCH")),
  rejectLiveClass: (id, reason) => apiRequest(`/api/admin/live-classes/${id}/reject`, json("PATCH", { reason })),
  cancelAdminLiveClass: (id, reason) => apiRequest(`/api/admin/live-classes/${id}/cancel`, json("PATCH", { reason })),
  rescheduleLiveClass: (id, data) => apiRequest(`/api/admin/live-classes/${id}/reschedule`, json("PATCH", data)),
  getAdminAttendance: (id) => apiRequest(`/api/admin/live-classes/${id}/attendance`),
  announceLiveClass: (id, data) => apiRequest(`/api/admin/live-classes/${id}/announcement`, json("POST", data)),
  deleteAdminLiveClass: (id) => apiRequest(`/api/admin/live-classes/${id}`, json("DELETE")),

  createLiveClass: (data) => apiRequest("/api/instructor/live-classes", json("POST", data)),
  getInstructorLiveClasses: () => apiRequest("/api/instructor/live-classes"),
  getInstructorLiveClass: (id) => apiRequest(`/api/instructor/live-classes/${id}`),
  updateLiveClass: (id, data) => apiRequest(`/api/instructor/live-classes/${id}`, json("PATCH", data)),
  deleteLiveClass: (id) => apiRequest(`/api/instructor/live-classes/${id}`, json("DELETE")),
  startLiveClass: (id) => apiRequest(`/api/instructor/live-classes/${id}/start`, json("PATCH")),
  completeLiveClass: (id) => apiRequest(`/api/instructor/live-classes/${id}/complete`, json("PATCH")),
  cancelLiveClass: (id, reason) => apiRequest(`/api/instructor/live-classes/${id}/cancel`, json("PATCH", { reason })),
  uploadRecording: (id, formData) => apiFormRequest(`/api/instructor/live-classes/${id}/recording`, formData),
  uploadResources: (id, formData) => apiFormRequest(`/api/instructor/live-classes/${id}/resources`, formData),
  getInstructorAttendance: (id) => apiRequest(`/api/instructor/live-classes/${id}/attendance`),
  exportAttendance: (id) => apiBlobRequest(`/api/instructor/live-classes/${id}/export-attendance`),

  getStudentLiveClasses: () => apiRequest("/api/student/live-classes"),
  getTodayLiveClasses: () => apiRequest("/api/student/live-classes/today"),
  getUpcomingLiveClasses: () => apiRequest("/api/student/live-classes/upcoming"),
  getLiveClassRecordings: () => apiRequest("/api/student/live-classes/recordings"),
  getStudentLiveClass: (id) => apiRequest(`/api/student/live-classes/${id}`),
  joinLiveClass: (id) => apiRequest(`/api/student/live-classes/${id}/join`, json("POST")),
  leaveLiveClass: (id) => apiRequest(`/api/student/live-classes/${id}/leave`, json("POST")),
  getLiveClassRecording: (id) => apiRequest(`/api/student/live-classes/${id}/recording`),
  getLiveClassResources: (id) => apiRequest(`/api/student/live-classes/${id}/resources`),
  askQuestion: (id, question) => apiRequest(`/api/student/live-classes/${id}/questions`, json("POST", { question })),
};
