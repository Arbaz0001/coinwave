// src/services/bankAccountService.js
import api from "./api";

/**
 * Bank Account Service
 * Handles all bank account related API calls for users
 */

// Add new bank account
export const addBankAccount = async (accountData) => {
  const { data } = await api.post("/bank-accounts/add", accountData);
  return data;
};

// Get all bank accounts for current user
export const getUserBankAccounts = async () => {
  const { data } = await api.get("/bank-accounts/list");
  return data;
};

// Update bank account
export const updateBankAccount = async (accountId, accountData) => {
  const { data } = await api.put(`/bank-accounts/${accountId}`, accountData);
  return data;
};

// Set primary bank account
export const setPrimaryAccount = async (accountId) => {
  const { data } = await api.put(`/bank-accounts/${accountId}/primary`);
  return data;
};

// Delete bank account
export const deleteBankAccount = async (accountId) => {
  const { data } = await api.delete(`/bank-accounts/${accountId}`);
  return data;
};

export default {
  addBankAccount,
  getUserBankAccounts,
  updateBankAccount,
  setPrimaryAccount,
  deleteBankAccount,
};
