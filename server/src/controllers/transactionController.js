import Transaction from "../models/Transaction.js";
import Deposit from "../models/Deposit.js";
import Withdraw from "../models/Withdraw.js";

// Get transactions (paginated + filters)
export const getTransactions = async (req, res) => {
  try {
    // pagination
    const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
    const limit = Math.max(1, Number.parseInt(req.query.limit, 10) || 10);
    const skip = (page - 1) * limit;

    // filters
    // transactionType => "deposit" or "withdraw"
    // type => payment mode "upi" or "crypto"
    const { transactionType, type, status, userId } = req.query;
    const filter = {};

    if (transactionType && ["deposit", "withdraw"].includes(transactionType)) {
      filter.transactionType = transactionType;
    } else {
      // only return deposit/withdraw by default (if you have other internal tx types)
      filter.transactionType = { $in: ["deposit", "withdraw"] };
    }

    if (type && ["upi", "crypto"].includes(type)) {
      filter.type = type;
    }

    if (status && ["pending", "success", "failed"].includes(status)) {
      filter.status = status;
    }

    if (userId) {
      filter.userId = userId;
    }

    // total count + docs
    const [total, transactions] = await Promise.all([
      Transaction.countDocuments(filter),
      Transaction.find(filter)
        .populate("userId", "name email phone balance role")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
    ]);

    const totalPages = Math.max(1, Math.ceil(total / limit));

    return res.status(200).json({
      success: true,
      data: {
        transactions,
        page,
        limit,
        total,
        totalPages,
      },
    });
  } catch (error) {
    console.error("getTransactions error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Approve transaction
export const approveTransaction = async (req, res) => {
  try {
    const { id } = req.params;

    const tx = await Transaction.findById(id).populate("userId");
    if (!tx) return res.status(404).json({ message: "Transaction not found" });

    if (tx.status !== "pending") {
      return res.status(400).json({ message: "Transaction already processed" });
    }

    const user = tx.userId;

    if (tx.type === "deposit") {
      user.balance += tx.amount;
    }

    if (tx.type === "withdraw") {
      if (user.balance < tx.amount) {
        tx.status = "failed";
        await tx.save();
        return res.status(400).json({ message: "Insufficient balance" });
      }
      user.balance -= tx.amount;
    }

    tx.status = "success";

    await user.save();
    await tx.save();

    res.json({
      message: "Transaction approved",
      transaction: tx,
      balance: user.balance,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ❌ Deny transaction
export const denyTransaction = async (req, res) => {
  try {
    const { id } = req.params;

    const tx = await Transaction.findById(id);
    if (!tx) return res.status(404).json({ message: "Transaction not found" });

    if (tx.status !== "pending") {
      return res.status(400).json({ message: "Transaction already processed" });
    }

    tx.status = "failed";
    await tx.save();

    res.json({ message: "Transaction denied", transaction: tx });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Update transaction (Admin only)
export const updateTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, status, notes } = req.body;
    const adminEmail = req.user?.email;

    const transaction = await Transaction.findById(id);
    if (!transaction) {
      return res.status(404).json({ success: false, message: "Transaction not found" });
    }

    const changes = [];

    if (amount && amount !== transaction.amount) {
      changes.push(`Amount changed from ₹${transaction.amount} to ₹${amount}`);
      transaction.amount = amount;
    }

    if (status && status !== transaction.status) {
      changes.push(`Status changed from ${transaction.status} to ${status}`);
      transaction.status = status;
    }

    if (notes) {
      changes.push(`Notes: ${notes}`);
      transaction.notes = notes;
    }

    if (changes.length > 0) {
      transaction.editedBy = transaction.editedBy || [];
      transaction.editedBy.push({
        adminId,
        adminEmail,
        changes: changes.join(" | "),
        editedAt: new Date(),
      });
    }

    await transaction.save();

    const io = req.app.get("io");
    if (io && transaction.userId) {
      io.to(String(transaction.userId)).emit("statementUpdated", {
        action: "updated",
        transactionId: String(transaction._id),
      });
    }

    res.json({
      success: true,
      message: "Transaction updated successfully",
      data: transaction,
    });
  } catch (error) {
    console.error("Update transaction error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to update transaction", error: error.message });
  }
};

// ✅ Delete transaction (Admin only)
export const deleteTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    const adminId = req.user?._id;
    const adminEmail = req.user?.email;

    const transaction = await Transaction.findById(id);
    if (!transaction) {
      return res.status(404).json({ success: false, message: "Transaction not found" });
    }

    const deletedData = {
      transactionId: transaction._id,
      userId: transaction.userId,
      userName: transaction.userName,
      amount: transaction.amount,
      type: transaction.transactionType,
      deletedBy: adminEmail,
      deletedAt: new Date(),
    };

    const affectedUserId = transaction.userId;
    await Transaction.findByIdAndDelete(id);

    const io = req.app.get("io");
    if (io && affectedUserId) {
      io.to(String(affectedUserId)).emit("statementUpdated", {
        action: "deleted",
        transactionId: String(id),
      });
    }

    res.json({
      success: true,
      message: "Transaction deleted successfully",
      deletedData,
    });
  } catch (error) {
    console.error("Delete transaction error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to delete transaction", error: error.message });
  }
};

const TRANSACTION_STATUSES = new Set(["pending", "success", "failed"]);
const DEPOSIT_WITHDRAW_STATUSES = new Set(["pending", "approved", "rejected"]);

const emitStatementUpdated = (req, userId, action, transactionId) => {
  const io = req.app.get("io");
  if (io && userId) {
    io.to(String(userId)).emit("statementUpdated", {
      action,
      transactionId: String(transactionId),
    });
  }
};

export const getAdminUserStatement = async (req, res) => {
  try {
    const { userId } = req.params;
    const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
    const limit = Math.max(1, Number.parseInt(req.query.limit, 10) || 20);
    const transactionType = req.query.transactionType;

    const txFilter = { userId };
    if (transactionType && ["deposit", "withdraw"].includes(transactionType)) {
      txFilter.transactionType = transactionType;
    }

    const transactions = await Transaction.find(txFilter)
      .sort({ createdAt: -1 })
      .lean();

    let merged = [];

    if (transactions.length > 0) {
      merged = transactions.map((tx) => ({
        _id: tx._id,
        source: "transaction",
        userId: tx.userId,
        userName: tx.userName,
        transactionType: tx.transactionType,
        amount: tx.amount,
        status: tx.status,
        type: tx.type,
        notes: tx.notes || "",
        createdAt: tx.createdAt,
      }));
    } else {
      const [deposits, withdraws] = await Promise.all([
        Deposit.find({ userId }).sort({ createdAt: -1 }).lean(),
        Withdraw.find({ userId }).sort({ createdAt: -1 }).lean(),
      ]);

      const depositRows = deposits.map((deposit) => ({
        _id: deposit._id,
        source: "deposit",
        userId: deposit.userId,
        transactionType: "deposit",
        amount: deposit.amount,
        status: deposit.status,
        type: String(deposit.method || "").toLowerCase(),
        notes: deposit.remarks || "",
        createdAt: deposit.createdAt,
      }));

      const withdrawRows = withdraws.map((withdraw) => ({
        _id: withdraw._id,
        source: "withdraw",
        userId: withdraw.userId,
        transactionType: "withdraw",
        amount: withdraw.amount,
        status: withdraw.status,
        type: String(withdraw.method || "").toLowerCase(),
        notes: withdraw.remarks || "",
        createdAt: withdraw.createdAt,
      }));

      merged = [...depositRows, ...withdrawRows];

      if (transactionType && ["deposit", "withdraw"].includes(transactionType)) {
        merged = merged.filter((item) => item.transactionType === transactionType);
      }

      merged.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    const total = merged.length;
    const totalPages = Math.max(1, Math.ceil(total / limit));
    const start = (page - 1) * limit;
    const paginated = merged.slice(start, start + limit);

    return res.status(200).json({
      success: true,
      data: {
        transactions: paginated,
        page,
        limit,
        total,
        totalPages,
      },
    });
  } catch (error) {
    console.error("getAdminUserStatement error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateAdminStatementEntry = async (req, res) => {
  try {
    const { source, id } = req.params;
    const { amount, status, notes } = req.body;

    if (!source || !id) {
      return res.status(400).json({ success: false, message: "source and id are required" });
    }

    if (!["transaction", "deposit", "withdraw"].includes(source)) {
      return res.status(400).json({ success: false, message: "Invalid source" });
    }

    let updated;
    let userId;

    if (source === "transaction") {
      updated = await Transaction.findById(id);
      if (!updated) {
        return res.status(404).json({ success: false, message: "Statement item not found" });
      }

      if (amount != null) updated.amount = Number(amount);
      if (status != null) {
        if (!TRANSACTION_STATUSES.has(status)) {
          return res.status(400).json({ success: false, message: "Invalid status for transaction" });
        }
        updated.status = status;
      }
      if (notes != null) updated.notes = notes;

      await updated.save();
      userId = updated.userId;
    }

    if (source === "deposit") {
      updated = await Deposit.findById(id);
      if (!updated) {
        return res.status(404).json({ success: false, message: "Statement item not found" });
      }

      if (amount != null) updated.amount = Number(amount);
      if (status != null) {
        if (!DEPOSIT_WITHDRAW_STATUSES.has(status)) {
          return res.status(400).json({ success: false, message: "Invalid status for deposit" });
        }
        updated.status = status;
      }
      if (notes != null) updated.remarks = notes;

      await updated.save();
      userId = updated.userId;
    }

    if (source === "withdraw") {
      updated = await Withdraw.findById(id);
      if (!updated) {
        return res.status(404).json({ success: false, message: "Statement item not found" });
      }

      if (amount != null) updated.amount = Number(amount);
      if (status != null) {
        if (!DEPOSIT_WITHDRAW_STATUSES.has(status)) {
          return res.status(400).json({ success: false, message: "Invalid status for withdraw" });
        }
        updated.status = status;
      }
      if (notes != null) updated.remarks = notes;

      await updated.save();
      userId = updated.userId;
    }

    emitStatementUpdated(req, userId, "updated", id);

    return res.status(200).json({
      success: true,
      message: "Statement item updated successfully",
      data: updated,
    });
  } catch (error) {
    console.error("updateAdminStatementEntry error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteAdminStatementEntry = async (req, res) => {
  try {
    const { source, id } = req.params;

    if (!["transaction", "deposit", "withdraw"].includes(source)) {
      return res.status(400).json({ success: false, message: "Invalid source" });
    }

    let deleted;
    let userId;

    if (source === "transaction") {
      deleted = await Transaction.findByIdAndDelete(id);
    }

    if (source === "deposit") {
      deleted = await Deposit.findByIdAndDelete(id);
    }

    if (source === "withdraw") {
      deleted = await Withdraw.findByIdAndDelete(id);
    }

    if (!deleted) {
      return res.status(404).json({ success: false, message: "Statement item not found" });
    }

    userId = deleted.userId;
    emitStatementUpdated(req, userId, "deleted", id);

    return res.status(200).json({
      success: true,
      message: "Statement item deleted successfully",
      data: deleted,
    });
  } catch (error) {
    console.error("deleteAdminStatementEntry error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};
