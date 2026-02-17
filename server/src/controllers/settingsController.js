import Settings from "../models/Settings.js";
import mongoose from "mongoose";

// 🔹 GET all settings
export const getAllSettings = async (req, res) => {
  try {
    const settings = await Settings.find().lean();
    
    // Convert to object format for easier access
    const settingsObj = {};
    settings.forEach((s) => {
      settingsObj[s.key] = s.value;
    });

    return res.status(200).json({
      success: true,
      data: settingsObj,
      rawData: settings,
    });
  } catch (error) {
    console.error("Error fetching settings:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching settings",
      error: error.message,
    });
  }
};

// 🔹 GET single setting value
export const getSetting = async (req, res) => {
  try {
    const { key } = req.params;

    const setting = await Settings.findOne({ key }).lean();

    if (!setting) {
      return res.status(404).json({
        success: false,
        message: `Setting ${key} not found`,
      });
    }

    return res.status(200).json({
      success: true,
      data: setting,
    });
  } catch (error) {
    console.error("Error fetching setting:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching setting",
      error: error.message,
    });
  }
};

// 🔹 UPDATE or CREATE setting (Admin only)
export const updateSetting = async (req, res) => {
  try {
    const adminId = req.user?._id || req.user?.id;
    if (!adminId || !mongoose.Types.ObjectId.isValid(adminId)) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const { key } = req.params;
    const { value, description } = req.body;

    // Validate value
    if (value === undefined || value === null) {
      return res.status(400).json({
        success: false,
        message: "Value is required",
      });
    }

    // Validate that value is a number
    const numValue = Number(value);
    if (isNaN(numValue)) {
      return res.status(400).json({
        success: false,
        message: "Value must be a number",
      });
    }

    // Validate minimum values don't exceed maximum values
    if (key === "minDeposit" || key === "minWithdrawl" || key === "minBuyUSDT" || key === "minSellUSDT") {
      if (numValue < 0) {
        return res.status(400).json({
          success: false,
          message: "Minimum value cannot be negative",
        });
      }
    }

    // Find and update or create
    let setting = await Settings.findOne({ key });

    if (!setting) {
      // Create new setting
      setting = new Settings({
        key,
        value: numValue,
        description: description || "",
        updatedBy: new mongoose.Types.ObjectId(adminId),
      });
    } else {
      // Update existing setting
      setting.value = numValue;
      if (description !== undefined) {
        setting.description = description;
      }
      setting.updatedBy = new mongoose.Types.ObjectId(adminId);
      setting.lastUpdated = new Date();
    }

    await setting.save();

    return res.status(200).json({
      success: true,
      message: `Setting ${key} updated successfully`,
      data: setting,
    });
  } catch (error) {
    console.error("Error updating setting:", error);
    return res.status(500).json({
      success: false,
      message: "Error updating setting",
      error: error.message,
    });
  }
};

// 🔹 BULK UPDATE settings (Admin only)
export const bulkUpdateSettings = async (req, res) => {
  try {
    const adminId = req.user?._id || req.user?.id;
    if (!adminId || !mongoose.Types.ObjectId.isValid(adminId)) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const { settings: updatedSettings } = req.body;

    if (!Array.isArray(updatedSettings) || updatedSettings.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Settings array is required",
      });
    }

    const results = [];

    for (const item of updatedSettings) {
      const { key, value, description } = item;

      if (!key || value === undefined) {
        continue;
      }

      const numValue = Number(value);
      if (isNaN(numValue)) {
        continue;
      }

      let setting = await Settings.findOne({ key });

      if (!setting) {
        setting = new Settings({
          key,
          value: numValue,
          description: description || "",
          updatedBy: new mongoose.Types.ObjectId(adminId),
        });
      } else {
        setting.value = numValue;
        if (description !== undefined) {
          setting.description = description;
        }
        setting.updatedBy = new mongoose.Types.ObjectId(adminId);
        setting.lastUpdated = new Date();
      }

      await setting.save();
      results.push(setting);
    }

    return res.status(200).json({
      success: true,
      message: `${results.length} settings updated successfully`,
      data: results,
    });
  } catch (error) {
    console.error("Error bulk updating settings:", error);
    return res.status(500).json({
      success: false,
      message: "Error bulk updating settings",
      error: error.message,
    });
  }
};

// 🔹 INITIALIZE default settings
export const initializeSettings = async (req, res) => {
  try {
    const defaults = [
      { key: "minDeposit", value: 100, description: "Minimum deposit amount in INR" },
      { key: "maxDeposit", value: 100000, description: "Maximum deposit amount in INR" },
      { key: "minWithdrawl", value: 100, description: "Minimum withdrawal amount in INR" },
      { key: "maxWithdrawl", value: 100000, description: "Maximum withdrawal amount in INR" },
      { key: "minBuyUSDT", value: 100, description: "Minimum USDT buy amount" },
      { key: "minSellUSDT", value: 100, description: "Minimum USDT sell amount" },
      { key: "platformFeePercent", value: 0.5, description: "Platform fee percentage" },
    ];

    // Check existing settings
    const existing = await Settings.countDocuments();

    if (existing === 0) {
      // Create all defaults
      await Settings.insertMany(defaults);
      return res.status(201).json({
        success: true,
        message: "Default settings initialized",
        data: defaults,
      });
    } else {
      return res.status(200).json({
        success: true,
        message: "Settings already initialized",
      });
    }
  } catch (error) {
    console.error("Error initializing settings:", error);
    return res.status(500).json({
      success: false,
      message: "Error initializing settings",
      error: error.message,
    });
  }
};
