import Pack from "../models/Pack.js";
import PackPurchase from "../models/PackPurchase.js";
import Wallet from "../models/Wallet.js";
import User from "../models/User.js";
import AdminPaymentDetails from "../models/AdminPaymentDetails.js";

const getAuthUserId = (req) => req.user?._id || req.user?.id || null;

const ensurePositiveNumber = (value) => {
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount <= 0) return null;
  return amount;
};

export const createPack = async (req, res) => {
  try {
    const adminId = getAuthUserId(req);
    if (!adminId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const {
      packName,
      amount,
      interestPercent,
      description,
      isActive,
    } = req.body;

    if (!packName || amount === undefined || interestPercent === undefined) {
      return res.status(400).json({ success: false, message: "packName, amount and interestPercent are required" });
    }

    const parsedAmount = ensurePositiveNumber(amount);
    const parsedInterest = Number(interestPercent);
    const activeFlag = isActive === undefined ? true : Boolean(isActive);
    const invalidInterest = Number.isFinite(parsedInterest) === false || parsedInterest < 0;

    if (parsedAmount === null || invalidInterest) {
      return res.status(400).json({ success: false, message: "Invalid amount or interestPercent" });
    }

    const pack = await Pack.create({
      packName,
      amount: parsedAmount,
      interestPercent: parsedInterest,
      description: description ?? "",
      isActive: activeFlag,
      createdBy: adminId,
    });

    return res.status(201).json({
      success: true,
      message: "Investment pack created successfully",
      data: pack,
    });
  } catch (error) {
    console.error("createPack error:", error);
    return res.status(500).json({ success: false, message: "Failed to create pack", error: error.message });
  }
};

export const getAdminPacks = async (_req, res) => {
  try {
    const packs = await Pack.find().sort({ createdAt: -1 });
    return res.json({ success: true, data: packs });
  } catch (error) {
    console.error("getAdminPacks error:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch packs", error: error.message });
  }
};

export const updatePack = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = { ...req.body };

    if (updates.amount !== undefined) {
      const parsedAmount = ensurePositiveNumber(updates.amount);
      if (!parsedAmount) {
        return res.status(400).json({ success: false, message: "Invalid amount" });
      }
      updates.amount = parsedAmount;
    }

    if (updates.interestPercent !== undefined) {
      const parsedInterest = Number(updates.interestPercent);
      if (!Number.isFinite(parsedInterest) || parsedInterest < 0) {
        return res.status(400).json({ success: false, message: "Invalid interestPercent" });
      }
      updates.interestPercent = parsedInterest;
    }

    if (Object.prototype.hasOwnProperty.call(updates, "durationInDays")) {
      delete updates.durationInDays;
    }

    const pack = await Pack.findByIdAndUpdate(id, updates, { new: true, runValidators: true });

    if (!pack) {
      return res.status(404).json({ success: false, message: "Pack not found" });
    }

    return res.json({ success: true, message: "Pack updated successfully", data: pack });
  } catch (error) {
    console.error("updatePack error:", error);
    return res.status(500).json({ success: false, message: "Failed to update pack", error: error.message });
  }
};

export const deletePack = async (req, res) => {
  try {
    const { id } = req.params;
    const pack = await Pack.findByIdAndDelete(id);

    if (!pack) {
      return res.status(404).json({ success: false, message: "Pack not found" });
    }

    return res.json({ success: true, message: "Pack deleted successfully" });
  } catch (error) {
    console.error("deletePack error:", error);
    return res.status(500).json({ success: false, message: "Failed to delete pack", error: error.message });
  }
};

export const getPurchaseRequests = async (_req, res) => {
  try {
    const requests = await PackPurchase.find()
      .populate("userId", "fullName email phoneNumber")
      .populate("packId")
      .sort({ createdAt: -1 });

    return res.json({ success: true, data: requests });
  } catch (error) {
    console.error("getPurchaseRequests error:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch purchase requests", error: error.message });
  }
};

