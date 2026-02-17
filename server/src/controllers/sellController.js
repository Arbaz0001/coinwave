import SellHistory from "../models/SellHistory.js";
import SellNotification from "../models/SellNotification.js";
import User from "../models/User.js";

/**
 * 🔍 Check if user has an active sell restriction
 * GET /api/sell/check-restriction
 */
export const checkSellRestriction = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;
    console.log('🔍 [DEBUG] checkSellRestriction - userId:', userId);
    
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    // Find active sell restriction notification for this user (type specific)
    const restriction = await SellNotification.findOne({ 
      userId, 
      isActive: true,
      type: 'sell_usdt_restriction'
    }).lean();

    console.log('📌 [DEBUG] Restriction found:', restriction ? 'YES' : 'NO');

    if (!restriction) {
      return res.status(204).end(); // No restriction
    }

    return res.json({ 
      success: true, 
      data: {
        restricted: true,
        title: restriction.title,
        message: restriction.message,
        buttonText: restriction.buttonText,
        redirectUrl: restriction.redirectUrl,
      }
    });
  } catch (err) {
    console.error('❌ checkSellRestriction error:', err.message);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * 💰 Submit a sell request and save to history
 * POST /api/sell/submit
 */
export const submitSell = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;
    const { usdtAmount, network, bankAccount, upiId, transactionHash, adminAddress, message } = req.body;

    console.log('📤 [DEBUG] submitSell called - userId:', userId, 'amount:', usdtAmount);

    // ✅ Validation
    if (!userId || !usdtAmount || !network) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields (userId, usdtAmount, network)",
      });
    }

    if (usdtAmount < 0.01) {
      return res.status(400).json({
        success: false,
        message: "Minimum USDT to sell is 0.01",
      });
    }

    // ✅ Check user exists
    const user = await User.findById(userId);
    if (!user) {
      console.error('❌ User not found:', userId);
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // ⚠️ Re-check restriction before allowing sell
    const restriction = await SellNotification.findOne({ userId, isActive: true }).lean();
    if (restriction) {
      console.warn('⚠️ Sell blocked - User has active restriction');
      return res.status(403).json({
        success: false,
        message: "Your account has a sell restriction",
        restricted: true,
        data: restriction,
      });
    }

    // ✅ Create sell history entry
    const sellRecord = await SellHistory.create({
      userId,
      amount: Number(usdtAmount),
      network: network.toUpperCase(),
      bankAccount: {
        accountNumber: bankAccount?.accountNumber,
        ifscCode: bankAccount?.ifscCode,
        accountHolderName: bankAccount?.accountHolderName,
        bankName: bankAccount?.bankName,
      },
      upiId,
      transactionHash,
      adminAddress,
      status: "pending",
    });

    console.log(`✅ Sell history saved: ${sellRecord._id} for user ${userId}`);

    // ✅ Emit socket event to admin (populate user data for real-time display)
    const io = req.app.get('io');
    if (io) {
      const populatedRecord = await SellHistory.findById(sellRecord._id)
        .populate('userId', 'fullName email phoneNumber');
      
      console.log('📡 Emitting newSell event to admins');
      io.emit('newSell', {
        sellId: sellRecord._id,
        userId: populatedRecord.userId,
        amount: sellRecord.amount,
        network: sellRecord.network,
        status: sellRecord.status,
        createdAt: sellRecord.createdAt,
      });
    }

    return res.status(201).json({
      success: true,
      message: "✅ Sell request submitted successfully",
      data: sellRecord,
    });
  } catch (error) {
    console.error("❌ submitSell error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to submit sell request",
      error: error.message,
    });
  }
};

/**
 * 📋 Get sell history for admin
 * GET /api/sell/history
 */
export const getSellHistory = async (req, res) => {
  try {
    const { page = 1, limit = 10, userId, status } = req.query;
    
    const filter = userId ? { userId } : {};
    if (status) filter.status = status;
    const skip = (page - 1) * limit;

    const history = await SellHistory.find(filter)
      .populate('userId', 'fullName email phoneNumber')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await SellHistory.countDocuments(filter);
    const pages = Math.ceil(total / limit);

    return res.json({
      success: true,
      data: history,
      pagination: { page: parseInt(page), limit: parseInt(limit), total, pages },
    });
  } catch (error) {
    console.error('❌ getSellHistory error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch sell history',
      error: error.message,
    });
  }
};

/**
 * 🛠️ Update sell status for admin
 * PUT /api/sell/history/:id/status
 */
export const updateSellStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["pending", "approved", "rejected"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status. Use pending, approved, or rejected",
      });
    }

    const sellRecord = await SellHistory.findById(id);
    if (!sellRecord) {
      return res.status(404).json({
        success: false,
        message: "Sell history record not found",
      });
    }

    sellRecord.status = status;
    await sellRecord.save();

    return res.json({
      success: true,
      message: "Sell status updated successfully",
      data: sellRecord,
    });
  } catch (error) {
    console.error("❌ updateSellStatus error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to update sell status",
      error: error.message,
    });
  }
};

/**
 * 📋 Get sell history for current user
 * GET /api/sell/history/me
 */
export const getUserSellHistory = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const history = await SellHistory.find({ userId })
      .sort({ createdAt: -1 });

    return res.json({
      success: true,
      data: history,
      count: history.length,
    });
  } catch (error) {
    console.error("❌ getUserSellHistory error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch user sell history",
      error: error.message,
    });
  }
};
