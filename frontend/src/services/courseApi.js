import { apiFormRequest, apiRequest, assetUrl } from "./api";

const fallbackCover = "/assets/images/course/course-1/1.png";

export function statusLabel(value) {
  return String(value || "draft")
    .replace(/-/g, "_")
    .split("_")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function uiCourseStatus(value) {
  const status = String(value || "draft");
  return {
    review_pending: "pending",
    changes_requested: "rejected",
    ready_to_publish: "approved",
  }[status] || status;
}

export function mapCourse(course = {}) {
  const instructor = course.instructor;
  const instructorName = typeof instructor === "object" && instructor ? instructor.name : course.instructorName;
  const updatedAt = course.submittedForReviewAt || course.updatedAt || course.createdAt;

  return {
    ...course,
    id: course._id || course.id,
    cover: assetUrl(course.thumbnail) || fallbackCover,
    instructor: instructorName || "Unassigned",
    category: course.category || "Uncategorized",
    price: Number(course.discountPrice || course.price || 0),
    enrollments: Number(course.enrollments || 0),
    completion: Number(course.completion?.percentage || course.completion || 0),
    rating: Number(course.rating || 0),
    revenue: Number(course.revenue || 0),
    status: uiCourseStatus(course.status),
    rawStatus: course.status || "draft",
    updated: updatedAt ? new Date(updatedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "Recently",
  };
}

export const courseApi = {
  instructorCourses: () => apiRequest("/api/instructor/my-courses"),
  instructorCourseDetails: (courseId) => apiRequest(`/api/instructor/courses/${courseId}`),
  updateInstructorCourse: (courseId, payload) => apiRequest(`/api/instructor/courses/${courseId}`, { method: "PATCH", body: JSON.stringify(payload) }),
  updateInstructorCourseForm: (courseId, formData) => apiFormRequest(`/api/instructor/courses/${courseId}`, formData, { method: "PATCH" }),
  instructorModules: (courseId) => apiRequest(`/api/instructor/courses/${courseId}/modules`),
  instructorLectures: (moduleId) => apiRequest(`/api/instructor/modules/${moduleId}/lectures`),
  createModule: (courseId, payload) => apiRequest(`/api/instructor/courses/${courseId}/modules`, { method: "POST", body: JSON.stringify(payload) }),
  updateModule: (moduleId, payload) => apiRequest(`/api/instructor/modules/${moduleId}`, { method: "PATCH", body: JSON.stringify(payload) }),
  deleteModule: (moduleId) => apiRequest(`/api/instructor/modules/${moduleId}`, { method: "DELETE" }),
  createLecture: (moduleId, payload) => apiRequest(`/api/instructor/modules/${moduleId}/lectures`, { method: "POST", body: JSON.stringify(payload) }),
  updateLecture: (lectureId, payload) => apiRequest(`/api/instructor/lectures/${lectureId}`, { method: "PATCH", body: JSON.stringify(payload) }),
  deleteLecture: (lectureId) => apiRequest(`/api/instructor/lectures/${lectureId}`, { method: "DELETE" }),
  submitForReview: (courseId) => apiRequest(`/api/instructor/courses/${courseId}/submit-review`, { method: "PATCH", body: JSON.stringify({}) }),
  pendingApprovals: () => apiRequest("/api/admin/pending-approvals"),
  adminCourses: () => apiRequest("/api/admin/courses"),
  adminCourseDetails: (courseId) => apiRequest(`/api/admin/courses/${courseId}`),
  approveCourse: (courseId) => apiRequest(`/api/admin/courses/${courseId}/approve`, { method: "PATCH" }),
  rejectCourse: (courseId, reason) => apiRequest(`/api/admin/courses/${courseId}/reject`, { method: "PATCH", body: JSON.stringify({ reason }) }),
  publishCourse: (courseId) => apiRequest(`/api/admin/courses/${courseId}/publish`, { method: "PATCH" }),
  unpublishCourse: (courseId) => apiRequest(`/api/admin/courses/${courseId}/unpublish`, { method: "PATCH" }),
  archiveCourse: (courseId) => apiRequest(`/api/admin/courses/${courseId}/archive`, { method: "PATCH" }),
  deleteCourse: (courseId) => apiRequest(`/api/admin/courses/${courseId}`, { method: "DELETE" }),
};
