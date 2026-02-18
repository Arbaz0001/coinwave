import express from "express";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import {
  addUpiAccount,
  getUserUpiAccounts,
  updateUpiAccount,
  deleteUpiAccount,
  setPrimaryUpi,
} from "../controllers/upiAccountController.js";

const router = express.Router();

// User UPI Account routes
router.post("/add", authMiddleware, addUpiAccount);
router.get("/user", authMiddleware, getUserUpiAccounts);
router.put("/:id", authMiddleware, updateUpiAccount);
router.delete("/:id", authMiddleware, deleteUpiAccount);
router.patch("/:id/primary", authMiddleware, setPrimaryUpi);

export default router;