export const approvePurchaseRequest = async (req, res) => {
  try {
    const adminId = getAuthUserId(req);
    if (!adminId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const { purchaseId } = req.params;

    const purchase = await PackPurchase.findById(purchaseId).populate("packId");
    if (!purchase) {
      return res.status(404).json({ success: false, message: "Purchase request not found" });
    }

    if (purchase.status !== "pending") {
      return res.status(400).json({ success: false, message: `Request already ${purchase.status}` });
    }

    const interestPercent = Number(purchase.packId?.interestPercent || 0);
    const interestAmount = (Number(purchase.amountPaid) * interestPercent) / 100;
    const totalReturn = Number(purchase.amountPaid) + interestAmount;
    const approvedAt = new Date();

    const updatedPurchase = await PackPurchase.findOneAndUpdate(
      { _id: purchaseId, status: "pending" },
      {
        $set: {
          interestAmount,
          totalReturn,
          status: "approved",
          approvedAt,
          approvedBy: adminId,
        },
      },
      { new: true }
    ).populate("packId");

    if (!updatedPurchase) {
      return res.status(400).json({ success: false, message: "Request already processed" });
    }

    await Wallet.findOneAndUpdate(
      { userId: updatedPurchase.userId },
      {
        $inc: { balance: totalReturn },
        $push: {
          history: {
            type: "credit",
            amount: totalReturn,
            description: `Investment return credited for ${updatedPurchase.packId?.packName || "Pack"}`,
            source: "investment",
            referenceId: updatedPurchase._id,
          },
        },
      },
      {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true,
      }
    );

    await User.findByIdAndUpdate(updatedPurchase.userId, { $inc: { walletBalance: totalReturn } });

    return res.json({
      success: true,
      message: "Purchase approved and wallet credited",
      data: updatedPurchase,
      walletCreditAmount: totalReturn,
    });
  } catch (error) {
    console.error("approvePurchaseRequest error:", error);
    return res.status(500).json({ success: false, message: "Failed to approve purchase", error: error.message });
  }
};

export const rejectPurchaseRequest = async (req, res) => {
  try {
    const adminId = getAuthUserId(req);
    if (!adminId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const { purchaseId } = req.params;
    const { reason } = req.body;

    const purchase = await PackPurchase.findById(purchaseId);
    if (!purchase) {
      return res.status(404).json({ success: false, message: "Purchase request not found" });
    }

    if (purchase.status !== "pending") {
      return res.status(400).json({ success: false, message: `Request already ${purchase.status}` });
    }

    purchase.status = "rejected";
    purchase.rejectionReason = reason || "";
    purchase.approvedBy = adminId;
    await purchase.save();

    return res.json({ success: true, message: "Purchase rejected successfully", data: purchase });
  } catch (error) {
    console.error("rejectPurchaseRequest error:", error);
    return res.status(500).json({ success: false, message: "Failed to reject purchase", error: error.message });
  }
};

export const upsertAdminPaymentDetails = async (req, res) => {
  try {
    const adminId = getAuthUserId(req);
    if (!adminId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const { bankAccountDetails, upiId } = req.body;
    const qrCodeImage = req.file ? `/uploads/${req.file.filename}` : undefined;

    const trimmedBankDetails = (bankAccountDetails || "").trim();
    const trimmedUpiId = (upiId || "").trim();
    const existingDetails = await AdminPaymentDetails.findOne({ adminId });
    const hasExistingQr = Boolean(existingDetails?.qrCodeImage);

    if (!trimmedBankDetails) {
      return res.status(400).json({ success: false, message: "Bank account details are required" });
    }

    if (!trimmedUpiId) {
      return res.status(400).json({ success: false, message: "UPI ID is required" });
    }

    if (!qrCodeImage && !hasExistingQr) {
      return res.status(400).json({ success: false, message: "QR code image is required" });
    }

    const payload = {
      bankAccountDetails: trimmedBankDetails,
      upiId: trimmedUpiId,
      isActive: true,
    };

    if (qrCodeImage) {
      payload.qrCodeImage = qrCodeImage;
    }

    const details = await AdminPaymentDetails.findOneAndUpdate(
      { adminId },
      { $set: payload, $setOnInsert: { adminId } },
      { new: true, upsert: true }
    );

    return res.json({
      success: true,
      message: "Payment details saved successfully",
      data: details,
    });
  } catch (error) {
    console.error("upsertAdminPaymentDetails error:", error);
    return res.status(500).json({ success: false, message: "Failed to save payment details", error: error.message });
  }
};

export const getAdminPaymentDetails = async (_req, res) => {
  try {
    const details = await AdminPaymentDetails.findOne({ isActive: true }).sort({ updatedAt: -1 });
    return res.json({ success: true, data: details || null });
  } catch (error) {
    console.error("getAdminPaymentDetails error:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch payment details", error: error.message });
  }
};

export const getActivePacks = async (_req, res) => {
  try {
    const packs = await Pack.find({ isActive: true }).sort({ createdAt: -1 });

    const withExpectedReturn = packs.map((pack) => {
      const expectedReturn = Number(pack.amount) + (Number(pack.amount) * Number(pack.interestPercent)) / 100;
      return {
        ...pack.toObject(),
        expectedReturn,
      };
    });

    return res.json({ success: true, data: withExpectedReturn });
  } catch (error) {
    console.error("getActivePacks error:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch active packs", error: error.message });
  }
};

export const createPackPurchaseRequest = async (req, res) => {
  try {
    const userId = getAuthUserId(req);
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const { packId, amountPaid } = req.body;
    const parsedAmount = ensurePositiveNumber(amountPaid);

    if (!packId || !parsedAmount) {
      return res.status(400).json({ success: false, message: "packId and valid amountPaid are required" });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: "Payment screenshot is required" });
    }

    const paymentDetails = await AdminPaymentDetails.findOne({ isActive: true }).sort({ updatedAt: -1 });
    const hasCompletePaymentDetails =
      Boolean(paymentDetails?.bankAccountDetails?.trim()) &&
      Boolean(paymentDetails?.upiId?.trim()) &&
      Boolean(paymentDetails?.qrCodeImage);

    if (!hasCompletePaymentDetails) {
      return res.status(400).json({
        success: false,
        message: "Payment is temporarily unavailable. Please contact admin.",
      });
    }

    const pack = await Pack.findById(packId);
    if (!pack || !pack.isActive) {
      return res.status(404).json({ success: false, message: "Active pack not found" });
    }

    const interestAmount = (parsedAmount * Number(pack.interestPercent)) / 100;
    const totalReturn = parsedAmount + interestAmount;

    const purchase = await PackPurchase.create({
      userId,
      packId,
      amountPaid: parsedAmount,
      interestAmount,
      totalReturn,
      paymentScreenshot: `/uploads/${req.file.filename}`,
      status: "pending",
    });

    return res.status(201).json({
      success: true,
      message: "Pack purchase request submitted successfully",
      data: purchase,
    });
  } catch (error) {
    console.error("createPackPurchaseRequest error:", error);
    return res.status(500).json({ success: false, message: "Failed to submit purchase request", error: error.message });
  }
};

export const getMyInvestments = async (req, res) => {
  try {
    const userId = getAuthUserId(req);
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const investments = await PackPurchase.find({ userId })
      .populate("packId")
      .sort({ createdAt: -1 });

    return res.json({ success: true, data: investments });
  } catch (error) {
    console.error("getMyInvestments error:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch investments", error: error.message });
  }
};

export const getPackHistory = async (_req, res) => {
  try {
    const history = await PackPurchase.find()
      .populate("userId", "fullName email phoneNumber")
      .populate("packId")
      .sort({ createdAt: -1 });

    return res.json({ success: true, data: history });
  } catch (error) {
    console.error("getPackHistory error:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch pack history", error: error.message });
  }
};
