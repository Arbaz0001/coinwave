import express from "express";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import {
  addAdminBankAccount,
  getAdminBankAccounts,
  updateAdminBankAccount,
  deleteAdminBankAccount,
  setAdminPrimaryBankAccount,
} from "../controllers/adminBankAccountController.js";

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// POST - Add new bank account
router.post("/add", addAdminBankAccount);

// GET - Get all bank accounts for the admin
router.get("/", getAdminBankAccounts);

// PUT - Update bank account
router.put("/:id", updateAdminBankAccount);

// DELETE - Delete bank account
router.delete("/:id", deleteAdminBankAccount);

// PATCH - Set primary bank account
router.patch("/:id/primary", setAdminPrimaryBankAccount);

export default router;
