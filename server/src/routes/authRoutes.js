import express from "express";
import {
  register,
  login,
  requestOtp,
  verifyOtp,
  refreshTokenFn,
  getProfile,
  updateProfile,
  changePassword
} from "../controllers/authController.js";

import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/request-otp", requestOtp);
router.post("/verify-otp", verifyOtp);
router.post("/refresh", refreshTokenFn);

router.get("/me", authMiddleware, getProfile);
router.put("/me", authMiddleware, updateProfile);
router.put("/change-password", authMiddleware, changePassword);

export default router;
