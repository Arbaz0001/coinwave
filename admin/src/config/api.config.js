/**
 * API Configuration
 * Automatically detects environment and uses appropriate API URL
 */

const PROD_API_ORIGIN = "https://api.coinpay0.com";
const LOCAL_API_ORIGIN = "http://localhost:5000";
const PROD_SOCKET_ORIGIN = "wss://api.coinpay0.com";
const LOCAL_SOCKET_ORIGIN = "ws://localhost:5000";

const browserHost =
  typeof window !== "undefined" ? window.location.hostname : "";

const isLocalHost =
  browserHost === "localhost" ||
  browserHost === "127.0.0.1" ||
  browserHost === "0.0.0.0";

const envApiBaseUrl =
  (import.meta.env.VITE_API_BASE_URL || "").trim().replace(/\/$/, "");
const envSocketUrl =
  (import.meta.env.VITE_SOCKET_URL || "").trim().replace(/\/$/, "");

const resolvedBaseUrl = envApiBaseUrl || (isLocalHost ? LOCAL_API_ORIGIN : PROD_API_ORIGIN);
const resolvedSocketUrl = envSocketUrl || (isLocalHost ? LOCAL_SOCKET_ORIGIN : PROD_SOCKET_ORIGIN);

export const API_CONFIG = {
  BASE_URL: resolvedBaseUrl,
  
  API_BASE: `${resolvedBaseUrl}/api`,
  
  SOCKET_URL: resolvedSocketUrl,
};

// Convenience function to get full API path
export const getApiUrl = (path) => {
  // Remove leading slash if present
  const cleanPath = path.startsWith("/") ? path.slice(1) : path;
  
  // If path already starts with 'api/', append to BASE_URL
  if (cleanPath.startsWith("api/")) {
    return `${API_CONFIG.BASE_URL}/${cleanPath}`;
  }
  
  // Otherwise append to API_BASE
  return `${API_CONFIG.API_BASE}/${cleanPath}`;
};

export default API_CONFIG;
