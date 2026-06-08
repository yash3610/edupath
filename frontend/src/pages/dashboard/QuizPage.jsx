import React, { useState } from "react";
import { quizzes } from "../../data/dashboardData.js";
import { MotionCard, SectionHeading } from "../../components/dashboard/DashboardPrimitives.jsx";

export default function QuizPage() {
  const [answers, setAnswers] = useState({});
  const complete = Object.keys(answers).length === quizzes.length;
  const score = quizzes.reduce((sum, quiz, index) => sum + (answers[index] === quiz.answer ? 1 : 0), 0);

  return (
    <div className="space-y-5">
      <SectionHeading
        eyebrow="Quiz System"
        title="React Professional Quiz"
        action={<div className="w-fit rounded-xl bg-[#ff6b35] px-4 py-2 text-sm font-black text-white">Timer: 08:42</div>}
      />

      {quizzes.map((quiz, index) => (
        <MotionCard key={quiz.question}>
          <h3 className="text-lg font-black">{index + 1}. {quiz.question}</h3>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {quiz.options.map((option, optionIndex) => (
              <button
                key={option}
                onClick={() => setAnswers({ ...answers, [index]: optionIndex })}
                className={`rounded-xl border p-4 text-left text-sm font-bold transition ${answers[index] === optionIndex ? "border-[#ff6b35] bg-orange-50 text-[#ff6b35] dark:bg-white/10" : "border-slate-200 bg-white dark:border-white/10 dark:bg-slate-800"}`}
              >
                {option}
              </button>
            ))}
          </div>
          {complete && <p className="mt-4 text-sm font-bold text-slate-500 dark:text-slate-300">{quiz.explanation}</p>}
        </MotionCard>
      ))}

      {complete && (
        <MotionCard>
          <h3 className="text-2xl font-black">Score: {score}/{quizzes.length}</h3>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-300">
            Accuracy: {Math.round((score / quizzes.length) * 100)}%. Retake the quiz to improve weak topics.
          </p>
          <button className="mt-5 rounded-xl bg-[#ff6b35] px-5 py-3 text-sm font-black text-white" onClick={() => setAnswers({})}>
            Retake Quiz
          </button>
        </MotionCard>
      )}
    </div>
  );
}
