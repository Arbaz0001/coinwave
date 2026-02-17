/**
 * API Configuration
 * Automatically detects environment and uses appropriate API URL
 */

const isDevelopment = import.meta.env.DEV || window.location.hostname === "localhost";

export const API_CONFIG = {
  // Use localhost for development, production URL for deployed builds
  BASE_URL: isDevelopment 
    ? "http://localhost:5000" 
    : "https://api.coinpay0.com",
  
  // Full API path with /api prefix
  API_BASE: isDevelopment
    ? "http://localhost:5000/api"
    : "https://api.coinpay0.com/api",
  
  // WebSocket URL
  SOCKET_URL: isDevelopment
    ? "ws://localhost:5000"
    : "wss://api.coinpay0.com",
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
