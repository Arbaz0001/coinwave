import axios from "axios";
import { API_CONFIG } from "../config/api.config";

const getToken = () => {
  const tokenCandidates = [
    localStorage.getItem("accessToken"),
    localStorage.getItem("user_token"),
    localStorage.getItem("token"),
  ];

  try {
    const authRaw = localStorage.getItem("auth");
    if (authRaw) {
      const auth = JSON.parse(authRaw);
      if (auth?.accessToken) tokenCandidates.push(auth.accessToken);
    }
  } catch {
    // ignore malformed auth storage
  }

  return tokenCandidates.find((token) => token && typeof token === "string") || "";
};

const authHeaders = () => {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const fetchActivePacks = async () => {
  const { data } = await axios.get(`${API_CONFIG.API_BASE}/packs`);
  return data;
};

export const fetchPaymentDetails = async () => {
  const { data } = await axios.get(`${API_CONFIG.API_BASE}/payment-details`);
  return data;
};

export const submitPackPurchase = async ({ packId, amountPaid, paymentScreenshot }) => {
  const formData = new FormData();
  formData.append("packId", packId);
  formData.append("amountPaid", amountPaid);
  formData.append("paymentScreenshot", paymentScreenshot);

  const { data } = await axios.post(`${API_CONFIG.API_BASE}/purchase-pack`, formData, {
    headers: {
      ...authHeaders(),
      "Content-Type": "multipart/form-data",
    },
  });

  return data;
};

export const fetchMyInvestments = async () => {
  const { data } = await axios.get(`${API_CONFIG.API_BASE}/my-investments`, {
    headers: authHeaders(),
  });
  return data;
};
