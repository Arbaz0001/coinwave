// src/context/NotificationContext.jsx
import React, { createContext, useContext, useEffect, useState } from "react";
import { initSocket, getSocket } from "../hooks/useSocket";
import axios from "axios";
import { toast } from "react-toastify";

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const token =
    localStorage.getItem("adminToken") ||
    localStorage.getItem("admin_token") ||
    localStorage.getItem("token") ||
    localStorage.getItem("authToken");

  useEffect(() => {
    // fetch existing notifications (optional)
    const fetchNotifications = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/notification`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        setNotifications(res.data?.data || []);
      } catch (err) {
        console.warn("Failed to fetch notifications:", err?.message || err);
      }
    };
    fetchNotifications();

    // initialize socket with token (if present)
    const socket = initSocket(token);
    if (!socket) return;

    // listen for notification events
    const handler = (n) => {
      console.log("⚡ Received notification:", n);
      setNotifications((prev) => [n, ...prev]);
      toast.info(n.message, { position: "top-right", autoClose: 5000 });
    };

    socket.on("notification", handler);

    return () => {
      socket.off("notification", handler);
      // don't disconnect socket here (singleton)
    };
  }, [token]);

  const markRead = (id) => {
    setNotifications((prev) => prev.map(p => p._id === id ? {...p, read: true} : p));
    // optionally call API to mark read
  };

  return (
    <NotificationContext.Provider value={{ notifications, setNotifications, markRead }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationContext);
