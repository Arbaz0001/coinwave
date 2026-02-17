import React  from 'react';
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { fetchBalance } from '../services/currentBalance'; // Your axios fetch
import { initSocket, getSocket } from "../hooks/useSocket";

const BalanceContext = createContext();

export const useBalance = () => useContext(BalanceContext);

export const BalanceProvider = ({ children }) => {
  const getStoredUserId = useCallback(() => {
    try {
      const stored = JSON.parse(localStorage.getItem("cw_user") || "{}");
      return stored?._id || null;
    } catch {
      return null;
    }
  }, []);

  const [userId, setUserId] = useState(getStoredUserId);
  const [balance, setBalance] = useState(0);

  const loadBalance = async (overrideUserId) => {
    try {
      const id = overrideUserId || getStoredUserId();
      if (!id) return;
      const data = await fetchBalance(id);
      setBalance(data.balance);
    } catch (err) {
      console.error('Failed to fetch balance:', err);
    }
  };

  // Fetch balance on mount
  useEffect(() => {
    if (userId) {
      loadBalance(userId);
    }
  }, [userId]);

  useEffect(() => {
    const refreshUserId = () => setUserId(getStoredUserId());
    refreshUserId();

    window.addEventListener("focus", refreshUserId);
    window.addEventListener("storage", refreshUserId);
    return () => {
      window.removeEventListener("focus", refreshUserId);
      window.removeEventListener("storage", refreshUserId);
    };
  }, [getStoredUserId]);

  useEffect(() => {
    const token =
      localStorage.getItem("token") ||
      localStorage.getItem("authToken") ||
      localStorage.getItem("accessToken") ||
      (function () {
        try {
          const auth = JSON.parse(localStorage.getItem("auth") || "{}");
          return auth?.accessToken || null;
        } catch {
          return null;
        }
      })();

    const socket = getSocket() || initSocket(token);
    if (!socket || !userId) return;

    const handler = (payload) => {
      if (!payload || String(payload.userId) !== String(userId)) return;
      if (payload.balance == null) return;

      setBalance(payload.balance);
      try {
        const stored = JSON.parse(localStorage.getItem("cw_user") || "{}");
        localStorage.setItem(
          "cw_user",
          JSON.stringify({ ...stored, walletBalance: payload.balance })
        );
      } catch {
        // ignore localStorage update errors
      }
    };

    socket.on("balanceUpdated", handler);
    return () => socket.off("balanceUpdated", handler);
  }, [userId]);

  return (
    <BalanceContext.Provider value={{ balance, setBalance, loadBalance }}>
      {children}
    </BalanceContext.Provider>
  );
};
