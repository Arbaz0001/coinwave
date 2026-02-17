import { Router } from "express";
import {
  addBankAccount,
  getUserBankAccounts,
  updateBankAccount,
  setPrimaryAccount,
  deleteBankAccount,
  getAdminUserBankAccounts,
  getAllBankAccounts,
  adminUpdateBankAccount,
  adminDeleteBankAccount,
} from "../controllers/bankAccountController.js";
import { authMiddleware, verifyJWT, isAdmin } from "../middlewares/authMiddleware.js";

const router = Router();

// 🔹 USER ROUTES (authenticated)
router.post("/add", authMiddleware, addBankAccount);
router.get("/list", authMiddleware, getUserBankAccounts);
router.put("/:id", authMiddleware, updateBankAccount);
router.put("/:id/primary", authMiddleware, setPrimaryAccount);
router.delete("/:id", authMiddleware, deleteBankAccount);

// 🔹 ADMIN ROUTES
router.get("/admin/all", verifyJWT, isAdmin, getAllBankAccounts);
router.get("/admin/user/:userId", verifyJWT, isAdmin, getAdminUserBankAccounts);
router.put("/admin/:id", verifyJWT, isAdmin, adminUpdateBankAccount);
router.delete("/admin/:id", verifyJWT, isAdmin, adminDeleteBankAccount);

export default router;
