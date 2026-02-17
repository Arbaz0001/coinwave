import api from "./api";

/**
 * Exchange Rate Service
 * Handles all exchange rate and pricing data API calls
 */

// Get all exchange rates (Binance, Wazirax, INR bonus)
export const getExchangeRates = async () => {
  const { data } = await api.get("/exchange-rates/rates");
  return data;
};

// Get USDT price (average of both exchanges)
export const getUSDTPrice = async () => {
  const { data } = await api.get("/exchange-rates/usdt-price");
  return data;
};

// Get INR bonus amount
export const getINRBonus = async () => {
  const { data } = await api.get("/exchange-rates/inr-bonus");
  return data;
};

// Update exchange rates (admin only)
export const updateExchangeRates = async (rates) => {
  const { data } = await api.put("/exchange-rates/rates/admin/update", rates);
  return data;
};

export default {
  getExchangeRates,
  getUSDTPrice,
  getINRBonus,
  updateExchangeRates,
};
