import axios from "axios";
import { API_CONFIG } from "../config/api.config";

export const loginUser = async (payload) => {
  try {
    const response = await axios.post(`${API_CONFIG.BASE_URL}/auth/login`, payload);
    return response.data;
  } catch (err) {
    console.error("Login error:", err.response?.data || err.message);
    throw err;
  }
};
