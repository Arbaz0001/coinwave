// src/components/NotificationBell.jsx
import React, { useState } from "react";
import { useNotifications } from "../context/NotificationContext";

export default function NotificationBell() {
  const { notifications, markRead } = useNotifications();
  const [open, setOpen] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)} className="relative p-2">
        🔔
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-600 text-white rounded-full px-1 text-xs">
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-96 bg-white text-black shadow-lg rounded z-50">
          <div className="p-2 border-b font-semibold">Notifications</div>
          <div className="max-h-80 overflow-auto">
            {notifications.length === 0 && <div className="p-3 text-sm">No notifications</div>}
            {notifications.map((n) => (
              <div key={n._id} className="p-3 border-b hover:bg-gray-100">
                <div className="text-sm font-medium">{n.title || "Notification"}</div>
                <div className="text-xs text-gray-600">{n.message}</div>
                <div className="flex justify-between items-center mt-2">
                  <div className="text-xs text-gray-400">{new Date(n.createdAt).toLocaleString()}</div>
                  <button onClick={() => markRead(n._id)} className="text-xs text-blue-600">Mark read</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
