import ReferAmount from "../models/add.refer.amount.model.js";
import User from "../models/User.js";

// Get referral stats for current user
export const getReferralStats = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const user = await User.findById(userId).select("ref_id");
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const referredUsers = await User.find({ ref_by: user.ref_id })
      .select("fullName email phoneNumber createdAt")
      .sort({ createdAt: -1 })
      .lean();

    const latestReferAmount = await ReferAmount.findOne()
      .sort({ createdAt: -1 })
      .lean();

    const rewardAmount = Number(latestReferAmount?.amount || 0);
    const totalReferrals = referredUsers.length;
    const totalRewards = totalReferrals * rewardAmount;

    const history = referredUsers.map((u) => ({
      friendName: u.fullName || u.email || u.phoneNumber || "User",
      joinedAt: u.createdAt,
      reward: rewardAmount,
    }));

    return res.json({
      success: true,
      data: {
        totalReferrals,
        totalRewards,
        history,
      },
    });
  } catch (err) {
    console.error("❌ [ERROR] Failed to fetch referral stats:", err.message);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch referral stats",
      error: err.message,
    });
  }
};

// Get all refer amounts
export const getAllReferAmounts = async (req, res) => {
  try {
    console.log("✅ [DEBUG] GET /api/v1/refer-amount - Fetching all refer amounts");
    const amounts = await ReferAmount.find().sort({ createdAt: -1 });
    console.log(`✅ [DEBUG] Found ${amounts.length} refer amounts`);
    res.json({
      success: true,
      data: amounts,
      message: "Refer amounts fetched successfully",
    });
  } catch (err) {
    console.error("❌ [ERROR] Failed to fetch refer amounts:", err.message);
    res.status(500).json({
      success: false,
      message: "Failed to fetch refer amounts",
      error: err.message,
    });
  }
};

// Create new refer amount
export const createReferAmount = async (req, res) => {
  try {
    const { amount } = req.body;
    console.log(`✅ [DEBUG] POST /api/v1/refer-amount - Creating refer amount: ${amount}`);

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Amount must be a positive number",
      });
    }

    const newAmount = new ReferAmount({ amount });
    await newAmount.save();

    console.log(`✅ [DEBUG] Refer amount created with ID: ${newAmount._id}`);
    res.status(201).json({
      success: true,
      data: newAmount,
      message: "Refer amount created successfully",
    });
  } catch (err) {
    console.error("❌ [ERROR] Failed to create refer amount:", err.message);
    res.status(500).json({
      success: false,
      message: "Failed to create refer amount",
      error: err.message,
    });
  }
};

// Update refer amount
export const updateReferAmount = async (req, res) => {
  try {
    const { id } = req.params;
    const { amount } = req.body;

    console.log(`✅ [DEBUG] PUT /api/v1/refer-amount/${id} - Updating refer amount to: ${amount}`);

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Amount must be a positive number",
      });
    }

    const updated = await ReferAmount.findByIdAndUpdate(
      id,
      { amount },
      { new: true }
    );

    if (!updated) {
      console.warn(`⚠️ [DEBUG] Refer amount not found: ${id}`);
      return res.status(404).json({
        success: false,
        message: "Refer amount not found",
      });
    }

    console.log(`✅ [DEBUG] Refer amount updated successfully`);
    res.json({
      success: true,
      data: updated,
      message: "Refer amount updated successfully",
    });
  } catch (err) {
    console.error("❌ [ERROR] Failed to update refer amount:", err.message);
    res.status(500).json({
      success: false,
      message: "Failed to update refer amount",
      error: err.message,
    });
  }
};

// Delete refer amount
export const deleteReferAmount = async (req, res) => {
  try {
    const { id } = req.params;

    console.log(`✅ [DEBUG] DELETE /api/v1/refer-amount/${id} - Deleting refer amount`);

    const deleted = await ReferAmount.findByIdAndDelete(id);

    if (!deleted) {
      console.warn(`⚠️ [DEBUG] Refer amount not found: ${id}`);
      return res.status(404).json({
        success: false,
        message: "Refer amount not found",
      });
    }

    console.log(`✅ [DEBUG] Refer amount deleted successfully`);
    res.json({
      success: true,
      message: "Refer amount deleted successfully",
    });
  } catch (err) {
    console.error("❌ [ERROR] Failed to delete refer amount:", err.message);
    res.status(500).json({
      success: false,
      message: "Failed to delete refer amount",
      error: err.message,
    });
  }
};
