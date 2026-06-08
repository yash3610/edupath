import { body, param } from "express-validator";

export const quizIdParam = [param("quizId").isMongoId().withMessage("Valid quiz id is required")];
export const attemptIdParam = [param("attemptId").isMongoId().withMessage("Valid attempt id is required")];

export const saveAnswerValidators = [
  body("questionId").isMongoId().withMessage("Valid question id is required"),
  body("selectedOption").optional().isString().trim(),
  body("selectedOptions").optional().isArray(),
  body("textAnswer").optional().isString().trim(),
  body("codeAnswer").optional().isString(),
  body("timeSpent").optional().isNumeric(),
];

export const createQuizValidators = [
  body("title").isString().trim().isLength({ min: 3 }).withMessage("Quiz title is required"),
  body("course").isMongoId().withMessage("Valid course is required"),
  body("duration").optional().isNumeric(),
  body("passingMarks").optional().isNumeric(),
  body("attemptsAllowed").optional().isInt({ min: 1 }),
  body("questions").optional().isArray(),
];
