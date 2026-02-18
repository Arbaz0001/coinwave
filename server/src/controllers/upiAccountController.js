import UpiAccount from "../models/UpiAccount.js";

// Add UPI Account
export const addUpiAccount = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;
    const { upiId, upiName, provider, isPrimary, notes } = req.body;

    if (!upiId || !upiName) {
      return res.status(400).json({
        success: false,
        message: "UPI ID and name are required",
      });
    }

    // If setting as primary, unset other primary accounts
    if (isPrimary) {
      await UpiAccount.updateMany({ userId }, { isPrimary: false });
    }

    const upiAccount = await UpiAccount.create({
      userId,
      upiId,
      upiName,
      provider: provider || "Other",
      isPrimary: isPrimary || false,
      notes: notes || "",
    });

    return res.status(201).json({
      success: true,
      message: "UPI account added successfully",
      data: upiAccount,
    });
  } catch (error) {
    console.error("Error adding UPI account:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to add UPI account",
    });
  }
};

// Get User UPI Accounts
export const getUserUpiAccounts = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;

    const accounts = await UpiAccount.find({ userId }).sort({ isPrimary: -1, createdAt: -1 });

    return res.json({
      success: true,
      data: accounts,
    });
  } catch (error) {
    console.error("Error fetching UPI accounts:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch UPI accounts",
    });
  }
};

// Update UPI Account
export const updateUpiAccount = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;
    const { id } = req.params;
    const { upiId, upiName, provider, notes } = req.body;

    const account = await UpiAccount.findOne({ _id: id, userId });

    if (!account) {
      return res.status(404).json({
        success: false,
        message: "UPI account not found",
      });
    }

    if (upiId) account.upiId = upiId;
    if (upiName) account.upiName = upiName;
    if (provider) account.provider = provider;
    if (notes !== undefined) account.notes = notes;

    await account.save();

    return res.json({
      success: true,
      message: "UPI account updated successfully",
      data: account,
    });
  } catch (error) {
    console.error("Error updating UPI account:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update UPI account",
    });
  }
};

// Delete UPI Account
export const deleteUpiAccount = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;
    const { id } = req.params;

    const account = await UpiAccount.findOneAndDelete({ _id: id, userId });

    if (!account) {
      return res.status(404).json({
        success: false,
        message: "UPI account not found",
      });
    }

    return res.json({
      success: true,
      message: "UPI account deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting UPI account:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete UPI account",
    });
  }
};

// Set Primary UPI
export const setPrimaryUpi = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;
    const { id } = req.params;

    // Unset all primary
    await UpiAccount.updateMany({ userId }, { isPrimary: false });

    // Set this as primary
    const account = await UpiAccount.findOneAndUpdate(
      { _id: id, userId },
      { isPrimary: true },
      { new: true }
    );

    if (!account) {
      return res.status(404).json({
        success: false,
        message: "UPI account not found",
      });
    }

    return res.json({
      success: true,
      message: "Primary UPI account set successfully",
      data: account,
    });
  } catch (error) {
    console.error("Error setting primary UPI:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to set primary UPI",
    });
  }
};
