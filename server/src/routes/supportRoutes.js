import express from "express";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import {
  getSupportContact,
  updateSupportContact,
} from "../controllers/supportController.js";

const router = express.Router();

// ✅ PUBLIC: Get support contact details
router.get("/contact", getSupportContact);

// ✅ ADMIN: Update support contact (requires auth only, role check in controller)
router.put("/contact/update", authMiddleware, updateSupportContact);

export default router;
