import axios from "axios";

export const loginUser = async (payload) => {
  try {
    const response = await axios.post(`${import.meta.env.VITE_API_URL}/auth/login`, payload);
    return response.data;
  } catch (err) {
    console.error("Login error:", err.response?.data || err.message);
    throw err;
  }
};
