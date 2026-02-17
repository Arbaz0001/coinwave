import React, { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import { toast } from "react-toastify";
import * as AdminAPI from "../utils/adminApi.js";

const AllUsers = () => {
  const [users, setUsers] = useState([]);
  const [editMode, setEditMode] = useState({});
  const [editedUsers, setEditedUsers] = useState({});
  // show sensitive data by default for admin dashboard
  const [showSensitiveData, setShowSensitiveData] = useState(true);
  const [loading, setLoading] = useState(false);

  // ✅ Fetch all users
  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await AdminAPI.fetchUsers(); // backend se call
      const sorted = data?.users?.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
      setUsers(sorted || []);
      console.log("📦 All users:", sorted);
    } catch (err) {
      toast.error(err.response?.data?.message || "Error fetching users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  // ✅ Toggle edit mode
  const handleEditToggle = (userId) => {
    setEditMode((prev) => ({ ...prev, [userId]: !prev[userId] }));
    setEditedUsers((prev) => ({
      ...prev,
      [userId]: users.find((u) => u._id === userId) || {},
    }));
  };

  // ✅ Handle input change
  const handleChange = (userId, field, value) => {
    setEditedUsers((prev) => ({
      ...prev,
      [userId]: { ...prev[userId], [field]: value },
    }));
  };

  const handleBalanceAdjust = async (userId, direction) => {
    try {
      const originalUser = users.find((u) => u._id === userId);
      const editedUser = editedUsers[userId] || {};

      const baseBalance = Number(
        editedUser.walletBalance ?? originalUser?.walletBalance ?? 0
      );
      const delta = Number(editedUser.balanceDelta ?? 0);

      if (Number.isNaN(delta) || delta <= 0) {
        return toast.error("Enter a valid amount to adjust");
      }

      const nextBalance = direction === "add"
        ? baseBalance + delta
        : baseBalance - delta;

      if (nextBalance < 0) {
        return toast.error("Balance cannot be negative");
      }

      await AdminAPI.setUserBalance(userId, nextBalance);
      toast.success("✅ Balance updated");
      loadUsers();
      setEditedUsers((prev) => ({
        ...prev,
        [userId]: { ...prev[userId], walletBalance: nextBalance },
      }));
    } catch (err) {
      console.error("Balance adjust error:", err.response || err);
      toast.error(err.response?.data?.message || "Error updating balance ❌");
    }
  };

  // ✅ Save updated user
  const handleSave = async (userId) => {
    try {
      const originalUser = users.find((u) => u._id === userId);
      const editedUser = editedUsers[userId] || {};

      // send password only if admin entered a new one
      const payload = { ...editedUser };
      // Remove immutable or internal fields that should not be sent
      delete payload._id;
      delete payload.createdAt;
      delete payload.__v;
      delete payload.walletBalance;
      if (!payload.password) delete payload.password;

      const nextBalance = Number(
        editedUser.walletBalance ?? originalUser?.walletBalance ?? 0
      );
      const originalBalance = Number(originalUser?.walletBalance ?? 0);
      const hasUserFields = ["fullName", "email", "phoneNumber", "password"].some(
        (field) => payload[field] != null && payload[field] !== originalUser?.[field]
      );
      const balanceChanged = !Number.isNaN(nextBalance) && nextBalance !== originalBalance;

      if (hasUserFields) {
        await AdminAPI.updateUser(userId, payload);
      }
      if (balanceChanged) {
        await AdminAPI.setUserBalance(userId, nextBalance);
      }
      toast.success("✅ User updated successfully");
      loadUsers();
      setEditMode((prev) => ({ ...prev, [userId]: false }));
    } catch (err) {
      console.error("Update user error:", err.response || err);
      toast.error(err.response?.data?.message || "Error updating user ❌");
    }
  };

  // ✅ Delete user
  const handleDelete = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      await AdminAPI.deleteUser(userId);
      toast.success("🗑️ User deleted successfully");
      loadUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || "Error deleting user ❌");
    }
  };

  // ✅ Export Users to Excel
  const handleExportToExcel = () => {
    if (!users.length) return toast.warn("No users to export");

    const dataToExport = users.map((u) => ({
      FullName: u.fullName,
      Email: u.email,
      Phone: u.phoneNumber,
      PasswordHash: u.password || "",
      WalletBalance: Number(u.walletBalance ?? 0),
      CreatedAt: new Date(u.createdAt).toLocaleString(),
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Users");
    XLSX.writeFile(workbook, "AllUsers.xlsx");
    toast.success("✅ Users exported to Excel");
  };

  return (
    <div className="w-full bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-semibold text-gray-800">
          👥 All Registered Users
        </h1>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full sm:w-auto">
          <label className="flex items-center space-x-2 text-gray-700 text-sm sm:text-base">
            <input
              type="checkbox"
              checked={showSensitiveData}
              onChange={() => setShowSensitiveData(!showSensitiveData)}
              className="h-4 w-4 text-blue-500 border-gray-300 rounded"
            />
            <span>Show Sensitive Data</span>
          </label>

          <button
            onClick={handleExportToExcel}
            className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white px-3 sm:px-4 py-2 rounded-md shadow-md transition text-sm sm:text-base"
          >
            ⬇️ Export Excel
          </button>
        </div>
      </div>

      {/* Loader */}
      {loading ? (
        <div className="text-center py-10 text-gray-500">Loading users...</div>
      ) : (
        <div className="w-full overflow-x-auto shadow-lg rounded-lg bg-white">
          <table className="min-w-full w-full border border-gray-200 rounded-lg">
            <thead className="bg-gray-100 text-gray-700 uppercase text-xs sm:text-sm sticky top-0">
              <tr>
                <th className="p-2 sm:p-3 border text-center">#</th>
                <th className="p-2 sm:p-3 border text-left whitespace-nowrap">Full Name</th>
                {showSensitiveData && <th className="p-2 sm:p-3 border text-left whitespace-nowrap">Email</th>}
                {showSensitiveData && <th className="p-2 sm:p-3 border text-left whitespace-nowrap">Phone</th>}
                <th className="p-2 sm:p-3 border text-left whitespace-nowrap">Wallet Balance</th>
                {showSensitiveData && <th className="p-2 sm:p-3 border text-left whitespace-nowrap">Password</th>}
                <th className="p-2 sm:p-3 border text-center whitespace-nowrap">Actions</th>
              </tr>
            </thead>

            <tbody className="text-xs sm:text-sm">
              {users.length > 0 ? (
                users.map((user, index) => (
                  <tr
                    key={user._id}
                    className="border-b hover:bg-gray-50 transition"
                  >
                    <td className="p-2 sm:p-3 text-center border whitespace-nowrap">{index + 1}</td>

                    {/* Full Name */}
                    <td className="p-2 sm:p-3 border">
                      {editMode[user._id] ? (
                        <input
                          type="text"
                          value={editedUsers[user._id]?.fullName || ""}
                          onChange={(e) =>
                            handleChange(user._id, "fullName", e.target.value)
                          }
                          className="border p-1 w-full rounded text-xs sm:text-sm"
                        />
                      ) : (
                        <span className="font-medium text-gray-800 whitespace-nowrap">
                          {user.fullName}
                        </span>
                      )}
                    </td>

                    {/* Email */}
                    {showSensitiveData && (
                      <td className="p-2 sm:p-3 border">
                        {editMode[user._id] ? (
                          <input
                            type="email"
                            value={editedUsers[user._id]?.email || ""}
                            onChange={(e) =>
                              handleChange(user._id, "email", e.target.value)
                            }
                            className="border p-1 w-full rounded text-xs sm:text-sm"
                          />
                        ) : (
                          <span className="text-gray-700">{user.email}</span>
                        )}
                      </td>
                    )}

                    {/* Phone */}
                    {showSensitiveData && (
                      <td className="p-2 sm:p-3 border">
                        {editMode[user._id] ? (
                          <input
                            type="text"
                            value={editedUsers[user._id]?.phoneNumber || ""}
                            onChange={(e) =>
                              handleChange(user._id, "phoneNumber", e.target.value)
                            }
                            className="border p-1 w-full rounded text-xs sm:text-sm"
                          />
                        ) : (
                          <span className="text-gray-700 whitespace-nowrap">{user.phoneNumber}</span>
                        )}
                      </td>
                    )}

                    {/* Wallet Balance */}
                    <td className="p-2 sm:p-3 border">
                      {editMode[user._id] ? (
                        <div className="space-y-2 min-w-[200px]">
                          <input
                            type="number"
                            step="0.01"
                            value={
                              editedUsers[user._id]?.walletBalance ??
                              user.walletBalance ??
                              0
                            }
                            onChange={(e) =>
                              handleChange(user._id, "walletBalance", e.target.value)
                            }
                            className="border p-1 w-full rounded text-xs sm:text-sm"
                          />
                          <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
                            <input
                              type="number"
                              step="0.01"
                              placeholder="Adjust amount"
                              value={editedUsers[user._id]?.balanceDelta ?? ""}
                              onChange={(e) =>
                                handleChange(user._id, "balanceDelta", e.target.value)
                              }
                              className="border p-1 flex-1 min-w-[80px] rounded text-xs sm:text-sm"
                            />
                            <button
                              type="button"
                              onClick={() => handleBalanceAdjust(user._id, "add")}
                              className="bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded text-xs whitespace-nowrap"
                            >
                              + Add
                            </button>
                            <button
                              type="button"
                              onClick={() => handleBalanceAdjust(user._id, "deduct")}
                              className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-xs whitespace-nowrap"
                            >
                              - Deduct
                            </button>
                          </div>
                        </div>
                      ) : (
                        <span className="text-gray-700 font-semibold whitespace-nowrap">
                          ₹ {Number(user.walletBalance ?? 0).toFixed(2)}
                        </span>
                      )}
                    </td>

                    {/* Password */}
                    {showSensitiveData && (
                      <td className="p-2 sm:p-3 border text-gray-500 font-mono">
                        {editMode[user._id] ? (
                          <input
                            type="text"
                            placeholder="New password (optional)"
                            value={editedUsers[user._id]?.password || ""}
                            onChange={(e) =>
                              handleChange(user._id, "password", e.target.value)
                            }
                            className="border p-1 w-full rounded text-xs sm:text-sm min-w-[150px]"
                          />
                        ) : (
                          <span className="text-xs" title={user.password}>
                            {user.password ? "*****" : "N/A"}
                          </span>
                        )}
                      </td>
                    )}
                    {/* Actions */}
                    <td className="p-2 sm:p-3 border text-center">
                      <div className="flex flex-col sm:flex-row justify-center gap-1 sm:gap-2 min-w-[100px]">
                      {editMode[user._id] ? (
                        <button
                          onClick={() => handleSave(user._id)}
                          className="bg-green-500 hover:bg-green-600 text-white px-2 sm:px-3 py-1 rounded text-xs sm:text-sm whitespace-nowrap"
                        >
                          Save
                        </button>
                      ) : (
                        <button
                          onClick={() => handleEditToggle(user._id)}
                          className="bg-blue-500 hover:bg-blue-600 text-white px-2 sm:px-3 py-1 rounded text-xs sm:text-sm whitespace-nowrap"
                        >
                          Edit
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(user._id)}
                        className="bg-red-500 hover:bg-red-600 text-white px-2 sm:px-3 py-1 rounded text-xs sm:text-sm whitespace-nowrap"
                      >
                        Delete
                      </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={showSensitiveData ? 7 : 4}
                    className="p-6 text-center text-gray-500"
                  >
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AllUsers;
