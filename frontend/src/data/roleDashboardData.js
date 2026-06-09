export const adminStats = [
  ["Total Students", "12,480", "Users", "+8.2%"],
  ["Total Instructors", "438", "GraduationCap", "+12"],
  ["Total Courses", "1,286", "BookOpen", "+34"],
  ["Published Courses", "1,042", "CheckCircle2", "81%"],
  ["Pending Approvals", "24", "Clock3", "Needs review"],
  ["Total Revenue", "$284.6K", "WalletCards", "+14.8%"],
  ["Monthly Revenue", "$42.8K", "LineChart", "+9.4%"],
  ["Total Orders", "8,942", "ReceiptText", "+386"],
  ["Refund Requests", "18", "RefreshCcw", "6 urgent"],
];

export const instructorStats = [
  ["Total Courses", "18", "BookOpen", "+2 this month"],
  ["Published Courses", "12", "CheckCircle2", "67%"],
  ["Draft Courses", "6", "FileText", "3 in progress"],
  ["Total Students", "3,842", "Users", "+184"],
  ["Total Enrollments", "5,240", "UserRoundCheck", "+11.6%"],
  ["Total Revenue", "$86.4K", "WalletCards", "+18.2%"],
  ["Monthly Earnings", "$12.6K", "LineChart", "+7.4%"],
  ["Average Rating", "4.8", "Star", "2,140 reviews"],
  ["Pending Doubts", "16", "MessagesSquare", "5 urgent"],
  ["Assignment Reviews", "28", "FileCheck2", "Due this week"],
];

export const revenueData = [
  { month: "Jan", revenue: 24, users: 620, sales: 310 },
  { month: "Feb", revenue: 29, users: 710, sales: 360 },
  { month: "Mar", revenue: 31, users: 760, sales: 405 },
  { month: "Apr", revenue: 36, users: 890, sales: 470 },
  { month: "May", revenue: 39, users: 980, sales: 520 },
  { month: "Jun", revenue: 43, users: 1120, sales: 590 },
];

export const engagementData = [
  { day: "Mon", engagement: 68, watchTime: 4.2, quizScore: 74 },
  { day: "Tue", engagement: 76, watchTime: 5.1, quizScore: 81 },
  { day: "Wed", engagement: 71, watchTime: 4.7, quizScore: 78 },
  { day: "Thu", engagement: 84, watchTime: 6.2, quizScore: 86 },
  { day: "Fri", engagement: 79, watchTime: 5.8, quizScore: 82 },
  { day: "Sat", engagement: 91, watchTime: 7.4, quizScore: 88 },
  { day: "Sun", engagement: 73, watchTime: 4.9, quizScore: 80 },
];

export const adminTables = {
  topCourses: [
    ["React Mastery", "Jenny Wilson", "1,842", "$38,420"],
    ["Data Analytics Pro", "Robert Fox", "1,436", "$31,680"],
    ["UI Design Systems", "Esther Howard", "1,208", "$26,140"],
  ],
  approvals: [
    ["Advanced Node.js", "Devon Lane", "June 9, 2026", "Pending"],
    ["Figma for Products", "Kristin Watson", "June 8, 2026", "Pending"],
    ["Python Automation", "Cody Fisher", "June 8, 2026", "Changes requested"],
  ],
  orders: [
    ["#EP-8942", "Aarav Sharma", "React Mastery", "$49", "Paid"],
    ["#EP-8941", "Meera Joshi", "UI Design Systems", "$39", "Paid"],
    ["#EP-8940", "Rohan Kulkarni", "Data Analytics Pro", "$59", "Refund"],
  ],
};

export const instructorTables = {
  courses: [
    ["React Mastery", "1,842", "4.9", "$38,420", "Published"],
    ["Modern JavaScript", "1,206", "4.7", "$24,180", "Published"],
    ["Frontend Architecture", "794", "4.8", "$16,674", "Published"],
  ],
  tasks: [
    ["Review assignment submissions", "28 submissions", "High"],
    ["Answer student doubts", "16 unanswered", "Medium"],
    ["Publish React performance module", "Draft ready", "Medium"],
  ],
  classes: [
    ["Advanced React Patterns", "Today, 6:00 PM", "186 registered"],
    ["Frontend Career Q&A", "June 11, 5:30 PM", "242 registered"],
    ["Project Review Session", "June 13, 7:00 PM", "94 registered"],
  ],
};

