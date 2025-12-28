import React  from 'react';
import { createContext, useContext, useState, useEffect } from 'react';
import { fetchBalance } from '../services/currentBalance'; // Your axios fetch

const BalanceContext = createContext();

export const useBalance = () => useContext(BalanceContext);

export const BalanceProvider = ({ children }) => {
  const user = JSON.parse(localStorage.getItem("user"));
  const [balance, setBalance] = useState(0);

  const loadBalance = async () => {
    try {
      const data = await fetchBalance(user._id);
      setBalance(data.balance);
    } catch (err) {
      console.error('Failed to fetch balance:', err);
    }
  };

  // Fetch balance on mount
  useEffect(() => {
    if (user?._id) {
      loadBalance();
    }
  }, []);

  return (
    <BalanceContext.Provider value={{ balance, setBalance, loadBalance }}>
      {children}
    </BalanceContext.Provider>
  );
};
