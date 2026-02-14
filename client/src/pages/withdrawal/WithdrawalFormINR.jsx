import React, { useState } from "react";
import axios from "axios";

const WithdrawalFormINR = () => {
  const [formData, setFormData] = useState({
    amount: "",
    email: "",
    phone: "",
    firstName: "",
    lastName: "",
    accountNumber: "",
    ifsc: "",
  });
  const [showPopup, setShowPopup] = useState(false);

   const user = JSON.parse(localStorage.getItem("cw_user")); // ✅ fixed key
  const accessToken = localStorage.getItem("accessToken");
  const userId = user?._id || user?.id; // ✅ safe fallback

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const apiBase = import.meta.env.VITE_API_URL.replace(/\/$/, "") + "/api";
      await axios.post(
        `${apiBase}/withdraws/create`,
        {
          userId,
          amount: formData.amount,
          method: "NRI",
          details: formData,
          remarks: "Withdrawal request for INR",
        },
        {
          headers: {
            Authorization: accessToken,
          },
          withCredentials: true,
        }
      );

      setShowPopup(true);

      // Reset form
      setFormData({
        amount: "",
        email: "",
        phone: "",
        firstName: "",
        lastName: "",
        accountNumber: "",
        ifsc: "",
      });
    } catch (error) {
      console.error("Error submitting withdrawal:", error);
    }
  };

  return (
    <div className="bg-white text-gray-900 py-6 px-4 flex justify-center min-h-screen">
      <div className="flex items-start flex-col min-h-screen w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6">Withdraw INR</h2>

        <form onSubmit={handleSubmit} className="w-full space-y-4">
          <div>
            <label className="block mb-2 font-semibold text-gray-800">
              Withdrawal Amount (INR)
            </label>
            <input
              type="number"
              name="amount"
              placeholder="Enter amount"
              className="bg-white border border-gray-300 px-4 py-2 rounded-md w-full text-gray-800 outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.amount}
              onChange={handleChange}
              min={100}
              required
            />
          </div>

          <div>
            <label className="block mb-2 font-semibold text-gray-800">Email</label>
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              className="bg-white border border-gray-300 px-4 py-2 rounded-md w-full text-gray-800 outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label className="block mb-2 font-semibold text-gray-800">Phone</label>
            <input
              type="text"
              name="phone"
              placeholder="Enter phone number"
              className="bg-white border border-gray-300 px-4 py-2 rounded-md w-full text-gray-800 outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.phone}
              onChange={handleChange}
              required
            />
          </div>

          <div className="flex space-x-4">
            <div className="flex-1">
              <label className="block mb-2 font-semibold text-gray-800">
                First Name
              </label>
              <input
                type="text"
                name="firstName"
                placeholder="First name"
                className="bg-white border border-gray-300 px-4 py-2 rounded-md w-full text-gray-800 outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.firstName}
                onChange={handleChange}
                required
              />
            </div>
            <div className="flex-1">
              <label className="block mb-2 font-semibold text-gray-800">
                Last Name
              </label>
              <input
                type="text"
                name="lastName"
                placeholder="Last name"
                className="bg-white border border-gray-300 px-4 py-2 rounded-md w-full text-gray-800 outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.lastName}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div>
            <label className="block mb-2 font-semibold text-gray-800">
              Bank Account Number
            </label>
            <input
              type="text"
              name="accountNumber"
              placeholder="Enter bank account number"
              className="bg-white border border-gray-300 px-4 py-2 rounded-md w-full text-gray-800 outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.accountNumber}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label className="block mb-2 font-semibold text-gray-800">
              IFSC Code
            </label>
            <input
              type="text"
              name="ifsc"
              placeholder="Enter IFSC Code"
              className="bg-white border border-gray-300 px-4 py-2 rounded-md w-full text-gray-800 outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.ifsc}
              onChange={handleChange}
              required
            />
          </div>

          <button
            type="submit"
            className="w-full mt-4 cursor-pointer bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md"
          >
            Submit Withdrawal
          </button>
        </form>
      </div>

      {/* Success Popup */}
      {showPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50">
          <div className="bg-white text-black rounded-md shadow-lg p-6 max-w-sm w-full">
            <h2 className="text-xl font-bold mb-4">Withdrawal Submitted</h2>
            <p>Your INR withdrawal request has been submitted successfully!</p>
            <button
              onClick={() => setShowPopup(false)}
              className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md w-full"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default WithdrawalFormINR;
