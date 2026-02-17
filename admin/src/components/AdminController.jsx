import axios from "axios"; // make sure this is at the top
import React, { useState } from "react";
// import AdminTable from "./AdminTable";
import { toast } from "react-toastify";
import { API_CONFIG } from "../config/api.config";

const ACCESS_PAGES = [
  "transaction",
  "games",
  "withdraw-requests",
  "telegram",
  "admin-management",
  "qr-code",
];

const AdminController = () => {
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    accessPages: [],
  });

  const handleToggleAccess = (page) => {
    setFormData((prev) => {
      const updated = prev.accessPages.includes(page)
        ? prev.accessPages.filter((p) => p !== page)
        : [...prev.accessPages, page];
      return { ...prev, accessPages: updated };
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const rawPhone = formData.phone.trim();
    const phoneDigitsOnly = rawPhone.replace(/\D/g, "");

    if (phoneDigitsOnly.length !== 10) {
      toast.error("❌ Phone number must be exactly 10 digits");
      return;
    }

    const formattedPhone = phoneDigitsOnly.startsWith("91")
      ? `+${phoneDigitsOnly}`
      : `+91${phoneDigitsOnly}`;

    const payload = {
      name: formData.name,
      email: formData.email,
      phone: formattedPhone,
      password: formData.password,
      accessPages: formData.accessPages,
    };

    try {
      const res = await axios.post(
        `${API_CONFIG.API_BASE}/v1/admin/add-admin`,
        payload
      );

      console.log("✅ Admin added successfully:", res.data);
      toast.success("✅ Admin created!");

      // Clear and close
      setShowModal(false);
      setFormData({
        name: "",
        email: "",
        phone: "",
        password: "",
        accessPages: [],
      });
    } catch (error) {
      console.error("❌ Failed to create admin:", error);
      toast.error("❌ Failed to create admin. Check console for details.");
    }
  };

  return (
    <div className="text-gray-200  py-4">
      <h2 className="text-2xl font-bold mb-4 mx-5">Admin Controller</h2>

      <button
        onClick={() => setShowModal(true)}
        className="bg-blue-600 mx-5 hover:bg-blue-700 text-white px-4 py-2 rounded"
      >
        ➕ Add New Admin
      </button>

      <AdminTable />

      {showModal && (
        <div className="fixed  inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-[#2c2c3c] text-white p-6 rounded shadow-md w-full max-w-lg">
            <h3 className="text-xl font-bold mb-4 ">Add New Admin</h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Full Name"
                className="w-full p-2 bg-gray-800 border border-gray-600 rounded"
                required
              />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Email"
                className="w-full p-2 bg-gray-800 border border-gray-600 rounded"
                required
              />
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Phone Number (e.g. 7777777777)"
                className="w-full p-2 bg-gray-800 border border-gray-600 rounded"
                required
              />
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Password"
                className="w-full p-2 bg-gray-800 border border-gray-600 rounded"
                required
              />

              <div>
                <label className="font-semibold mb-2 block">Access Pages</label>
                <div className="flex flex-wrap gap-4">
                  {ACCESS_PAGES.map(
                    (page) => (
                      console.log(page),
                      (
                        <label key={page} className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={formData.accessPages.includes(page)}
                            onChange={() => handleToggleAccess(page)}
                            className="accent-green-500"
                          />
                          <span className="capitalize">
                            {page.replace("-", " ")}
                          </span>
                        </label>
                      )
                    )
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="bg-gray-600 px-4 py-2 rounded hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-green-600 px-4 py-2 rounded hover:bg-green-700"
                >
                  Create Admin
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminController;
