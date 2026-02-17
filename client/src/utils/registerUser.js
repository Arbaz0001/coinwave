import axios from "axios";
import { API_CONFIG } from "../config/api.config";

const registerAPI = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  withCredentials: true,
});

export const registerUser = async (userData) => {
  try {
    const { data } = await registerAPI.post(
      "/api/auth/register",
      userData
    );

    return data;
  } catch (error) {
    console.error(
      "Failed to register user:",
      error.response?.data || error.message
    );
    throw error;
  }
};
