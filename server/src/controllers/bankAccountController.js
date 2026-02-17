import UserBankAccount from "../models/UserBankAccount.js";
import mongoose from "mongoose";

const emitBankAccountsUpdated = (req, userId, action, accountId) => {
  const io = req.app?.get("io");
  if (io && userId) {
    io.to(String(userId)).emit("bankAccountsUpdated", {
      action,
      accountId: String(accountId),
    });
  }
};

// 🔹 USER ROUTES

// Add new bank account
export const addBankAccount = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const { accountNumber, ifscCode, accountHolderName, bankName, accountType, isPrimary } = req.body;

    // Validate required fields
    if (!accountNumber || !ifscCode || !accountHolderName || !bankName) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: accountNumber, ifscCode, accountHolderName, bankName",
      });
    }

    const existingCount = await UserBankAccount.countDocuments({ userId });
    const shouldSetPrimary = Boolean(isPrimary) || existingCount === 0;

    if (shouldSetPrimary) {
      await UserBankAccount.updateMany({ userId }, { isPrimary: false });
    }

    const newAccount = new UserBankAccount({
      userId,
      accountNumber,
      ifscCode,
      accountHolderName,
      bankName,
      accountType: accountType || "Savings",
      isPrimary: shouldSetPrimary,
    });

    await newAccount.save();
    emitBankAccountsUpdated(req, userId, "created", newAccount._id);

    return res.status(201).json({
      success: true,
      message: "Bank account added successfully",
      data: newAccount,
    });
  } catch (error) {
    console.error("Error adding bank account:", error);
    return res.status(500).json({
      success: false,
      message: "Error adding bank account",
      error: error.message,
    });
  }
};

// Get all bank accounts for user
export const getUserBankAccounts = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const accounts = await UserBankAccount.find({ userId }).sort({ isPrimary: -1, createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: accounts,
    });
  } catch (error) {
    console.error("Error fetching bank accounts:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching bank accounts",
      error: error.message,
    });
  }
};

// Update bank account
export const updateBankAccount = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid account ID" });
    }

    const { accountNumber, ifscCode, accountHolderName, bankName, accountType, isPrimary, notes } = req.body;

    // Check if account belongs to user
    const account = await UserBankAccount.findOne({ _id: id, userId });
    if (!account) {
      return res.status(404).json({
        success: false,
        message: "Bank account not found",
      });
    }

    // If setting as primary, unset previous primary
    if (isPrimary && !account.isPrimary) {
      await UserBankAccount.updateMany({ userId, _id: { $ne: id } }, { isPrimary: false });
    }

    // Update fields
    if (accountNumber) account.accountNumber = accountNumber;
    if (ifscCode) account.ifscCode = ifscCode;
    if (accountHolderName) account.accountHolderName = accountHolderName;
    if (bankName) account.bankName = bankName;
    if (accountType) account.accountType = accountType;
    if (isPrimary !== undefined) account.isPrimary = isPrimary;
    if (notes !== undefined) account.notes = notes;

    await account.save();
    emitBankAccountsUpdated(req, userId, "updated", account._id);

    return res.status(200).json({
      success: true,
      message: "Bank account updated successfully",
      data: account,
    });
  } catch (error) {
    console.error("Error updating bank account:", error);
    return res.status(500).json({
      success: false,
      message: "Error updating bank account",
      error: error.message,
    });
  }
};

// Set primary account
export const setPrimaryAccount = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid account ID" });
    }

    // Check if account belongs to user
    const account = await UserBankAccount.findOne({ _id: id, userId });
    if (!account) {
      return res.status(404).json({
        success: false,
        message: "Bank account not found",
      });
    }

    // Unset all other primary accounts
    await UserBankAccount.updateMany({ userId }, { isPrimary: false });

    // Set this as primary
    account.isPrimary = true;
    await account.save();
    emitBankAccountsUpdated(req, userId, "primary-changed", account._id);

    return res.status(200).json({
      success: true,
      message: "Primary account set successfully",
      data: account,
    });
  } catch (error) {
    console.error("Error setting primary account:", error);
    return res.status(500).json({
      success: false,
      message: "Error setting primary account",
      error: error.message,
    });
  }
};

