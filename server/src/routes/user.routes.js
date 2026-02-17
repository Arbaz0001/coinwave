import { Router } from "express";
import {
  getAllUsers,
  updateUser,
  deleteUser,
  updateAccountDetails,
  getUserBankDetails,
  getUserStatement,
} from "../controllers/user.controller.js";
import { verifyJWT, isAdmin, authMiddleware } from "../middlewares/authMiddleware.js";

const router = Router();

// 🔹 User routes (authenticated)
router.get("/bank-details", authMiddleware, getUserBankDetails);
router.get("/statement", authMiddleware, getUserStatement);

// 🔹 Admin only
router.get("/", verifyJWT, isAdmin, getAllUsers);
router.delete("/:id", verifyJWT, isAdmin, deleteUser);
router.put("/user/:id", verifyJWT, isAdmin, updateUser);
router.put("/:editUserId", verifyJWT, isAdmin, updateAccountDetails);

export default router;

