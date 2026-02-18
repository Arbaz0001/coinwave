import axios from "axios";
import { API_CONFIG } from "../config/api.config";

const API_BASE = API_CONFIG.API_BASE;

const getHeaders = () => {
  const token = localStorage.getItem("adminAccessToken") || localStorage.getItem("admin_token");
  return {
    Authorization: token ? `Bearer ${token}` : "",
  };
};

export const addAdminBankAccount = async (accountData) => {
  try {
    const response = await axios.post(
      `${API_BASE}/admin/bank-accounts/add`,
      accountData,
      { headers: getHeaders() }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getAdminBankAccounts = async () => {
  try {
    const response = await axios.get(`${API_BASE}/admin/bank-accounts`, {
      headers: getHeaders(),
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const updateAdminBankAccount = async (accountId, accountData) => {
  try {
    const response = await axios.put(
      `${API_BASE}/admin/bank-accounts/${accountId}`,
      accountData,
      { headers: getHeaders() }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const deleteAdminBankAccount = async (accountId) => {
  try {
    const response = await axios.delete(
      `${API_BASE}/admin/bank-accounts/${accountId}`,
      { headers: getHeaders() }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const setAdminPrimaryBankAccount = async (accountId) => {
  try {
    const response = await axios.patch(
      `${API_BASE}/admin/bank-accounts/${accountId}/primary`,
      {},
      { headers: getHeaders() }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};
