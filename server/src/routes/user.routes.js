import { Router } from "express";
import {
  getAllUsers,
  updateUser,
  deleteUser,
  updateAccountDetails,
} from "../controllers/user.controller.js";
import { verifyJWT, isAdmin } from "../middlewares/authMiddleware.js";

const router = Router();

// 🔹 Admin only
router.get("/", verifyJWT, isAdmin, getAllUsers);
router.delete("/:id", verifyJWT, isAdmin, deleteUser);
router.put("/user/:id", verifyJWT, isAdmin, updateUser);
router.put("/:editUserId", verifyJWT, isAdmin, updateAccountDetails);

export default router;

