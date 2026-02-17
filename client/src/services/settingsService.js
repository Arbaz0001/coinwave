// client/src/services/settingsService.js
import api from "./api";

/**
 * Settings Service
 * Handles fetching transaction limits and platform settings
 */

// Get all settings (public)
export const getAllSettings = async () => {
  const { data } = await api.get("/settings/public/all");
  return data;
};

// Get single setting value (public)
export const getSetting = async (key) => {
  const { data } = await api.get(`/settings/public/${key}`);
  return data;
};

// Get specific limits
export const getDepositLimits = async () => {
  const settings = await getAllSettings();
  return {
    min: settings.data?.minDeposit || 100,
    max: settings.data?.maxDeposit || 100000,
  };
};

export const getWithdrawalLimits = async () => {
  const settings = await getAllSettings();
  return {
    min: settings.data?.minWithdrawl || 100,
    max: settings.data?.maxWithdrawl || 100000,
  };
};

export const getUSDTLimits = async () => {
  const settings = await getAllSettings();
  return {
    minBuy: settings.data?.minBuyUSDT || 100,
    minSell: settings.data?.minSellUSDT || 100,
  };
};

export const getPlatformFee = async () => {
  const settings = await getAllSettings();
  return settings.data?.platformFeePercent || 0.5;
};

export default {
  getAllSettings,
  getSetting,
  getDepositLimits,
  getWithdrawalLimits,
  getUSDTLimits,
  getPlatformFee,
};
