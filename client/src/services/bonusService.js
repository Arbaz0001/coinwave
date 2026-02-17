import axiosInstance from "../utils/axiosInstance";
import { API_CONFIG } from "../config/api.config";

const API_BASE = API_CONFIG.API_BASE;

/**
 * ✅ Claim INR Bonus - Add bonus to user wallet
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Response with bonus amount and new balance
 */
export const claimBonus = async (userId) => {
  try {
    const response = await axiosInstance.post(
      `${API_BASE}/balance/${userId}/add-bonus`
    );
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    console.error("❌ Failed to claim bonus:", error);
    return {
      success: false,
      error: error.response?.data?.message || error.message,
    };
  }
};
