import AdminBankAccount from "../models/AdminBankAccount.js";

// Add new admin bank account
export const addAdminBankAccount = async (req, res) => {
  try {
    const { accountNumber, ifscCode, accountHolderName, bankName, accountType, notes, isPrimary } = req.body;
    const adminId = req.user?._id || req.user?.id;

    if (!adminId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    // Validate required fields
    if (!accountNumber || !ifscCode || !accountHolderName || !bankName) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    // If setting as primary, unset other primary accounts
    if (isPrimary) {
      await AdminBankAccount.updateMany({ adminId }, { isPrimary: false });
    }

    const newAccount = new AdminBankAccount({
      adminId,
      accountNumber,
      ifscCode,
      accountHolderName,
      bankName,
      accountType: accountType || "Savings",
      notes: notes || "",
      isPrimary: isPrimary || false,
    });

    await newAccount.save();

    res.status(201).json({
      success: true,
      message: "Bank account added successfully",
      data: newAccount,
    });
  } catch (error) {
    console.error("Error adding bank account:", error);
    res.status(500).json({
      success: false,
      message: "Failed to add bank account",
      error: error.message,
    });
  }
};

// Get all admin bank accounts
export const getAdminBankAccounts = async (req, res) => {
  try {
    const adminId = req.user?._id || req.user?.id;

    if (!adminId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const accounts = await AdminBankAccount.find({ adminId }).sort({ isPrimary: -1, createdAt: -1 });

    res.json({
      success: true,
      data: accounts,
    });
  } catch (error) {
    console.error("Error fetching bank accounts:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch bank accounts",
      error: error.message,
    });
  }
};

// Update admin bank account
export const updateAdminBankAccount = async (req, res) => {
  try {
    const { id } = req.params;
    const { accountNumber, ifscCode, accountHolderName, bankName, accountType, notes, isPrimary } = req.body;
    const adminId = req.user?._id || req.user?.id;

    if (!adminId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const account = await AdminBankAccount.findById(id);

    if (!account || account.adminId.toString() !== adminId) {
      return res.status(404).json({ success: false, message: "Account not found" });
    }

    // If setting as primary, unset other primary accounts
    if (isPrimary && !account.isPrimary) {
      await AdminBankAccount.updateMany(
        { adminId, _id: { $ne: id } },
        { isPrimary: false }
      );
    }

    account.accountNumber = accountNumber || account.accountNumber;
    account.ifscCode = ifscCode || account.ifscCode;
    account.accountHolderName = accountHolderName || account.accountHolderName;
    account.bankName = bankName || account.bankName;
    account.accountType = accountType || account.accountType;
    account.notes = notes !== undefined ? notes : account.notes;
    account.isPrimary = isPrimary !== undefined ? isPrimary : account.isPrimary;

    await account.save();

    res.json({
      success: true,
      message: "Bank account updated successfully",
      data: account,
    });
  } catch (error) {
    console.error("Error updating bank account:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update bank account",
      error: error.message,
    });
  }
};

// Delete admin bank account
export const deleteAdminBankAccount = async (req, res) => {
  try {
    const { id } = req.params;
    const adminId = req.user?._id || req.user?.id;

    if (!adminId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const account = await AdminBankAccount.findById(id);

    if (!account || account.adminId.toString() !== adminId) {
      return res.status(404).json({ success: false, message: "Account not found" });
    }

    await AdminBankAccount.deleteOne({ _id: id });

    // If deleted account was primary, set another as primary
    if (account.isPrimary) {
      const nextAccount = await AdminBankAccount.findOne({ adminId });
      if (nextAccount) {
        nextAccount.isPrimary = true;
        await nextAccount.save();
      }
    }

    res.json({
      success: true,
      message: "Bank account deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting bank account:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete bank account",
      error: error.message,
    });
  }
};

// Set primary bank account
export const setAdminPrimaryBankAccount = async (req, res) => {
  try {
    const { id } = req.params;
    const adminId = req.user?._id || req.user?.id;

    if (!adminId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const account = await AdminBankAccount.findById(id);

    if (!account || account.adminId.toString() !== adminId) {
      return res.status(404).json({ success: false, message: "Account not found" });
    }

    // Unset all primary accounts for this admin
    await AdminBankAccount.updateMany({ adminId }, { isPrimary: false });

    // Set this account as primary
    account.isPrimary = true;
    await account.save();

    res.json({
      success: true,
      message: "Primary account updated successfully",
      data: account,
    });
  } catch (error) {
    console.error("Error setting primary account:", error);
    res.status(500).json({
      success: false,
      message: "Failed to set primary account",
      error: error.message,
    });
  }
};
