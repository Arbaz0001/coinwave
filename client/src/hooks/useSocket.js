// src/hooks/useSocket.js
import { io } from "socket.io-client";
import { API_CONFIG } from "../config/api.config";

let socket = null;

export const initSocket = (token) => {
  if (!socket) {
    socket = io(API_CONFIG.SOCKET_URL, {
      auth: { token: token ? `Bearer ${token}` : undefined },
      transports: ["websocket", "polling"],
    });

    socket.on("connect", () => {
      console.log("Socket connected:", socket.id);
    });

    socket.on("disconnect", (reason) => {
      console.log("Socket disconnected:", reason);
    });
  }
  return socket;
};

export const getSocket = () => socket;