// Delete bank account
export const deleteBankAccount = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid account ID" });
    }

    const account = await UserBankAccount.findOne({ _id: id, userId });
    if (!account) {
      return res.status(404).json({
        success: false,
        message: "Bank account not found",
      });
    }

    // If deleting primary, set first remaining as primary
    if (account.isPrimary) {
      const firstAccount = await UserBankAccount.findOne(
        { userId, _id: { $ne: id } },
        {},
        { sort: { createdAt: 1 } }
      );
      if (firstAccount) {
        firstAccount.isPrimary = true;
        await firstAccount.save();
      }
    }

    await UserBankAccount.deleteOne({ _id: id });
    emitBankAccountsUpdated(req, userId, "deleted", id);

    return res.status(200).json({
      success: true,
      message: "Bank account deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting bank account:", error);
    return res.status(500).json({
      success: false,
      message: "Error deleting bank account",
      error: error.message,
    });
  }
};

// 🔹 ADMIN ROUTES

// Get all bank accounts for a specific user (admin)
export const getAdminUserBankAccounts = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const { userId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ success: false, message: "Invalid user ID" });
    }

    const accounts = await UserBankAccount.find({ userId }).sort({ isPrimary: -1, createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: accounts,
    });
  } catch (error) {
    console.error("Error fetching user bank accounts:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching bank accounts",
      error: error.message,
    });
  }
};

// Get all bank accounts with user info (admin) - for admin dashboard
export const getAllBankAccounts = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const { search, limit = 50, skip = 0 } = req.query;
    let filter = {};

    if (search) {
      // Search by user ID, account number, or account holder name
      filter = {
        $or: [
          { userId: mongoose.Types.ObjectId.isValid(search) ? search : null },
          { accountNumber: new RegExp(search, "i") },
          { accountHolderName: new RegExp(search, "i") },
          { bankName: new RegExp(search, "i") },
        ],
      };
      // Remove null ObjectId from filter
      filter.$or = filter.$or.filter((item) => !("userId" in item) || item.userId);
    }

    const accounts = await UserBankAccount.find(filter)
      .populate("userId", "phoneNumber email fullName")
      .sort({ createdAt: -1 })
      .limit(Number.parseInt(limit, 10))
      .skip(Number.parseInt(skip, 10));

    const total = await UserBankAccount.countDocuments(filter);

    return res.status(200).json({
      success: true,
      data: accounts,
      total,
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Error fetching all bank accounts:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching bank accounts",
      error: error.message,
    });
  }
};

// Admin update bank account
export const adminUpdateBankAccount = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid account ID" });
    }

    const { accountNumber, ifscCode, accountHolderName, bankName, accountType, verified, notes, isPrimary } = req.body;

    const account = await UserBankAccount.findById(id);
    if (!account) {
      return res.status(404).json({
        success: false,
        message: "Bank account not found",
      });
    }

    // Update fields
    if (accountNumber) account.accountNumber = accountNumber;
    if (ifscCode) account.ifscCode = ifscCode;
    if (accountHolderName) account.accountHolderName = accountHolderName;
    if (bankName) account.bankName = bankName;
    if (accountType) account.accountType = accountType;
    if (isPrimary === true && !account.isPrimary) {
      await UserBankAccount.updateMany({ userId: account.userId, _id: { $ne: id } }, { isPrimary: false });
      account.isPrimary = true;
    }
    if (isPrimary === false) account.isPrimary = false;
    if (verified !== undefined) account.verified = verified;
    if (notes !== undefined) account.notes = notes;

    await account.save();
    emitBankAccountsUpdated(req, account.userId, "updated", account._id);

    return res.status(200).json({
      success: true,
      message: "Bank account updated successfully",
      data: account,
    });
  } catch (error) {
    console.error("Error updating bank account:", error);
    return res.status(500).json({
      success: false,
      message: "Error updating bank account",
      error: error.message,
    });
  }
};

// Admin delete bank account
export const adminDeleteBankAccount = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid account ID" });
    }

    const account = await UserBankAccount.findById(id);
    if (!account) {
      return res.status(404).json({
        success: false,
        message: "Bank account not found",
      });
    }

    const userId = account.userId;

    // If deleting primary, set first remaining as primary
    if (account.isPrimary) {
      const firstAccount = await UserBankAccount.findOne(
        { userId, _id: { $ne: id } },
        {},
        { sort: { createdAt: 1 } }
      );
      if (firstAccount) {
        firstAccount.isPrimary = true;
        await firstAccount.save();
      }
    }

    await UserBankAccount.deleteOne({ _id: id });
    emitBankAccountsUpdated(req, userId, "deleted", id);

    return res.status(200).json({
      success: true,
      message: "Bank account deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting bank account:", error);
    return res.status(500).json({
      success: false,
      message: "Error deleting bank account",
      error: error.message,
    });
  }
};