export const rolePageConfig = {
  students: ["Students", "Manage student accounts and learning access", "Users", ["Name", "Email", "Enrollments", "Status"], [["Aarav Sharma", "aarav@edupath.com", "6 courses", "Active"], ["Meera Joshi", "meera@edupath.com", "4 courses", "Active"], ["Rohan Kulkarni", "rohan@edupath.com", "8 courses", "Review"]]],
  instructors: ["Instructors", "Manage instructors and verification", "GraduationCap", ["Instructor", "Courses", "Students", "Status"], [["Jenny Wilson", "12 courses", "3,842", "Verified"], ["Robert Fox", "8 courses", "2,416", "Verified"], ["Devon Lane", "3 courses", "624", "Pending"]]],
  courses: ["Courses", "Manage the complete course catalog", "BookOpen", ["Course", "Owner", "Students", "Status"], [["React Mastery", "Jenny Wilson", "1,842", "Published"], ["Data Analytics Pro", "Robert Fox", "1,436", "Published"], ["Advanced Node.js", "Devon Lane", "0", "Pending"]]],
  approvals: ["Course Approvals", "Review submitted courses before publishing", "PackageCheck", ["Course", "Instructor", "Submitted", "Status"], adminTables.approvals],
  categories: ["Categories", "Organize the learning catalog", "FolderKanban", ["Category", "Courses", "Slug", "Status"], [["Development", "428", "development", "Active"], ["Design", "186", "design", "Active"], ["Business", "142", "business", "Active"]]],
  orders: ["Orders", "Track customer orders and fulfillment", "ReceiptText", ["Order", "Student", "Course", "Amount", "Status"], adminTables.orders],
  payments: ["Payments", "Monitor successful and failed transactions", "CreditCard", ["Payment", "Student", "Method", "Amount", "Status"], [["PAY-4821", "Aarav Sharma", "Razorpay", "$49", "Success"], ["PAY-4820", "Meera Joshi", "Card", "$39", "Success"], ["PAY-4819", "Rohan Kulkarni", "UPI", "$59", "Refunded"]]],
  refunds: ["Refund Requests", "Review and resolve refund requests", "RefreshCcw", ["Request", "Student", "Amount", "Reason", "Status"], [["REF-182", "Rohan Kulkarni", "$59", "Course mismatch", "Pending"], ["REF-181", "Priya Shah", "$39", "Duplicate payment", "Approved"]]],
  coupons: ["Coupons", "Create and manage promotional offers", "Megaphone", ["Code", "Discount", "Usage", "Status"], [["LEARN20", "20%", "482 uses", "Active"], ["WELCOME10", "10%", "1,204 uses", "Active"], ["SUMMER25", "25%", "0 uses", "Scheduled"]]],
  assignments: ["Assignments", "Monitor assignments across courses", "FileCheck2", ["Assignment", "Course", "Submissions", "Status"], [["Dashboard Case Study", "React Mastery", "286", "Open"], ["Analytics Report", "Data Analytics", "194", "Grading"]]],
  certificates: ["Certificates", "Manage issued and verified certificates", "Award", ["Certificate", "Student", "Course", "Status"], [["CERT-2048", "Aarav Sharma", "React Mastery", "Verified"], ["CERT-2047", "Meera Joshi", "UI Design", "Verified"]]],
  reviews: ["Reviews", "Moderate course ratings and feedback", "Star", ["Student", "Course", "Rating", "Status"], [["Aarav Sharma", "React Mastery", "5.0", "Published"], ["Meera Joshi", "UI Design", "4.8", "Published"], ["Rohan Kulkarni", "Data Analytics", "3.0", "Flagged"]]],
  moderation: ["Community Moderation", "Keep discussions helpful and safe", "ShieldCheck", ["Discussion", "Author", "Reports", "Status"], [["React routing patterns", "Meera Joshi", "0", "Healthy"], ["Course refund discussion", "Rohan Kulkarni", "3", "Review"]]],
  reports: ["Reports", "Export platform performance and business reports", "ChartNoAxesCombined", ["Report", "Period", "Format", "Status"], [["Revenue Summary", "June 2026", "PDF", "Ready"], ["User Growth", "Q2 2026", "CSV", "Ready"], ["Course Performance", "June 2026", "XLSX", "Processing"]]],
  settings: ["Settings", "Control account, security, and platform preferences", "Settings", ["Preference", "Scope", "Value", "Status"], [["Email alerts", "Admin", "Important only", "Enabled"], ["Course auto-publish", "Platform", "Manual review", "Enabled"], ["Two-factor authentication", "Security", "Required", "Enabled"]]],
  "my-courses": ["My Courses", "Manage your teaching catalog", "BookOpen", ["Course", "Students", "Rating", "Revenue", "Status"], instructorTables.courses],
  "create-course": ["Create Course", "Start a new course and save it as a draft", "Plus", ["Step", "Details", "Progress", "Status"], [["Basic information", "Title, category and level", "100%", "Complete"], ["Curriculum", "Modules and lectures", "40%", "In progress"], ["Pricing", "Price and coupons", "0%", "Pending"]]],
  builder: ["Course Builder", "Build modules, lectures, and resources", "PanelTop", ["Module", "Lectures", "Duration", "Status"], [["Foundations", "8 lectures", "2h 14m", "Published"], ["Professional UI", "6 lectures", "1h 48m", "Draft"], ["Launch", "4 lectures", "58m", "Draft"]]],
  studentsProgress: ["Students", "Track enrollment and course progress", "Users", ["Student", "Course", "Progress", "Status"], [["Aarav Sharma", "React Mastery", "68%", "On track"], ["Meera Joshi", "React Mastery", "82%", "Excellent"], ["Rohan Kulkarni", "Modern JavaScript", "34%", "Needs attention"]]],
  liveClasses: ["Live Classes", "Schedule and manage live learning sessions", "Video", ["Class", "Date", "Registrations", "Status"], instructorTables.classes],
  doubts: ["Doubts / Q&A", "Answer questions from your learners", "MessagesSquare", ["Question", "Student", "Course", "Status"], [["Why does useEffect run twice?", "Aarav Sharma", "React Mastery", "Unanswered"], ["How should I memoize context?", "Meera Joshi", "React Mastery", "Answered"]]],
  earnings: ["Earnings", "Track course revenue and monthly income", "WalletCards", ["Course", "Sales", "Gross", "Your earning"], [["React Mastery", "1,842", "$38,420", "$30,736"], ["Modern JavaScript", "1,206", "$24,180", "$19,344"]]],
  payouts: ["Payouts", "Review completed and upcoming payouts", "CreditCard", ["Payout", "Period", "Amount", "Status"], [["PO-2406", "June 2026", "$10,840", "Processing"], ["PO-2405", "May 2026", "$9,620", "Paid"]]],
  analytics: ["Analytics", "Understand course and student performance", "LineChart", ["Metric", "Current", "Previous", "Change"], [["Completion rate", "76%", "71%", "+5%"], ["Average watch time", "34m", "29m", "+17%"], ["Quiz pass rate", "82%", "78%", "+4%"]]],
  messages: ["Messages", "Keep in touch with enrolled learners", "MessageCircle", ["Conversation", "Last message", "Time", "Status"], [["Aarav Sharma", "Thanks for the explanation.", "10 min ago", "Unread"], ["Study Group", "Live session starts at 6 PM.", "1 hour ago", "Read"]]],
  profile: ["Profile", "Manage your instructor profile and public bio", "UserRound", ["Field", "Current value", "Visibility", "Status"], [["Headline", "Senior Frontend Instructor", "Public", "Complete"], ["Experience", "9 years", "Public", "Complete"], ["Payout account", "•••• 4821", "Private", "Verified"]]],
};
