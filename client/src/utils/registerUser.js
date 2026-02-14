import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000",
  withCredentials: true,
});

export const registerUser = async (userData) => {
  try {
    const { data } = await API.post(
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
