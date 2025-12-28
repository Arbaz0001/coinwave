import React, { useState } from "react";
import axios from "axios";

const WithdrawalFormUSDT = () => {
  const [formData, setFormData] = useState({
    amount: "",
    network: "TRC20",
    walletAddress: "",
    email: "",
  });
  const [showPopup, setShowPopup] = useState(false);

  const user = JSON.parse(localStorage.getItem("user"));
  const accessToken = localStorage.getItem("accessToken");
  const userId = user?._id;

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
      await axios.post(
        `${import.meta.env.VITE_API_URL}/withdraws/create`,
        {
          userId,
          amount: formData.amount,
          method: "USDT",
          details: formData,
          remarks: "Withdrawal request for USDT",
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
        network: "TRC20",
        walletAddress: "",
        email: "",
      });
    } catch (error) {
      console.error("Error submitting withdrawal:", error);
    }
  };

  return (
    <div className="bg-white text-gray-900 py-6 px-4 flex justify-center min-h-screen">
      <div className="flex items-start flex-col min-h-screen w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6">Withdraw USDT</h2>

        <form onSubmit={handleSubmit} className="w-full space-y-4">
          <div>
            <label className="block mb-2 font-semibold text-gray-800">
              Withdrawal Amount (USDT)
            </label>
            <input
              type="number"
              name="amount"
              placeholder="Enter amount"
              className="bg-white border border-gray-300 px-4 py-2 rounded-md w-full text-gray-800 outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.amount}
              onChange={handleChange}
              min={10}
              required
            />
          </div>

          <div>
            <label className="block mb-2 font-semibold text-gray-800">
              Select Network
            </label>
            <select
              name="network"
              className="bg-white border border-gray-300 px-4 py-2 rounded-md w-full text-gray-800 outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.network}
              onChange={handleChange}
              required
            >
              <option value="TRC20">TRC20</option>
              <option value="ERC20">ERC20</option>
            </select>
          </div>

          <div>
            <label className="block mb-2 font-semibold text-gray-800">
              Wallet Address
            </label>
            <input
              type="text"
              name="walletAddress"
              placeholder="Enter your USDT Wallet Address"
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
            <p>Your USDT withdrawal request has been submitted successfully!</p>
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

export default WithdrawalFormUSDT;
