import axiosInstance from "../utils/axiosInstance";
import { API_CONFIG } from "../config/api.config";

const API_BASE = API_CONFIG.API_BASE;

// Add UPI Account
export const addUpiAccount = async (upiData) => {
  try {
    const response = await axiosInstance.post(`${API_BASE}/upi-accounts/add`, upiData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get User UPI Accounts
export const getUserUpiAccounts = async () => {
  try {
    const response = await axiosInstance.get(`${API_BASE}/upi-accounts/user`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Update UPI Account
export const updateUpiAccount = async (id, upiData) => {
  try {
    const response = await axiosInstance.put(`${API_BASE}/upi-accounts/${id}`, upiData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Delete UPI Account
export const deleteUpiAccount = async (id) => {
  try {
    const response = await axiosInstance.delete(`${API_BASE}/upi-accounts/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Set Primary UPI
export const setPrimaryUpi = async (id) => {
  try {
    const response = await axiosInstance.patch(`${API_BASE}/upi-accounts/${id}/primary`);
    return response.data;
  } catch (error) {
    throw error;
  }
};
