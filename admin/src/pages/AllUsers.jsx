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

  // ✅ Save updated user
  const handleSave = async (userId) => {
    try {
      // send password only if admin entered a new one
      const payload = { ...editedUsers[userId] };
      // Remove immutable or internal fields that should not be sent
      delete payload._id;
      delete payload.createdAt;
      delete payload.__v;
      if (!payload.password) delete payload.password;
      await AdminAPI.updateUser(userId, payload);
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
      CreatedAt: new Date(u.createdAt).toLocaleString(),
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Users");
    XLSX.writeFile(workbook, "AllUsers.xlsx");
    toast.success("✅ Users exported to Excel");
  };

  return (
    <div className="p-4 sm:p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6">
        <h1 className="text-2xl sm:text-3xl font-semibold text-gray-800 mb-3 sm:mb-0">
          👥 All Registered Users
        </h1>
        <div className="flex flex-wrap items-center gap-4">
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
            className="bg-green-600 hover:bg-green-700 text-white px-3 sm:px-4 py-2 rounded-md shadow-md transition text-sm sm:text-base"
          >
            ⬇️ Export Excel
          </button>
        </div>
      </div>

      {/* Loader */}
      {loading ? (
        <div className="text-center py-10 text-gray-500">Loading users...</div>
      ) : (
        <div className="overflow-x-auto shadow-lg rounded-lg bg-white">
          <table className="min-w-full border border-gray-200 rounded-lg">
            <thead className="bg-gray-100 text-gray-700 uppercase text-xs sm:text-sm">
              <tr>
                <th className="p-3 border text-center">#</th>
                <th className="p-3 border text-left">Full Name</th>
                {showSensitiveData && <th className="p-3 border text-left">Email</th>}
                {showSensitiveData && <th className="p-3 border text-left">Phone</th>}
                <th className="p-3 border text-left">Password</th>
                <th className="p-3 border text-center">Actions</th>
              </tr>
            </thead>

            <tbody>
              {users.length > 0 ? (
                users.map((user, index) => (
                  <tr
                    key={user._id}
                    className="border-b hover:bg-gray-50 transition text-sm sm:text-base"
                  >
                    <td className="p-3 text-center">{index + 1}</td>

                    {/* Full Name */}
                    <td className="p-3">
                      {editMode[user._id] ? (
                        <input
                          type="text"
                          value={editedUsers[user._id]?.fullName || ""}
                          onChange={(e) =>
                            handleChange(user._id, "fullName", e.target.value)
                          }
                          className="border p-1 w-full rounded"
                        />
                      ) : (
                        <span className="font-medium text-gray-800">
                          {user.fullName}
                        </span>
                      )}
                    </td>

                    {/* Email */}
                    {showSensitiveData && (
                      <td className="p-3">
                        {editMode[user._id] ? (
                          <input
                            type="email"
                            value={editedUsers[user._id]?.email || ""}
                            onChange={(e) =>
                              handleChange(user._id, "email", e.target.value)
                            }
                            className="border p-1 w-full rounded"
                          />
                        ) : (
                          <span className="text-gray-700 break-words">{user.email}</span>
                        )}
                      </td>
                    )}

                    {/* Phone */}
                    {showSensitiveData && (
                      <td className="p-3">
                        {editMode[user._id] ? (
                          <input
                            type="text"
                            value={editedUsers[user._id]?.phoneNumber || ""}
                            onChange={(e) =>
                              handleChange(user._id, "phoneNumber", e.target.value)
                            }
                            className="border p-1 w-full rounded"
                          />
                        ) : (
                          <span className="text-gray-700 break-words">{user.phoneNumber}</span>
                        )}
                      </td>
                    )}

                    {/* Password */}
                    <td className="p-3 text-gray-500 font-mono text-xs break-all">
                      {editMode[user._id] ? (
                        <input
                          type="text"
                          placeholder="New password (leave blank to keep)"
                          value={editedUsers[user._id]?.password || ""}
                          onChange={(e) =>
                            handleChange(user._id, "password", e.target.value)
                          }
                          className="border p-1 w-full rounded"
                        />
                      ) : (
                        <span title={user.password}>{user.password || "N/A"}</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="p-3 text-center space-x-2">
                      {editMode[user._id] ? (
                        <button
                          onClick={() => handleSave(user._id)}
                          className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-xs sm:text-sm"
                        >
                          Save
                        </button>
                      ) : (
                        <button
                          onClick={() => handleEditToggle(user._id)}
                          className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-xs sm:text-sm"
                        >
                          Edit
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(user._id)}
                        className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-xs sm:text-sm"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={showSensitiveData ? 6 : 4}
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
