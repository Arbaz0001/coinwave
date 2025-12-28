import axios from "axios";
import React, { useEffect, useState } from "react";

const Deposit = () => {
  const [method, setMethod] = useState("UPI");
  const [amount, setAmount] = useState("");
  const [payNumber, setPayNumber] = useState("");
  const [cryptoType, setCryptoType] = useState("usdt");
  const [network, setNetwork] = useState("trc20");
  const [qrCodes, setQrCodes] = useState({ upi: [], crypto: [] });
  const [loading, setLoading] = useState(false);
  const [showPopup, setShowPopup] = useState(false);

  // ✅ Base URL for serving images (removes /api)
  const BASE_URL = import.meta.env.VITE_API_URL.replace("/api", "");

  // ✅ Load user safely from localStorage
  const user = JSON.parse(localStorage.getItem("cw_user"));
  const userId = user?._id || user?.id || null;

  // ✅ Fetch both UPI & Crypto QR Codes
  const fetchQrCodes = async () => {
    try {
      const upiRes = await fetch(`${import.meta.env.VITE_API_URL}/qrcode/qr-codes`);
      const upiData = await upiRes.json();

      const cryptoRes = await fetch(`${import.meta.env.VITE_API_URL}/crypto-qrcode/all`);
      const cryptoData = await cryptoRes.json();

      setQrCodes({
        upi: upiData.data || [],
        crypto: cryptoData.data || [],
      });
    } catch (err) {
      console.error("❌ Failed to fetch QR codes:", err);
    }
  };

  useEffect(() => {
    fetchQrCodes();
  }, []);

  // 🟩 Handle Deposit Submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!userId) return alert("⚠️ Please log in before making a deposit!");
    if (!amount || !payNumber) return alert("⚠️ Please enter all deposit details!");
    if (amount < 100) return alert("⚠️ Minimum deposit amount is ₹100!");

    setLoading(true);

    const details = {
      payNumber,
      ...(method === "Crypto" && { network, cryptoType }),
    };

    const payload = {
      userId,
      amount,
      method,
      details,
      remarks: `Deposit via ${method}`,
    };

    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/deposit/create`, payload);
      if (res.data.success) {
        console.log("✅ Deposit Created:", res.data.data);
        setShowPopup(true);
        setAmount("");
        setPayNumber("");
      } else {
        alert(res.data.message || "Deposit creation failed!");
      }
    } catch (error) {
      console.error("❌ Deposit Error:", error);
      alert(error.response?.data?.message || "Server error, please try again!");
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

  // 🧩 Render Amount Input
  const renderAmountInput = () => (
    <div className="mb-4 w-full">
      <label className="text-gray-700 font-medium block mb-2">Deposit Amount (₹)</label>
      <input
        type="number"
        min={100}
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        placeholder="Enter deposit amount"
        className="bg-white border border-gray-300 px-4 py-2 rounded-md w-full focus:ring-2 focus:ring-blue-500 outline-none"
      />
    </div>
  );

  // 🧩 Render Crypto Options
  const renderCryptoOptions = () => (
    <div className="mb-4">
      <h2 className="font-semibold mb-2">Select Crypto Type</h2>
      <div className="flex gap-3 mb-2">
        {["usdt", "btc"].map((type) => (
          <button
            key={type}
            type="button"
            onClick={() => setCryptoType(type)}
            className={`px-4 py-2 border rounded-md ${
              cryptoType === type ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700"
            }`}
          >
            {type.toUpperCase()}
          </button>
        ))}
      </div>

      <h2 className="font-semibold mb-2">Select Network</h2>
      <div className="flex gap-3">
        {["trc20", "erc20"].map((net) => (
          <button
            key={net}
            type="button"
            onClick={() => setNetwork(net)}
            className={`px-4 py-2 border rounded-md ${
              network === net ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700"
            }`}
          >
            {net.toUpperCase()}
          </button>
        ))}
      </div>
    </div>
  );

  // 🧩 Render QR Image
  const renderQR = () => {
    if (method === "UPI") {
      const qr = qrCodes.upi?.[0];
      return qr ? (
        <img
  src={
    qr.imageUrl.startsWith("http")
      ? qr.imageUrl
      : `${import.meta.env.VITE_API_URL.replace(/\/$/, "")}${qr.imageUrl}`
  }
  alt="UPI QR"
  className="w-48 h-48 object-contain rounded-lg mx-auto border"
/>

      ) : (
        <p className="text-gray-500 text-center">No UPI QR available</p>
      );
    }

    const qr = getCryptoQR();
    return qr ? (
      <img
        src={`${BASE_URL}${qr.imageUrl}`}
        alt={qr.title || "Crypto QR"}
        className="w-48 h-48 object-contain rounded-lg mx-auto border"
      />
    ) : (
      <p className="text-gray-500 text-center">
        No Crypto QR found for {cryptoType.toUpperCase()} ({network.toUpperCase()})
      </p>
    );
  };

  return (
    <div className="bg-white text-gray-900 py-6 px-4 flex justify-center min-h-screen">
      <div className="flex flex-col w-full max-w-md">
        {/* Method Selection */}
        <div className="flex gap-4 justify-center mb-4">
          {["UPI", "Crypto"].map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMethod(m)}
              className={`px-4 py-2 rounded-md shadow ${
                method === m ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700"
              }`}
            >
              {m}
            </button>
          ))}
        </div>

        {/* Amount */}
        {renderAmountInput()}

        {/* Crypto Options */}
        {method === "Crypto" && renderCryptoOptions()}

        {/* QR Code */}
        {amount && renderQR()}

        {/* Transaction ID Input */}
        {amount && (
          <div className="mt-4">
            <label className="block font-medium mb-2">
              {method === "UPI" ? "UPI Transaction ID" : "Crypto Transaction Hash"}
            </label>
            <input
              type="text"
              value={payNumber}
              onChange={(e) => setPayNumber(e.target.value)}
              placeholder={
                method === "UPI" ? "Enter UPI Transaction ID" : "Enter Crypto Tx Hash"
              }
              className="border border-gray-300 px-4 py-2 rounded-md w-full focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
        )}

        {/* Submit Button */}
        {amount && payNumber && (
          <button
            onClick={handleSubmit}
            disabled={loading}
            className={`w-full mt-4 py-2 rounded-md text-white ${
              loading ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {loading ? "Submitting..." : "Submit Deposit"}
          </button>
        )}

        {/* ✅ Success Popup */}
        {showPopup && (
          <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50">
            <div className="bg-white rounded-md shadow-lg p-6 max-w-sm w-full">
              <h2 className="text-xl font-bold mb-4 text-center text-green-600">
                Deposit Submitted ✅
              </h2>
              <p className="text-center">
                Your deposit request has been submitted successfully!
              </p>
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
    </div>
  );
};

export default Deposit;
