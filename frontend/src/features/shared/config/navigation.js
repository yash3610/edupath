export const ADMIN_NAV = [
  {
    label: "Overview",
    items: [
      { title: "Dashboard", url: "/admin/dashboard", icon: "LayoutDashboard" },
      { title: "Reports", url: "/admin/dashboard/reports", icon: "BarChart3" },
      { title: "Notifications", url: "/admin/dashboard/notifications", icon: "Bell" },
    ],
  },
  {
    label: "People",
    items: [
      { title: "Students", url: "/admin/dashboard/students", icon: "Users" },
      {
        title: "Instructors",
        url: "/admin/dashboard/instructors",
        icon: "GraduationCap",
      },
      { title: "Community", url: "/admin/dashboard/community", icon: "MessagesSquare" },
    ],
  },
  {
    label: "Catalog",
    items: [
      { title: "Courses", url: "/admin/dashboard/courses", icon: "BookOpen" },
      { title: "Approvals", url: "/admin/dashboard/approvals", icon: "ShieldCheck" },
      { title: "Categories", url: "/admin/dashboard/categories", icon: "FolderTree" },
      {
        title: "Modules & Lectures",
        url: "/admin/dashboard/modules",
        icon: "PlayCircle",
      },
      { title: "Quizzes", url: "/admin/dashboard/quizzes", icon: "HelpCircle" },
      {
        title: "Assignments",
        url: "/admin/dashboard/assignments",
        icon: "ClipboardList",
      },
      { title: "Certificates", url: "/admin/dashboard/certificates", icon: "Award" },
      { title: "Live Classes", url: "/admin/dashboard/live", icon: "Video" },
    ],
  },
  {
    label: "Commerce",
    items: [
      { title: "Orders", url: "/admin/dashboard/orders", icon: "ShoppingBag" },
      { title: "Payments", url: "/admin/dashboard/payments", icon: "CreditCard" },
      { title: "Earnings", url: "/admin/dashboard/earnings", icon: "IndianRupee" },
      { title: "Payouts", url: "/admin/dashboard/payouts", icon: "Wallet" },
      { title: "Refunds", url: "/admin/dashboard/refunds", icon: "Undo2" },
      { title: "Coupons", url: "/admin/dashboard/coupons", icon: "Ticket" },
    ],
  },
  {
    label: "Engagement",
    items: [
      { title: "Reviews", url: "/admin/dashboard/reviews", icon: "Star" },
      { title: "CMS / Pages", url: "/admin/dashboard/cms", icon: "LayoutTemplate" },
      { title: "Support", url: "/admin/dashboard/support", icon: "LifeBuoy" },
    ],
  },
  {
    label: "Account",
    items: [{ title: "Settings", url: "/admin/dashboard/settings", icon: "Settings" }],
  },
];
export const INSTRUCTOR_NAV = [
  {
    label: "Overview",
    items: [
      { title: "Dashboard", url: "/instructor/dashboard", icon: "LayoutDashboard" },
      { title: "Analytics", url: "/instructor/dashboard/analytics", icon: "BarChart3" },
      {
        title: "Notifications",
        url: "/instructor/dashboard/notifications",
        icon: "Bell",
      },
    ],
  },
  {
    label: "Teaching",
    items: [
      { title: "My Courses", url: "/instructor/dashboard/courses", icon: "BookOpen" },
      { title: "Create Course", url: "/instructor/dashboard/create", icon: "Plus" },
      { title: "Course Builder", url: "/instructor/dashboard/builder", icon: "Blocks" },
      {
        title: "Modules & Lectures",
        url: "/instructor/dashboard/modules",
        icon: "PlayCircle",
      },
      { title: "Resources", url: "/instructor/dashboard/resources", icon: "Folder" },
    ],
  },
  {
    label: "Learners",
    items: [
      { title: "Students", url: "/instructor/dashboard/students", icon: "Users" },
      { title: "Quizzes", url: "/instructor/dashboard/quizzes", icon: "HelpCircle" },
      {
        title: "Assignments",
        url: "/instructor/dashboard/assignments",
        icon: "ClipboardList",
      },
      {
        title: "Doubts / Q&A",
        url: "/instructor/dashboard/doubts",
        icon: "MessageCircleQuestion",
      },
      { title: "Reviews", url: "/instructor/dashboard/reviews", icon: "Star" },
      { title: "Live Classes", url: "/instructor/dashboard/live", icon: "Video" },
    ],
  },
  {
    label: "Account",
    items: [
      { title: "Messages", url: "/instructor/dashboard/messages", icon: "MessageSquare" },
      { title: "Profile", url: "/instructor/dashboard/profile", icon: "User" },
      { title: "Settings", url: "/instructor/dashboard/settings", icon: "Settings" },
    ],
  },
];

