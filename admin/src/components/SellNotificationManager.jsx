import React, { useState, useEffect } from "react";
import axios from "axios";
import { Trash2, Plus, Edit2, Check, X } from "lucide-react";
import { toast } from "react-toastify";
import { API_CONFIG } from "../config/api.config";

const SellNotificationManager = () => {
  const [notifications, setNotifications] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [formData, setFormData] = useState({
    title: "Cannot Sell USDT",
    message: "Your account is temporarily restricted from selling USDT. Please contact support.",
    buttonText: "Contact Support",
    redirectUrl: "/help-support",
    isActive: true,
  });

  const API_BASE = API_CONFIG.API_BASE;
  const getAuthHeader = () => ({
    Authorization: `Bearer ${localStorage.getItem("admin_token")}`,
    "Content-Type": "application/json",
  });

  // ✅ Fetch all users
  const fetchUsers = async () => {
    try {
      // use admin-scoped users endpoint for admin panel
      const res = await axios.get(`${API_BASE}/admin/users`, {
        headers: getAuthHeader(),
      });

      // support multiple response shapes
      const respData = res.data || {};
      const usersList = respData.users || respData.data || (Array.isArray(respData) ? respData : []);
      setUsers(usersList || []);
    } catch (err) {
      console.error("Error fetching users:", err);
    }
  };

  // ✅ Fetch all active sell notifications
  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/sell-notification`, {
        headers: getAuthHeader(),
      });
      setNotifications(res.data?.data || []);
      console.log("✅ Sell notifications fetched:", res.data?.data);
    } catch (err) {
      console.error("Error fetching sell notifications:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchNotifications();
  }, []);

  // ✅ Create sell notification
  const handleCreate = async () => {
    if (!selectedUser) {
      toast.error("❌ Please select a user");
      return;
    }

    try {
      const payload = {
        userId: selectedUser._id || selectedUser.id,
        title: formData.title,
        message: formData.message,
        buttonText: formData.buttonText,
        redirectUrl: formData.redirectUrl,
        isActive: formData.isActive,
      };

      console.log("📤 Creating sell notification:", payload);

      const res = await axios.post(`${API_BASE}/sell-notification`, payload, {
        headers: getAuthHeader(),
      });

      if (res.data?.success) {
        toast.success("✅ Sell notification created!");
        setNotifications([...notifications, res.data.data]);
        setSelectedUser(null);
        setFormData({
          title: "Cannot Sell USDT",
          message: "Your account is temporarily restricted from selling USDT. Please contact support.",
          buttonText: "Contact Support",
          redirectUrl: "/help-support",
          isActive: true,
        });
      }
    } catch (err) {
      console.error("❌ Error creating notification:", err.response?.data || err.message);
      toast.error(err.response?.data?.message || "Failed to create notification");
    }
  };

  // ✅ Toggle notification status
  const handleToggle = async (notificationId, currentStatus) => {
    try {
      const res = await axios.put(
        `${API_BASE}/sell-notification/${notificationId}`,
        { isActive: !currentStatus },
        { headers: getAuthHeader() }
      );

      if (res.data?.success) {
        setNotifications(
          notifications.map((n) =>
            n._id === notificationId ? { ...n, isActive: !currentStatus } : n
          )
        );
        toast.success(`✅ Notification ${!currentStatus ? "enabled" : "disabled"}`);
      }
    } catch (err) {
      console.error("Error toggling notification:", err);
      toast.error("Failed to update notification");
    }
  };

  // ✅ Delete notification
  const handleDelete = async (notificationId) => {
    if (!window.confirm("Are you sure you want to delete this notification?")) return;

    try {
      const res = await axios.delete(`${API_BASE}/sell-notification/${notificationId}`, {
        headers: getAuthHeader(),
      });

      if (res.data?.success) {
        setNotifications(notifications.filter((n) => n._id !== notificationId));
        toast.success("✅ Notification deleted");
      }
    } catch (err) {
      console.error("Error deleting notification:", err);
      toast.error("Failed to delete notification");
    }
  };

  // ✅ Filter users for search
  const filteredUsers = users.filter(
    (u) =>
      u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">🚫 Sell Notifications</h1>
        <p className="text-gray-600 mb-8">Manage sell restrictions for users</p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 🎯 Create Form */}
          <div className="lg:col-span-1 bg-white rounded-xl shadow-lg p-6 h-fit sticky top-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">➕ Add Restriction</h2>

            {/* User Search */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Search User</label>
              <input
                type="text"
                placeholder="Name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              />

              {/* User List */}
              {searchQuery && filteredUsers.length > 0 && (
                <div className="mt-2 max-h-40 overflow-y-auto bg-gray-50 border border-gray-200 rounded-lg">
                  {filteredUsers.slice(0, 5).map((user) => (
                    <button
                      key={user._id}
                      onClick={() => {
                        setSelectedUser(user);
                        setSearchQuery("");
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-blue-50 border-b last:border-b-0 transition"
                    >
                      <p className="font-medium text-gray-900">{user.name}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Selected User Display */}
            {selectedUser && (
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm font-medium text-gray-700">Selected User:</p>
                <p className="font-semibold text-blue-700">{selectedUser.name}</p>
                <p className="text-xs text-gray-600">{selectedUser.email}</p>
                <button
                  onClick={() => setSelectedUser(null)}
                  className="mt-2 text-xs text-red-600 hover:text-red-800"
                >
                  Clear Selection
                </button>
              </div>
            )}

            {/* Form Fields */}
            <div className="space-y-3 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                <textarea
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Button Text</label>
                <input
                  type="text"
                  value={formData.buttonText}
                  onChange={(e) => setFormData({ ...formData, buttonText: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Redirect URL</label>
                <input
                  type="text"
                  value={formData.redirectUrl}
                  onChange={(e) => setFormData({ ...formData, redirectUrl: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4 cursor-pointer"
                />
                <span className="text-sm font-medium text-gray-700">Active</span>
              </label>
            </div>

            <button
              onClick={handleCreate}
              disabled={!selectedUser}
              className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-semibold py-2 rounded-lg transition flex items-center justify-center gap-2"
            >
              <Plus size={18} /> Add Restriction
            </button>
          </div>

          {/* 📋 Notifications List */}
          <div className="lg:col-span-2">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Active Restrictions</h2>

            {loading ? (
              <p className="text-center text-gray-500 py-8">Loading notifications...</p>
            ) : notifications.length === 0 ? (
              <div className="bg-white rounded-xl shadow-lg p-8 text-center">
                <p className="text-gray-500">No sell restrictions active</p>
              </div>
            ) : (
              <div className="space-y-4">
                {notifications.map((notif) => (
                  <div
                    key={notif._id}
                    className={`bg-white rounded-xl shadow-lg p-5 border-l-4 ${
                      notif.isActive ? "border-red-500" : "border-gray-300"
                    } transition hover:shadow-xl`}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-bold text-gray-900">{notif.title}</h3>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-semibold ${
                              notif.isActive
                                ? "bg-red-100 text-red-700"
                                : "bg-gray-100 text-gray-700"
                            }`}
                          >
                            {notif.isActive ? "ACTIVE" : "INACTIVE"}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{notif.message}</p>
                        <p className="text-xs text-gray-500">
                          👤 <strong>{notif.userId?.name || "Unknown"}</strong> ({notif.userId?.email})
                        </p>
                      </div>

                      <div className="flex gap-2 ml-4">
                        <button
                          onClick={() => handleToggle(notif._id, notif.isActive)}
                          className={`p-2 rounded-lg transition ${
                            notif.isActive
                              ? "bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
                              : "bg-green-100 text-green-700 hover:bg-green-200"
                          }`}
                          title={notif.isActive ? "Disable" : "Enable"}
                        >
                          {notif.isActive ? <X size={18} /> : <Check size={18} />}
                        </button>
                        <button
                          onClick={() => handleDelete(notif._id)}
                          className="p-2 bg-red-100 text-red-700 hover:bg-red-200 rounded-lg transition"
                          title="Delete"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-gray-200 text-xs text-gray-500 space-y-1">
                      <p>📝 Button: {notif.buttonText}</p>
                      <p>🔗 URL: {notif.redirectUrl}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellNotificationManager;
