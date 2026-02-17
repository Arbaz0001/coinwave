import { Router } from "express";
import {
  getAllSettings,
  getSetting,
  updateSetting,
  bulkUpdateSettings,
  initializeSettings,
} from "../controllers/settingsController.js";
import { verifyJWT, isAdmin, authMiddleware } from "../middlewares/authMiddleware.js";

const router = Router();

// 🔹 PUBLIC ROUTES (any user can view settings)
router.get("/public/all", getAllSettings);
router.get("/public/:key", getSetting);

// 🔹 ADMIN ROUTES (only admin can update)
router.put("/admin/:key", verifyJWT, isAdmin, updateSetting);
router.post("/admin/bulk-update", verifyJWT, isAdmin, bulkUpdateSettings);
router.post("/admin/initialize", verifyJWT, isAdmin, initializeSettings);

export default router;
