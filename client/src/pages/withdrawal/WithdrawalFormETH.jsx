import React, { useState } from "react";
import axios from "axios";
import { API_CONFIG } from "../../config/api.config";

const WithdrawalFormETH = () => {
  const [formData, setFormData] = useState({
    amount: "",
    walletAddress: "",
    email: "",
  });
  const [showPopup, setShowPopup] = useState(false);

  const user = JSON.parse(localStorage.getItem("cw_user") || localStorage.getItem("user") || "null");
  const accessToken = localStorage.getItem("accessToken");
  const userId = user?._id || user?.id;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!userId) {
      console.error("Missing userId: please login again");
      return;
    }

    try {
      const apiBase = API_CONFIG.API_BASE;
      await axios.post(
        `${apiBase}/withdraws/create`,
        {
          userId,
          amount: formData.amount,
          method: "ETH",
          details: formData,
          remarks: "Withdrawal request for ETH",
        },
        {
          headers: { Authorization: accessToken },
          withCredentials: true,
        }
      );

      setShowPopup(true);
      // Reset form
      setFormData({ amount: "", walletAddress: "", email: "" });
    } catch (error) {
      console.error("Error submitting withdrawal:", error);
    }
  };

  return (
    <div className="bg-white text-gray-900 py-6 px-4 flex justify-center min-h-screen">
      <div className="flex items-start flex-col min-h-screen w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6">Withdraw ETH</h2>

        <form onSubmit={handleSubmit} className="w-full space-y-4">
          <div>
            <label className="block mb-2 font-semibold text-gray-800">
              Withdrawal Amount (ETH)
            </label>
            <input
              type="number"
              name="amount"
              placeholder="Enter amount"
              className="bg-white border border-gray-300 px-4 py-2 rounded-md w-full text-gray-800 outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.amount}
              onChange={handleChange}
              min={0.01}
            />
          </div>

          <div>
            <label className="block mb-2 font-semibold text-gray-800">
              ETH Wallet Address
            </label>
            <input
              type="text"
              name="walletAddress"
              placeholder="Enter ETH Wallet Address"
              className="bg-white border border-gray-300 px-4 py-2 rounded-md w-full text-gray-800 outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.walletAddress}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label className="block mb-2 font-semibold text-gray-800">
              Email
            </label>
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
            <p>Your withdrawal request has been submitted successfully!</p>
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

export default WithdrawalFormETH;
