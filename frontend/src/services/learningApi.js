import { apiRequest } from "./api.js";
import { courses as fallbackCourses, modules as fallbackModules } from "../data/dashboardData.js";

async function withFallback(request, fallback) {
  try {
    const result = await request();
    return result.data;
  } catch {
    return fallback;
  }
}

const fallbackEnrollments = fallbackCourses.map((course) => ({
  _id: `enrollment-${course.id}`,
  status: course.progress === 100 ? "completed" : "active",
  progress: course.progress,
  course: {
    _id: course.id,
    title: course.title,
    thumbnail: course.thumbnail,
    instructor: { name: course.instructor },
    duration: course.duration,
    currentLecture: course.currentLecture,
    totalLectures: course.totalLectures,
    completedLectures: course.completedLectures,
  },
}));

const fallbackModuleDocs = fallbackModules.map((module, moduleIndex) => ({
  _id: `module-${moduleIndex + 1}`,
  title: module.title,
  order: moduleIndex + 1,
  lectures: module.lectures.map(([title, done, time], lectureIndex) => ({
    _id: `lecture-${moduleIndex + 1}-${lectureIndex + 1}`,
    title,
    completed: done,
    duration: time,
    durationSeconds: parseDuration(time),
    description: "Learn with a focused lesson, resources, and progress tracking.",
    videoUrl: "",
    order: lectureIndex + 1,
  })),
}));

export const learningApi = {
  getMyCourses: (params = {}) => {
    const query = new URLSearchParams(params);
    return withFallback(() => apiRequest(`/api/student/my-courses${query.size ? `?${query}` : ""}`), fallbackEnrollments);
  },
  getContinueLearning: () => withFallback(() => apiRequest("/api/student/continue-learning"), fallbackEnrollments[0]),
  getCourse: (courseId) => withFallback(() => apiRequest(`/api/learning/course/${courseId}`), fallbackEnrollments.find((item) => item.course._id === courseId)?.course || fallbackEnrollments[0].course),
  getCourseModules: (courseId) => withFallback(() => apiRequest(`/api/learning/course/${courseId}/modules`), fallbackModuleDocs),
  getLecture: (lectureId) => withFallback(() => apiRequest(`/api/learning/lecture/${lectureId}`), fallbackModuleDocs.flatMap((module) => module.lectures).find((lecture) => lecture._id === lectureId) || fallbackModuleDocs[0].lectures[0]),
  getProgress: (courseId) => withFallback(() => apiRequest(`/api/student/course-progress/${courseId}`), fallbackModuleDocs.flatMap((module) => module.lectures).filter((lecture) => lecture.completed).map((lecture) => ({ lecture: lecture._id, completed: true }))),
  completeLecture: (lectureId) => withFallback(() => apiRequest(`/api/learning/lecture/${lectureId}/complete`, { method: "PATCH", body: JSON.stringify({ completed: true }) }), { lecture: lectureId, completed: true }),
  saveProgress: (lectureId, payload) => withFallback(() => apiRequest(`/api/learning/lecture/${lectureId}/progress`, { method: "PATCH", body: JSON.stringify(payload) }), payload),
};

function parseDuration(value) {
  const [minutes = 0, seconds = 0] = String(value).split(":").map(Number);
  return minutes * 60 + seconds;
}
