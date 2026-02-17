import React, { useState, useEffect } from "react";
import { CheckCircle, ArrowLeft } from "lucide-react";
import axiosInstance from "../utils/axiosInstance";
import { toast } from "react-toastify";
import { API_CONFIG } from "../config/api.config";

export default function BuyUSDT() {
  const [step, setStep] = useState(1); // 1: Network, 2: Wallet Address, 3: Amount & Payment
  const [amount, setAmount] = useState("");
  const [selectedNetwork, setSelectedNetwork] = useState("trc20");
  const [userWalletAddress, setUserWalletAddress] = useState("");
  const [qrCode, setQrCode] = useState(null);
  const [transactionId, setTransactionId] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const API_BASE = API_CONFIG.API_BASE;
  const BASE_URL = API_CONFIG.BASE_URL;
  
  const user = JSON.parse(localStorage.getItem("cw_user"));
  const userId = user?._id || user?.id || null;

  // Network configurations
  const networks = {
    trc20: {
      network: "TRON (TRC20)",
      symbol: "USDT-TRON",
      icon: "🔴",
      description: "Send USDT on TRON network",
    },
    erc20: {
      network: "Ethereum (ERC20)",
      symbol: "USDT-ETH",
      icon: "🔵",
      description: "Send USDT on Ethereum network",
    },
    bep20: {
      network: "BSC (BEP20)",
      symbol: "USDT-BSC",
      icon: "🟡",
      description: "Send USDT on Binance Smart Chain",
    },
  };

  // ✅ Fetch QR code
  useEffect(() => {
    const fetchQRCode = async () => {
      try {
        const qrRes = await axiosInstance.get(`${API_BASE}/qrcode/qr-codes`);
        if (qrRes.data?.data?.[0]) {
          setQrCode(qrRes.data.data[0]);
        }
      } catch (err) {
        console.error("❌ Failed to fetch QR code:", err.message);
      }
    };
    fetchQRCode();
  }, []);

  // Submit payment with auth headers
  const handleSubmitPayment = async () => {
    if (!transactionId.trim()) {
      toast.error("❌ Please enter transaction ID");
      return;
    }

    if (!userId) {
      toast.error("❌ Not authenticated. Please log in again.");
      return;
    }

    setSubmitting(true);
    try {
      const response = await axiosInstance.post(
        `${API_BASE}/deposit/upi`,
        {
          userId,
          amount: Number(amount),
          transactionId,
          method: "BUY_USDT",
          network: selectedNetwork.toUpperCase(),
          walletAddress: userWalletAddress,
          message: `User wants to buy USDT via ${networks[selectedNetwork].network}. Send ₹${amount} worth of USDT to wallet: ${userWalletAddress}`,
        }
      );

      if (response.data?.success) {
        toast.success("✅ Payment submitted successfully!");
        setAmount("");
        setTransactionId("");
        setUserWalletAddress("");
        setStep(1);
      }
    } catch (err) {
      const errorMsg =
        err.response?.data?.message || err.message || "Failed to process payment";
      toast.error(`❌ ${errorMsg}`);
      console.error("Payment error:", err);
    } finally {
      setSubmitting(false);
    }
  };

  // STEP 1: Network Selection
  if (step === 1) {
    return (
      <div className="p-4 md:p-6 lg:p-8 min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-bold mb-6 text-gray-800">💰 Buy USDT</h1>

        <div className="mb-6 p-4 md:p-6 border rounded-xl bg-white shadow-sm">
          <h2 className="font-semibold text-gray-700 mb-3 text-lg md:text-xl">
            📡 Select Blockchain Network
          </h2>
          <p className="text-xs md:text-sm text-gray-600 mb-4">
            Choose which blockchain network you want to receive USDT on
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {Object.entries(networks).map(([key, data]) => (
              <div
                key={key}
                onClick={() => setSelectedNetwork(key)}
                className={`p-4 md:p-5 border-2 rounded-xl cursor-pointer transition-all hover:shadow-md ${
                  selectedNetwork === key
                    ? "border-blue-500 bg-blue-50 shadow-md"
                    : "border-gray-300 hover:border-blue-300"
                }`}
              >
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900 text-base md:text-lg">
                      {data.icon} {data.network}
                    </p>
                    <p className="text-xs md:text-sm text-gray-600 mt-1">
                      {data.description}
                    </p>
                  </div>
                  {selectedNetwork === key && (
                    <CheckCircle className="text-blue-500 flex-shrink-0" size={24} />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={() => setStep(2)}
          className="w-full py-3 md:py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-all text-base md:text-lg shadow-lg hover:shadow-xl"
        >
          Next: Enter Your Wallet Address
        </button>
        </div>
      </div>
    );
  }

  // STEP 2: Enter Wallet Address
  if (step === 2) {
    return (
      <div className="p-4 md:p-6 lg:p-8 min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => setStep(1)}
            className="text-gray-600 hover:text-gray-800 p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Wallet Address</h1>
        </div>

        {/* Selected Network Info */}
        <div className="mb-6 p-4 md:p-6 bg-blue-50 border border-blue-200 rounded-xl shadow-sm">
          <p className="text-xs md:text-sm text-gray-600">Selected Network</p>
          <p className="font-semibold text-gray-900 text-lg md:text-xl">
            {networks[selectedNetwork].icon} {networks[selectedNetwork].network}
          </p>
          <p className="text-xs md:text-sm text-gray-600 mt-1">{networks[selectedNetwork].description}</p>
        </div>

        {/* Wallet Address Input */}
        <div className="mb-6 p-4 md:p-6 border-2 border-red-300 rounded-xl bg-red-50 shadow-sm">
          <h2 className="font-semibold text-gray-800 mb-3 text-base md:text-lg">
            📮 Enter Your {networks[selectedNetwork].network} Address
          </h2>
          <p className="text-xs md:text-sm text-gray-600 mb-3">
            USDT will be sent to this address after you complete payment
          </p>
          <input
            type="text"
            placeholder={`Enter your ${networks[selectedNetwork].network} wallet address`}
            value={userWalletAddress}
            onChange={(e) => setUserWalletAddress(e.target.value)}
            className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 md:py-4 text-gray-700 focus:outline-none focus:border-red-500 font-mono text-sm md:text-base"
          />
          <p className="text-xs md:text-sm text-gray-500 mt-2">
            ⚠️ Double-check your address. Incorrect address may result in loss of funds.
          </p>
        </div>

        {userWalletAddress && (
          <div className="mb-6 p-3 bg-green-50 border border-green-300 rounded-lg">
            <p className="text-xs text-gray-600 mb-1">You entered:</p>
            <p className="text-sm font-mono text-gray-900 break-all">
              {userWalletAddress}
            </p>
          </div>
        )}

        <button
          onClick={() => setStep(3)}
          disabled={!userWalletAddress.trim()}
          className="w-full py-3 md:py-4 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-xl font-semibold transition-all text-base md:text-lg shadow-lg hover:shadow-xl"
        >
          Next: Enter Amount
        </button>
        </div>
      </div>
    );
  }

  // STEP 3: Enter Amount & Payment
  if (step === 3) {
    return (
      <div className="p-4 md:p-6 lg:p-8 min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => setStep(2)}
            className="text-gray-600 hover:text-gray-800 p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Payment Details</h1>
        </div>

        {/* Summary */}
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-xs text-gray-600 mb-1">Network</p>
          <p className="font-semibold text-gray-900">
            {networks[selectedNetwork].icon} {networks[selectedNetwork].network}
          </p>
          <p className="text-xs text-gray-600 mt-2 mb-1">Wallet Address</p>
          <p className="text-xs font-mono text-gray-800 break-all bg-white p-2 rounded">
            {userWalletAddress}
          </p>
        </div>

        {/* Amount Input */}
        <div className="mb-6 p-4 border rounded-lg bg-gray-50">
          <h2 className="font-semibold text-gray-700 mb-3">
            💵 How Much Do You Want to Pay?
          </h2>
          <div className="relative">
            <input
              type="number"
              min="1"
              step="1"
              placeholder="Enter amount in ₹"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 text-gray-700 focus:outline-none focus:border-blue-500 text-lg"
            />
            <span className="absolute right-4 top-3 text-2xl font-bold text-gray-600">₹</span>
          </div>
          
          {amount && Number(amount) > 0 && (
            <div className="mt-4 space-y-3">
              {/* Payment Amount */}
              <div className="p-3 bg-blue-100 border border-blue-300 rounded-lg">
                <p className="text-xs text-gray-700">Amount to Pay via UPI:</p>
                <p className="text-2xl font-bold text-blue-700">₹{Number(amount).toFixed(2)}</p>
              </div>
            </div>
          )}
        </div>

        {/* UPI QR Code */}
        {amount && Number(amount) > 0 && (
          <div className="mb-6 p-4 md:p-6 border rounded-xl bg-white shadow-lg">
            <h2 className="font-semibold text-gray-700 mb-4 text-lg md:text-xl">📱 Scan to Pay</h2>
            {qrCode ? (
              <div className="flex flex-col items-center gap-4">
                <div className="p-4 md:p-6 bg-gray-50 rounded-xl border-2 border-blue-200">
                  <img
                    src={
                      qrCode.imageUrl.startsWith("http")
                        ? qrCode.imageUrl
                        : `${BASE_URL}${qrCode.imageUrl}`
                    }
                    alt="UPI QR Code"
                    className="w-48 h-48 md:w-64 md:h-64 object-contain"
                  />
                </div>
                <p className="text-xs md:text-sm text-gray-600 text-center">
                  Scan with any UPI app to pay <span className="font-bold text-lg">₹{Number(amount).toFixed(2)}</span>
                </p>
              </div>
            ) : (
              <p className="text-red-500 text-center py-4 text-sm md:text-base">
                ❌ QR Code not available
              </p>
            )}
          </div>
        )}

        {/* Transaction ID Input */}
        {amount && Number(amount) > 0 && (
          <div className="mb-6 p-4 border rounded-lg bg-gray-50">
            <h2 className="font-semibold text-gray-700 mb-3">
              📧 Enter Transaction ID
            </h2>
            <input
              type="text"
              placeholder="Enter UPI transaction reference ID"
              value={transactionId}
              onChange={(e) => setTransactionId(e.target.value)}
              className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 text-gray-700 focus:outline-none focus:border-blue-500"
            />
            <p className="text-xs text-gray-600 mt-2">
              You'll receive this ID after payment via UPI
            </p>
          </div>
        )}

        {/* Submit Button */}
        {amount && Number(amount) > 0 && (
          <button
            onClick={handleSubmitPayment}
            disabled={submitting || !transactionId.trim()}
            className="w-full py-3 md:py-4 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-xl font-semibold transition-all text-base md:text-lg shadow-lg hover:shadow-xl"
          >
            {submitting ? "Processing..." : "✅ Confirm Payment"}
          </button>
        )}

        {/* Info */}
        <div className="mt-6 p-4 md:p-6 bg-yellow-50 border border-yellow-200 rounded-xl shadow-sm">
          <p className="text-xs md:text-sm text-gray-700">
            <span className="font-semibold">ℹ️ Note:</span> After payment confirmation, admin will send USDT worth ₹{Number(amount).toFixed(2)} to your wallet address on {networks[selectedNetwork].network}.
          </p>
        </div>
        </div>
      </div>
    );
  }
}
