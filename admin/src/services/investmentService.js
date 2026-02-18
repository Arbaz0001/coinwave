import API from "../utils/adminApi";

export const createPack = async (payload) => {
  const { data } = await API.post("/api/admin/create-pack", payload);
  return data;
};

export const fetchAdminPacks = async () => {
  const { data } = await API.get("/api/admin/packs");
  return data;
};

export const updatePack = async (id, payload) => {
  const { data } = await API.put(`/api/admin/pack/${id}`, payload);
  return data;
};

export const deletePack = async (id) => {
  const { data } = await API.delete(`/api/admin/pack/${id}`);
  return data;
};

export const fetchPurchaseRequests = async () => {
  const { data } = await API.get("/api/admin/purchase-requests");
  return data;
};

export const approvePurchase = async (purchaseId) => {
  const { data } = await API.put(`/api/admin/approve/${purchaseId}`);
  return data;
};

export const rejectPurchase = async (purchaseId, reason = "") => {
  const { data } = await API.put(`/api/admin/reject/${purchaseId}`, { reason });
  return data;
};

export const saveAdminPaymentDetails = async ({ bankAccountDetails, upiId, qrCodeFile }) => {
  const formData = new FormData();
  formData.append("bankAccountDetails", bankAccountDetails || "");
  formData.append("upiId", upiId || "");
  if (qrCodeFile) {
    formData.append("qrCode", qrCodeFile);
  }

  const { data } = await API.post("/api/admin/payment-details", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return data;
};

export const fetchAdminPaymentDetails = async () => {
  const { data } = await API.get("/api/admin/payment-details");
  return data;
};

export const fetchPackHistory = async () => {
  const { data } = await API.get("/api/admin/pack-history");
  return data;
};
