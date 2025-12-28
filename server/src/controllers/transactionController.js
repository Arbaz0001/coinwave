import Transaction from "../models/Transaction.js";
import User from "../models/user.js";

// Get transactions (paginated + filters)
export const getTransactions = async (req, res) => {
  try {
    // pagination
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.max(1, parseInt(req.query.limit, 10) || 10);
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
