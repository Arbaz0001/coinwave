import axios from "axios";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";

const Deposit = () => {
  const [method, setMethod] = useState("UPI");
  const [amount, setAmount] = useState("");
  const [transactionId, setTransactionId] = useState("");
  const [cryptoType, setCryptoType] = useState("usdt");
  const [network, setNetwork] = useState("trc20");
  const [transactionHash, setTransactionHash] = useState("");
  const [qrCodes, setQrCodes] = useState({ upi: [], crypto: [] });
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // ✅ API Base URL
  const API_BASE = import.meta.env.VITE_API_URL.replace(/\/$/, "") + "/api";
  const BASE_URL = import.meta.env.VITE_API_URL.replace(/\/$/, "");

  // ✅ Get current user
  const user = JSON.parse(localStorage.getItem("cw_user"));
  const userId = user?._id || user?.id || null;

  // ✅ Fetch QR codes on mount
  useEffect(() => {
    fetchQrCodes();
  }, []);

  // ✅ Load all QR codes
  const fetchQrCodes = async () => {
    setLoading(true);
    try {
      const [upiRes, cryptoRes] = await Promise.all([
        fetch(`${API_BASE}/qrcode/qr-codes`),
        fetch(`${API_BASE}/crypto-qrcode/all`),
      ]);

      const upiData = await upiRes.json();
      const cryptoData = await cryptoRes.json();

      setQrCodes({
        upi: upiData.data || [],
        crypto: cryptoData.data || [],
      });

      console.log("✅ QR codes loaded:", {
        upi: upiData.data?.length || 0,
        crypto: cryptoData.data?.length || 0,
      });
    } catch (err) {
      console.error("❌ Failed to fetch QR codes:", err);
      toast.error("Failed to load QR codes. Please refresh.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Find matching Crypto QR
  const getCryptoQR = () => {
    if (!qrCodes.crypto?.length) return null;
    return qrCodes.crypto.find(
      (q) =>
        q.cryptoType?.toLowerCase() === cryptoType.toLowerCase() &&
        q.network?.toLowerCase() === network.toLowerCase()
    );
  };

  // ✅ Get current QR info
  const getCurrentQR = () => {
    if (method === "UPI") {
      return qrCodes.upi?.[0] || null;
    }
    return getCryptoQR();
  };

  // ✅ Submit UPI deposit
  const handleUPISubmit = async (e) => {
    e.preventDefault();

    if (!userId) {
      toast.error("❌ Please log in first");
      return;
    }

    if (!amount || !transactionId) {
      toast.error("❌ Please enter amount and transaction ID");
      return;
    }

    if (Number(amount) < 100) {
      toast.error("❌ Minimum deposit amount is ₹100");
      return;
    }

    setSubmitting(true);
    try {
      const response = await axios.post(
        `${API_BASE}/deposit/upi`,
        {
          userId,
          amount: Number(amount),
          transactionId,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("user_token")}`,
          },
        }
      );

      if (response.data?.success) {
        toast.success("✅ UPI deposit request submitted!");
        setAmount("");
        setTransactionId("");
        // Optionally fetch updated deposits
      } else {
        toast.error(response.data?.message || "Failed to submit deposit");
      }
    } catch (error) {
      console.error("❌ Deposit error:", error);
      toast.error(error.response?.data?.message || "Failed to submit deposit");
    } finally {
      setSubmitting(false);
    }
  };

  // ✅ Submit Crypto deposit
  const handleCryptoSubmit = async (e) => {
    e.preventDefault();

    if (!userId) {
      toast.error("❌ Please log in first");
      return;
    }

    if (!amount || !transactionHash) {
      toast.error("❌ Please enter amount and transaction hash");
      return;
    }

    if (Number(amount) < 100) {
      toast.error("❌ Minimum deposit amount is ₹100");
      return;
    }

    setSubmitting(true);
    try {
      const response = await axios.post(
        `${API_BASE}/deposit/crypto`,
        {
          userId,
          amount: Number(amount),
          cryptoType,
          network,
          transactionHash,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("user_token")}`,
          },
        }
      );

      if (response.data?.success) {
        toast.success("✅ Crypto deposit request submitted!");
        setAmount("");
        setTransactionHash("");
      } else {
        toast.error(response.data?.message || "Failed to submit deposit");
      }
    } catch (error) {
      console.error("❌ Crypto deposit error:", error);
      toast.error(error.response?.data?.message || "Failed to submit deposit");
    } finally {
      setSubmitting(false);
    }
  };

  // ✅ Render UPI QR Section
  const renderUPIQR = () => {
    const qr = qrCodes.upi?.[0];

    return (
      <div className="flex flex-col items-center gap-4">
        {loading ? (
          <div className="text-gray-500">Loading UPI QR...</div>
        ) : qr ? (
          <>
            <div className="p-4 bg-gray-50 rounded-lg">
              <img
                src={
                  qr.imageUrl.startsWith("http")
                    ? qr.imageUrl
                    : `${BASE_URL}${qr.imageUrl}`
                }
                alt="UPI QR"
                className="w-40 h-40 object-contain rounded-md border"
              />
            </div>
            {qr.title && <p className="text-sm text-gray-600">{qr.title}</p>}
          </>
        ) : (
          <p className="text-red-500">❌ No UPI QR available</p>
        )}
      </div>
    );
  };

  // ✅ Render Crypto QR Section
  const renderCryptoQR = () => {
    const qr = getCryptoQR();

    return (
      <div className="flex flex-col items-center gap-4">
        {loading ? (
          <div className="text-gray-500">Loading Crypto QR...</div>
        ) : qr ? (
          <>
            <div className="p-4 bg-gray-50 rounded-lg">
              <img
                src={
                  qr.imageUrl.startsWith("http")
                    ? qr.imageUrl
                    : `${BASE_URL}${qr.imageUrl}`
                }
                alt={qr.title}
                className="w-40 h-40 object-contain rounded-md border"
              />
            </div>

            {qr.address && (
              <div className="w-full p-3 bg-blue-50 rounded-lg">
                <p className="text-xs text-gray-600 mb-1">Wallet Address:</p>
                <p className="text-sm font-mono break-all text-blue-600">
                  {qr.address}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(qr.address);
                    toast.success("✅ Address copied!");
                  }}
                  className="mt-2 text-xs text-blue-600 hover:text-blue-700 underline"
                >
                  Copy Address
                </button>
              </div>
            )}

            {qr.title && <p className="text-sm text-gray-600">{qr.title}</p>}
          </>
        ) : (
          <p className="text-red-500">
            ❌ No QR found for {cryptoType.toUpperCase()} ({network.toUpperCase()})
          </p>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Make a Deposit</h1>
          <p className="text-gray-600">
            Choose your preferred payment method and submit your transaction details
          </p>
        </div>

        {/* Method Selection */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Select Payment Method
          </h2>

          <div className="flex gap-4">
            {["UPI", "Crypto"].map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMethod(m)}
                className={`flex-1 px-6 py-3 rounded-lg font-medium transition ${
                  method === m
                    ? "bg-blue-600 text-white shadow-lg"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {m === "UPI" ? "💳 UPI" : "₿ Crypto"}
              </button>
            ))}
          </div>
        </div>

        {/* Method-specific content */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          {method === "UPI" ? (
            <>
              {/* UPI QR Code */}
              <div className="mb-8 pb-8 border-b">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Step 1: Scan QR Code
                </h3>
                {renderUPIQR()}
              </div>

              {/* UPI Form */}
              <form onSubmit={handleUPISubmit} className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Step 2: Submit Transaction Details
                </h3>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Deposit Amount (₹)
                  </label>
                  <input
                    type="number"
                    min="100"
                    step="1"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Enter amount (minimum ₹100)"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    disabled={submitting}
                  />
                  <p className="text-xs text-gray-500 mt-1">Minimum ₹100</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    UPI Transaction ID / Reference
                  </label>
                  <input
                    type="text"
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value)}
                    placeholder="Enter UPI transaction ID (e.g., 417U84EBVFD22F)"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    disabled={submitting}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    You'll find this in your bank/UPI app after payment
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={submitting || !amount || !transactionId}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  {submitting ? "Submitting..." : "Submit UPI Deposit"}
                </button>
              </form>
            </>
          ) : (
            <>
              {/* Crypto Options */}
              <div className="mb-8 pb-8 border-b">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Step 1: Select Network
                </h3>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Crypto Type
                  </label>
                  <div className="flex gap-3">
                    {["usdt"].map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setCryptoType(type)}
                        disabled
                        className="px-4 py-2 rounded-lg font-medium bg-blue-600 text-white"
                      >
                        {type.toUpperCase()}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Currently only USDT is supported
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Blockchain Network
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {["trc20", "erc20", "bep20"].map((net) => (
                      <button
                        key={net}
                        type="button"
                        onClick={() => setNetwork(net)}
                        className={`px-3 py-2 rounded-lg font-medium text-sm transition ${
                          network === net
                            ? "bg-blue-600 text-white"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                      >
                        {net.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Crypto QR Code */}
              <div className="mb-8 pb-8 border-b">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Step 2: Send To This Address
                </h3>
                {renderCryptoQR()}
              </div>

              {/* Crypto Form */}
              <form onSubmit={handleCryptoSubmit} className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Step 3: Submit Transaction Details
                </h3>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Deposit Amount (₹ equivalent)
                  </label>
                  <input
                    type="number"
                    min="100"
                    step="1"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Enter deposit amount in INR equivalent"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    disabled={submitting}
                  />
                  <p className="text-xs text-gray-500 mt-1">Minimum ₹100</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Blockchain Transaction Hash / ID
                  </label>
                  <input
                    type="text"
                    value={transactionHash}
                    onChange={(e) => setTransactionHash(e.target.value)}
                    placeholder="Enter transaction hash (0x...)"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-mono text-sm"
                    disabled={submitting}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    You can find this on the blockchain explorer
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={submitting || !amount || !transactionHash}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  {submitting ? "Submitting..." : "Submit Crypto Deposit"}
                </button>
              </form>
            </>
          )}

          {/* Info Box */}
          <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-semibold text-blue-900 mb-2">ℹ️ What happens next?</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>✓ Your deposit request will be reviewed by our admin team</li>
              <li>✓ Once verified, funds will be added to your wallet</li>
              <li>✓ You'll receive a notification when your deposit is approved</li>
              <li>✓ Contact support if you have any issues</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Deposit;
