// server/src/routes/paymentRoutes.js
import express from "express";
import {
  createPayment,
  getPayments,
  updatePaymentStatus,
} from "../controllers/paymentController.js";

const router = express.Router();

// ✅ User: create deposit request
router.post("/", createPayment);

// ✅ Admin: get all payments
router.get("/", getPayments);

// ✅ Admin: approve/reject deposit
router.put("/:id", updatePaymentStatus);

export default router;
