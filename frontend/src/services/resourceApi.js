import { apiFormRequest, apiRequest, assetUrl } from "./api";

function formatDate(value) {
  if (!value) return "Recently";
  return new Date(value).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function fileName(value) {
  if (!value) return "";
  try {
    const url = new URL(value, window.location.origin);
    return decodeURIComponent(url.pathname.split("/").filter(Boolean).pop() || "");
  } catch {
    return String(value).split("/").filter(Boolean).pop() || "";
  }
}

export function mapInstructorResource(resource = {}) {
  const url = assetUrl(resource.url);
  const name = resource.name || resource.title || fileName(url) || "Resource";
  return {
    ...resource,
    id: resource.id || resource._id || `${resource.lectureId || "resource"}-${name}`,
    name,
    url,
    course: resource.course || "Course",
    module: resource.module || "Module",
    lecture: resource.lecture || "Lecture",
    type: resource.type || "resource",
    source: resource.source || "Lecture resource",
    uploaded: formatDate(resource.uploaded || resource.updatedAt || resource.createdAt),
  };
}

export const resourceApi = {
  instructorResources: () => apiRequest("/api/instructor/resources"),
  uploadLectureResource: (lectureId, formData) =>
    apiFormRequest(`/api/instructor/lectures/${encodeURIComponent(lectureId)}/resources`, formData),
  replaceLectureResource: (lectureId, resourceIndex, formData) =>
    apiFormRequest(
      `/api/instructor/lectures/${encodeURIComponent(lectureId)}/resources/${encodeURIComponent(resourceIndex)}`,
      formData,
      { method: "PATCH" },
    ),
  deleteLectureResource: (lectureId, resourceIndex) =>
    apiRequest(
      `/api/instructor/lectures/${encodeURIComponent(lectureId)}/resources/${encodeURIComponent(resourceIndex)}`,
      { method: "DELETE" },
    ),
};
