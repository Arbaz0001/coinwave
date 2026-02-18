import express from "express";
import upload from "../middlewares/upload.js";
import { authMiddleware, isAdmin } from "../middlewares/authMiddleware.js";
import {
  createPack,
  getAdminPacks,
  updatePack,
  deletePack,
  getPurchaseRequests,
  approvePurchaseRequest,
  rejectPurchaseRequest,
  upsertAdminPaymentDetails,
  getAdminPaymentDetails,
  getActivePacks,
  createPackPurchaseRequest,
  getMyInvestments,
  getPackHistory,
} from "../controllers/investmentController.js";

const router = express.Router();

// Admin routes
router.post("/admin/create-pack", authMiddleware, isAdmin, createPack);
router.get("/admin/packs", authMiddleware, isAdmin, getAdminPacks);
router.put("/admin/pack/:id", authMiddleware, isAdmin, updatePack);
router.delete("/admin/pack/:id", authMiddleware, isAdmin, deletePack);
router.get("/admin/purchase-requests", authMiddleware, isAdmin, getPurchaseRequests);
router.put("/admin/approve/:purchaseId", authMiddleware, isAdmin, approvePurchaseRequest);
router.put("/admin/reject/:purchaseId", authMiddleware, isAdmin, rejectPurchaseRequest);
router.post("/admin/payment-details", authMiddleware, isAdmin, upload.single("qrCode"), upsertAdminPaymentDetails);
router.get("/payment-details", getAdminPaymentDetails);
router.get("/admin/payment-details", getAdminPaymentDetails);
router.get("/admin/pack-history", authMiddleware, isAdmin, getPackHistory);

// User routes
router.get("/packs", getActivePacks);
router.post("/purchase-pack", authMiddleware, upload.single("paymentScreenshot"), createPackPurchaseRequest);
router.get("/my-investments", authMiddleware, getMyInvestments);

export default router;
