export const student = {
  name: "Aarav Sharma",
  email: "aarav.sharma@edupath.com",
  phone: "+91 98765 43210",
  avatar: "/assets/images/course/details/student-2.jpg",
  bio: "Full-stack learner focused on React, AI products, and product design.",
  skills: ["React", "UI/UX", "Data Science", "Communication"],
  streak: 18,
  goal: 74,
  quote: "Small daily wins become serious mastery.",
  rank: "Top 4%",
};

export const stats = [
  ["Courses Enrolled", 12, "BookOpen"],
  ["Courses Completed", 7, "CheckCircle2"],
  ["Learning Hours", 146, "Clock3"],
  ["Certificates Earned", 5, "Award"],
  ["Quiz Average Score", 88, "Gauge"],
  ["Current Rank", 4, "Trophy"],
];

export const courses = [
  {
    id: "react-mastery",
    title: "React Mastery: Build Modern Products",
    instructor: "Jenny Wilson",
    thumbnail: "/assets/images/course/course-1/1.png",
    progress: 68,
    totalLectures: 42,
    completedLectures: 29,
    duration: "18h 40m",
    status: "In Progress",
    currentLecture: "Building reusable dashboard layouts",
  },
  {
    id: "ai-products",
    title: "AI Product Strategy & Prompt Systems",
    instructor: "Robert Fox",
    thumbnail: "/assets/images/course/course-1/2.png",
    progress: 34,
    totalLectures: 35,
    completedLectures: 12,
    duration: "12h 15m",
    status: "In Progress",
    currentLecture: "Designing AI learning assistants",
  },
  {
    id: "data-visualization",
    title: "Data Visualization with Real Analytics",
    instructor: "Esther Howard",
    thumbnail: "/assets/images/course/course-1/3.png",
    progress: 100,
    totalLectures: 28,
    completedLectures: 28,
    duration: "10h 20m",
    status: "Completed",
    currentLecture: "Final portfolio review",
  },
  {
    id: "design-systems",
    title: "Premium UI Design Systems",
    instructor: "Devon Lane",
    thumbnail: "/assets/images/course/course-1/4.png",
    progress: 0,
    totalLectures: 31,
    completedLectures: 0,
    duration: "14h 05m",
    status: "Not Started",
    currentLecture: "Visual foundations",
  },
];

export const modules = [
  { title: "Module 1: Foundations", lectures: [["Welcome and roadmap", true, "04:20"], ["Environment setup", true, "08:45"], ["Product thinking", true, "12:00"]] },
  { title: "Module 2: Professional UI", lectures: [["Layout architecture", true, "15:10"], ["Responsive dashboards", false, "18:25"], ["Motion principles", false, "11:50"]] },
  { title: "Module 3: Launch", lectures: [["Performance review", true, "09:35"], ["Production checklist", false, "13:15"]] },
];

export const weeklyHours = [
  { day: "Mon", hours: 2.5 },
  { day: "Tue", hours: 3.4 },
  { day: "Wed", hours: 1.8 },
  { day: "Thu", hours: 4.1 },
  { day: "Fri", hours: 2.9 },
  { day: "Sat", hours: 5.2 },
  { day: "Sun", hours: 3.7 },
];

export const skillGrowth = [
  { skill: "React", value: 88 },
  { skill: "Design", value: 76 },
  { skill: "AI", value: 69 },
  { skill: "Data", value: 81 },
  { skill: "Business", value: 63 },
];

export const quizzes = [
  { question: "Which hook is best for memoized derived data?", options: ["useMemo", "useEffect", "useRef", "useId"], answer: 0, explanation: "useMemo caches expensive derived values between renders." },
  { question: "What should protected API routes validate?", options: ["Only UI state", "Signed auth token", "CSS classes", "Image size"], answer: 1, explanation: "The backend must validate signed tokens before serving private data." },
  { question: "Which chart is best for weekly learning hours?", options: ["Bar chart", "Password field", "Modal", "Toast"], answer: 0, explanation: "Bar charts make time comparison across days easy." },
];

export const assignments = [
  ["React Dashboard Case Study", "Submitted", "June 14, 2026", "A", "Excellent component structure."],
  ["AI Notes Summarizer Brief", "Pending", "June 18, 2026", "-", "Upload a PDF or ZIP before deadline."],
  ["Analytics Report", "Reviewed", "June 10, 2026", "A+", "Strong storytelling with data."],
];

export const certificates = [
  ["React Product Builder", "/assets/images/course/course-1/1.png", "Verified"],
  ["Data Visualization", "/assets/images/course/course-1/3.png", "Verified"],
  ["Design Systems", "/assets/images/course/course-1/4.png", "In Review"],
];

export const achievements = [
  ["18 Day Streak", "Flame", "Study every day for 18 days"],
  ["Quiz Champion", "Trophy", "Score above 85% in five quizzes"],
  ["Fast Finisher", "Zap", "Complete a module ahead of schedule"],
  ["Community Helper", "MessageCircle", "Answer 10 student doubts"],
];

export const notifications = [
  ["New Lecture Added", "Responsive dashboard patterns is now live.", "2 min ago"],
  ["Quiz Result", "You scored 92% in React Hooks quiz.", "1 hour ago"],
  ["Assignment Feedback", "Instructor reviewed your Analytics Report.", "Yesterday"],
  ["New Certificate", "Data Visualization certificate is ready.", "June 7, 2026"],
];

export const orders = [
  ["INV-2401", "React Mastery", "$29.00", "Paid", "June 2, 2026"],
  ["INV-2402", "AI Product Strategy", "$39.00", "Paid", "June 5, 2026"],
  ["INV-2403", "Design Systems", "$25.00", "Pending", "June 8, 2026"],
];

export const aiFeatures = [
  ["AI Tutor", "Ask doubts and get context-aware explanations.", "Sparkles"],
  ["AI Quiz Generator", "Generate practice quizzes from lessons.", "Brain"],
  ["AI Notes Summarizer", "Turn long notes into crisp summaries.", "NotebookPen"],
  ["AI Course Recommendation", "Discover the next best course.", "Compass"],
  ["AI Learning Path Generator", "Create a personal roadmap.", "Route"],
  ["AI Performance Analyzer", "Understand your study patterns.", "LineChart"],
  ["AI Weakness Detector", "Find weak topics automatically.", "ScanSearch"],
  ["AI Career Guidance", "Map skills to future careers.", "BriefcaseBusiness"],
];
