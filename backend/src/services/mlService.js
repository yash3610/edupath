export function buildMLAnalytics(userId) {
  return {
    userId,
    learningPattern: { bestTime: "Evening", activeDays: ["Mon", "Wed", "Sat"] },
    engagementScore: 86,
    completionProbability: 78,
    weakTopics: ["Async React", "Data modeling"],
    strongTopics: ["Routing", "Components"],
    skillGrowth: [
      { skill: "React", value: 88 },
      { skill: "AI", value: 69 },
      { skill: "Data", value: 81 },
    ],
    successPrediction: "High chance of completion if weekly learning remains above 5 hours.",
  };
}
