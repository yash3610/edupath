import { apiRequest, assetUrl } from "./api";

export function formatAssignmentDate(value) {
  if (!value) return "No due date";
  return new Date(value).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function fileNameFromUrl(value) {
  if (!value) return "Submitted file";
  try {
    const url = new URL(value, window.location.origin);
    const name = decodeURIComponent(url.pathname.split("/").filter(Boolean).pop() || "");
    return name || "Submitted file";
  } catch {
    return String(value).split("/").filter(Boolean).pop() || "Submitted file";
  }
}

export function mapSubmission(submission = {}) {
  const student = submission.student && typeof submission.student === "object" ? submission.student : {};
  const fileUrl = assetUrl(submission.fileUrl);
  return {
    ...submission,
    id: submission._id || submission.id,
    studentName: student.name || submission.studentName || "Student",
    studentEmail: student.email || submission.studentEmail || "",
    fileUrl,
    fileName: fileNameFromUrl(fileUrl || submission.fileUrl),
    submittedAt: formatAssignmentDate(submission.updatedAt || submission.createdAt),
    grade: submission.grade ?? "",
    feedback: submission.feedback || "",
    status: submission.status || "submitted",
  };
}

export function mapAssignment(assignment = {}, submissions = []) {
  const course = assignment.course && typeof assignment.course === "object" ? assignment.course : {};
  const dueDate = assignment.dueDate ? new Date(assignment.dueDate) : null;
  const submitted = submissions.filter((item) => ["submitted", "graded"].includes(item.status)).length;
  const pending = submissions.filter((item) => item.status === "submitted").length;
  const graded = submissions.filter((item) => item.status === "graded").length;
  return {
    ...assignment,
    id: assignment._id || assignment.id,
    courseId: course._id || course.id || assignment.course,
    course: course.title || assignment.courseTitle || "Course",
    deadline: formatAssignmentDate(assignment.dueDate),
    maxMarks: Number(assignment.maxMarks || 100),
    submissions: submitted,
    pending,
    graded,
    status: dueDate && dueDate < new Date() ? "past" : "active",
  };
}

export const assignmentApi = {
  instructorAssignments: () => apiRequest("/api/instructor/assignments"),
  instructorSubmissions: (assignmentId) =>
    apiRequest(`/api/instructor/assignments/${encodeURIComponent(assignmentId)}/submissions`),
  createInstructorAssignment: (courseId, payload) =>
    apiRequest(`/api/instructor/courses/${encodeURIComponent(courseId)}/assignments`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  gradeSubmission: (submissionId, payload) =>
    apiRequest(`/api/instructor/assignments/${encodeURIComponent(submissionId)}/grade`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),
};
