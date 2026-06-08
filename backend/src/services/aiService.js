export async function askAI({ question, context }) {
  if (!process.env.OPENAI_API_KEY && !process.env.GEMINI_API_KEY) {
    return `AI demo answer: ${question}. Context: ${context || "general learning"}.`;
  }

  return "AI provider integration point configured. Add OpenAI/Gemini SDK call here.";
}

export async function summarizeText({ text }) {
  return {
    summary: `Summary: ${(text || "Lecture content").slice(0, 180)}`,
    keyPoints: ["Understand core concept", "Review examples", "Practice with quiz"],
    actionItems: ["Create notes", "Complete assignment", "Ask follow-up doubts"],
  };
}

export async function recommendCourses({ interests = [], careerGoal = "" }) {
  return {
    careerGoal,
    recommendations: interests.map((interest, index) => ({
      title: `${interest} Masterclass`,
      difficulty: index === 0 ? "beginner" : "intermediate",
      reason: `Matches ${careerGoal || "your learning goal"}`,
    })),
  };
}
