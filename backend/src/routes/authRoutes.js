import express from "express";
import { forgotPassword, login, logout, me, refreshToken, register, resetPassword, verifyEmail } from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";
import validate from "../middleware/validate.js";
import { loginRules, registerRules } from "../validators/authValidators.js";

const router = express.Router();

router.post("/register", registerRules, validate, register);
router.post("/login", loginRules, validate, login);
router.get("/me", protect, me);
router.post("/logout", logout);
router.post("/refresh-token", protect, refreshToken);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.patch("/verify-email", protect, verifyEmail);

export default router;
