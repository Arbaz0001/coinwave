import React, { useState, useEffect } from "react";
import { CheckCircle, ArrowLeft } from "lucide-react";
import axiosInstance from "../utils/axiosInstance.js";
import { toast } from "react-toastify";
import SellNotificationModal from "../components/SellNotificationModal";
import { API_CONFIG } from "../config/api.config";

export default function SellUSDT() {
  // ===== STATE MANAGEMENT =====
  const [step, setStep] = useState(1); // 1: Bank 2: UPI 3: USDT Amount 4: Admin Scanners 5: Confirmation
  
  const [submitting, setSubmitting] = useState(false);

  // Bank Account Details
  const [bankAccount, setBankAccount] = useState({
    accountNumber: "",
    confirmAccountNumber: "",
    ifscCode: "",
    accountHolderName: "",
    bankName: "",
  });

  // UPI Details
  const [upiId, setUpiId] = useState("");

  // USDT & Network
  const [usdtAmount, setUsdtAmount] = useState("");
  const [selectedNetwork, setSelectedNetwork] = useState("trc20");

  // Admin QR Code (network-specific)
  const [networkQrCode, setNetworkQrCode] = useState(null);
  
  // Transaction details
  const [transactionHash, setTransactionHash] = useState("");
  const [adminAddress, setAdminAddress] = useState("");

  // ===== CONSTANTS =====
  const BASE_URL = API_CONFIG.BASE_URL;

  const user = JSON.parse(localStorage.getItem("cw_user"));
  const userId = user?._id || user?.id || null;

  const networks = {
    trc20: {
      network: "TRON (TRC20)",
      symbol: "USDT-TRON",
      icon: "🔴",
      description: "Send USDT from TRON network",
    },
    erc20: {
      network: "Ethereum (ERC20)",
      symbol: "USDT-ETH",
      icon: "🔵",
      description: "Send USDT from Ethereum network",
    },
    bep20: {
      network: "BSC (BEP20)",
      symbol: "USDT-BSC",
      icon: "🟡",
      description: "Send USDT from Binance Smart Chain",
    },
  };

  // ===== FETCH NETWORK-SPECIFIC CRYPTO QR =====
  useEffect(() => {
    const fetchNetworkQr = async () => {
      try {
        const res = await axiosInstance.get(`/api/crypto-qrcode/all`);
        if (res.data?.data && Array.isArray(res.data.data)) {
          // Filter by network and crypto type
          const qr = res.data.data.find(
            (q) => q.network?.toLowerCase() === selectedNetwork.toLowerCase() && q.cryptoType?.toLowerCase() === "usdt"
          );
          setNetworkQrCode(qr || null);
          console.log(`✅ QR for ${selectedNetwork}:`, qr);
        }
      } catch (err) {
        console.error("❌ Failed to fetch crypto QR:", err.message);
      }
    };
    fetchNetworkQr();
  }, [selectedNetwork]);

  // ===== VALIDATIONS =====
  const validateBankAccount = () => {
    if (!bankAccount.accountNumber.trim()) {
      toast.error("❌ Account number required");
      return false;
    }
    if (bankAccount.accountNumber !== bankAccount.confirmAccountNumber) {
      toast.error("❌ Account numbers don't match");
      return false;
    }
    if (!bankAccount.ifscCode.trim()) {
      toast.error("❌ IFSC code required");
      return false;
    }
    if (!bankAccount.accountHolderName.trim()) {
      toast.error("❌ Account holder name required");
      return false;
    }
    if (!bankAccount.bankName.trim()) {
      toast.error("❌ Bank name required");
      return false;
    }
    return true;
  };

  const validateUpi = () => {
    if (!upiId.trim()) {
      toast.error("❌ UPI ID required");
      return false;
    }
    if (!upiId.includes("@")) {
      toast.error("❌ Invalid UPI format (e.g., username@bank)");
      return false;
    }
    return true;
  };

  // ===== SUBMIT SELL REQUEST =====
  const handleSubmitSell = async () => {
    if (!transactionHash.trim()) {
      toast.error("❌ Please enter transaction hash/address");
      return;
    }

    if (!userId) {
      toast.error("❌ Not authenticated. Please log in again.");
      return;
    }
    
    // Before submitting, check for active sell notification
    try {
      const checkRes = await axiosInstance.get(`/api/sell/check-restriction`);
      // if server returns 200 with data, a notification exists
      console.log('✅ Sell notification check response:', checkRes.status, checkRes.data);
      if (checkRes.status === 200 && checkRes.data?.success && checkRes.data.data) {
        // show modal to user instead of proceeding
        const sn = checkRes.data.data;
        console.log('🚫 Sell notification found for user, showing modal:', sn);
        setIsSellRestricted(true);
        setPendingSellNotification(sn);
        setShowSellNotification(true);
        return; // stop submission
      }
    } catch (err) {
      if (err?.response?.status === 204) {
        console.log('✅ No sell notification (204)');
        // no notification, continue
      } else {
        console.error("❌ Sell notification check failed, status:", err?.response?.status, err?.message);
        console.error("Error response:", err?.response?.data);
        // allow to continue in case of check failure
      }
    }

    setSubmitting(true);
    try {
      const payload = {
        userId,
        usdtAmount: Number(usdtAmount),
        network: selectedNetwork.toUpperCase(),
        bankAccount: {
          accountNumber: bankAccount.accountNumber,
          ifscCode: bankAccount.ifscCode,
          accountHolderName: bankAccount.accountHolderName,
          bankName: bankAccount.bankName,
        },
        upiId,
        transactionHash,
        adminAddress,
        message: `User wants to sell ${usdtAmount} USDT via ${networks[selectedNetwork].network}. Receive payment at UPI: ${upiId}`,
      };
      
      console.log("📤 Sending payload:", payload);
      
      // Use axiosInstance which handles token refresh automatically
      const response = await axiosInstance.post(`/api/sell/submit`, payload);
      console.log('📥 Sell response status:', response.status);
      console.log('📦 Sell response data:', response.data);

      if (response?.data?.success) {
        toast.success("✅ Sell request submitted successfully!");
        // Reset form
        setBankAccount({
          accountNumber: "",
          confirmAccountNumber: "",
          ifscCode: "",
          accountHolderName: "",
          bankName: "",
        });
        setUpiId("");
        setUsdtAmount("");
        setTransactionHash("");
        setAdminAddress("");
        setStep(1);
      }
    } catch (err) {
      const errorMsg =
        err.response?.data?.message || err.message || "Failed to submit sell request";
      const status = err.response?.status;
      console.error(`❌ Error (${status}):`, err.response?.data || err.message);
      toast.error(`❌ ${errorMsg}`);
    } finally {
      setSubmitting(false);
    }
  };

  // Sell notification modal handlers
  const [showSellNotification, setShowSellNotification] = useState(false);
  const [pendingSellNotification, setPendingSellNotification] = useState(null);
  const [isSellRestricted, setIsSellRestricted] = useState(false);

  const handleSellPrimary = (url) => {
    // redirect to support/help
    globalThis.location.href = url || "/help-support";
    // do not proceed with sell
    setShowSellNotification(false);
    setPendingSellNotification(null);
    setIsSellRestricted(false);
  };

  // Check restriction on page open
  useEffect(() => {
    const checkOnOpen = async () => {
      try {
        const res = await axiosInstance.get(`/api/sell/check-restriction`);
        console.log('📡 initial sell restriction check:', res.status, res.data);
        if (res.status === 200 && res.data?.success && res.data.data) {
          setPendingSellNotification(res.data.data);
          setShowSellNotification(true);
          setIsSellRestricted(true);
        } else {
          setIsSellRestricted(false);
        }
      } catch (err) {
        if (err?.response?.status === 204) {
          setIsSellRestricted(false);
        } else {
          console.error('❌ initial restriction check failed:', err?.response?.data || err.message);
        }
      }
    };
    checkOnOpen();
  }, []);

  const handleSellCancel = () => {
    setShowSellNotification(false);
    setPendingSellNotification(null);
    setIsSellRestricted(false);
  };

  // ===== STEP 1: BANK ACCOUNT =====
  if (step === 1) {
    return (
      <>
      <div className="p-4 md:p-6 lg:p-8 min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-bold mb-6 text-gray-800">💳 Sell USDT</h1>

        <div className="mb-6 p-4 md:p-6 border-2 border-blue-300 rounded-xl bg-blue-50 shadow-sm">
          <h2 className="font-semibold text-gray-800 mb-3 text-lg md:text-xl">🏦 Step 1: Bank Account</h2>
          <p className="text-xs md:text-sm text-gray-600 mb-4">
            Add your bank account to receive INR payment
          </p>

          <div className="space-y-3">
            {/* Bank Name */}
            <div>
              <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">
                Bank Name
              </label>
              <input
                type="text"
                placeholder="e.g., HDFC Bank, ICICI Bank"
                value={bankAccount.bankName}
                onChange={(e) =>
                  setBankAccount({ ...bankAccount, bankName: e.target.value })
                }
                className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 md:py-3 text-sm md:text-base text-gray-700 focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Account Holder Name */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Account Holder Name
              </label>
              <input
                type="text"
                placeholder="Enter your full name"
                value={bankAccount.accountHolderName}
                onChange={(e) =>
                  setBankAccount({
                    ...bankAccount,
                    accountHolderName: e.target.value,
                  })
                }
                className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 text-gray-700 focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Account Number */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Account Number
              </label>
              <input
                type="text"
                placeholder="Enter account number"
                value={bankAccount.accountNumber}
                onChange={(e) =>
                  setBankAccount({ ...bankAccount, accountNumber: e.target.value })
                }
                className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 text-gray-700 focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Confirm Account Number */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Confirm Account Number
              </label>
              <input
                type="text"
                placeholder="Re-enter account number"
                value={bankAccount.confirmAccountNumber}
                onChange={(e) =>
                  setBankAccount({
                    ...bankAccount,
                    confirmAccountNumber: e.target.value,
                  })
                }
                className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 text-gray-700 focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* IFSC Code */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                IFSC Code
              </label>
              <input
                type="text"
                placeholder="e.g., HDFC0000001"
                value={bankAccount.ifscCode}
                onChange={(e) =>
                  setBankAccount({ ...bankAccount, ifscCode: e.target.value })
                }
                className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 text-gray-700 focus:outline-none focus:border-blue-500 uppercase"
              />
            </div>
          </div>
        </div>

        <button
          onClick={() => validateBankAccount() && setStep(2)}
          className="w-full py-3 md:py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-all text-base md:text-lg shadow-lg hover:shadow-xl"
        >
          Next: Enter UPI ID
        </button>
        </div>
      </div>
      {/* Sell notification modal */}
      <SellNotificationModal
        open={showSellNotification}
        title={pendingSellNotification?.title}
        message={pendingSellNotification?.message}
        buttonText={pendingSellNotification?.buttonText}
        redirectUrl={pendingSellNotification?.redirectUrl}
        onPrimary={handleSellPrimary}
        onCancel={handleSellCancel}
      />
      </>
    );
  }

  // ===== STEP 2: UPI =====
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
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">UPI ID</h1>
        </div>

        <div className="mb-6 p-4 border-2 border-green-300 rounded-lg bg-green-50">
          <h2 className="font-semibold text-gray-800 mb-3">📱 Step 2: UPI ID</h2>
          <p className="text-xs text-gray-600 mb-4">
            Enter UPI ID where you want to receive payment
          </p>

          <input
            type="text"
            placeholder="e.g., yourname@paytm or yourname@googleplay"
            value={upiId}
            onChange={(e) => setUpiId(e.target.value)}
            className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 text-gray-700 focus:outline-none focus:border-green-500"
          />

          {upiId && (
            <div className="mt-4 p-3 bg-white border border-green-300 rounded-lg">
              <p className="text-xs text-gray-600 mb-1">UPI Confirmation:</p>
              <p className="text-sm font-mono text-gray-900">{upiId}</p>
            </div>
          )}
        </div>

        {/* Bank Summary */}
        <div className="mb-6 p-4 bg-gray-100 border border-gray-300 rounded-lg">
          <p className="text-xs text-gray-600 mb-2">Bank Account:</p>
          <p className="text-sm font-medium text-gray-900">
            {bankAccount.accountHolderName} • {bankAccount.bankName}
          </p>
          <p className="text-xs text-gray-600 mt-1">
            {bankAccount.accountNumber.slice(-4).padStart(bankAccount.accountNumber.length, "*")}
          </p>
        </div>

        <button
          onClick={() => validateUpi() && setStep(3)}
          disabled={!upiId.trim()}
          className="w-full py-3 md:py-4 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-xl font-semibold transition-all text-base md:text-lg shadow-lg hover:shadow-xl"
        >
          Next: Enter USDT Amount
        </button>
        </div>
      </div>
    );
  }

  // ===== STEP 3: USDT AMOUNT & NETWORK =====
  if (step === 3) {
    return (
      <div className="p-4 md:p-6 lg:p-8 min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => setStep(2)}
            className="text-gray-600 hover:text-gray-800 p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-800">USDT Amount & Network</h1>
        </div>

        {/* USDT Amount */}
        <div className="mb-6 p-4 border-2 border-purple-300 rounded-lg bg-purple-50">
          <h2 className="font-semibold text-gray-800 mb-3">💜 How Much USDT to Sell?</h2>
          <input
            type="number"
            min="1"
            step="0.01"
            placeholder="Enter USDT amount"
            value={usdtAmount}
            onChange={(e) => setUsdtAmount(e.target.value)}
            className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 text-gray-700 focus:outline-none focus:border-purple-500 text-lg"
          />
          {usdtAmount && Number(usdtAmount) > 0 && (
            <div className="mt-4 space-y-3">
              {/* USDT Amount Display */}
              <div className="p-3 bg-purple-100 border border-purple-300 rounded-lg">
                <p className="text-xs text-gray-700">USDT to Sell:</p>
                <p className="text-2xl font-bold text-purple-700">{Number(usdtAmount).toFixed(2)} USDT</p>
              </div>
            </div>
          )}
        </div>

        {/* Network Selection */}
        {usdtAmount && Number(usdtAmount) > 0 && (
          <div className="mb-6 p-4 border-2 border-blue-300 rounded-lg bg-blue-50">
            <h2 className="font-semibold text-gray-800 mb-3">
              📡 Select Network to Send From
            </h2>
            <p className="text-xs text-gray-600 mb-3">
              Which network will you send USDT from?
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {Object.entries(networks).map(([key, data]) => (
                <div
                  key={key}
                  onClick={() => setSelectedNetwork(key)}
                  className={`p-4 md:p-5 border-2 rounded-xl cursor-pointer transition-all hover:shadow-md ${
                    selectedNetwork === key
                      ? "border-blue-600 bg-blue-100 shadow-md"
                      : "border-gray-300 hover:border-blue-300"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-gray-900">
                        {data.icon} {data.network}
                      </p>
                      <p className="text-xs text-gray-600 mt-1">{data.description}</p>
                    </div>
                    {selectedNetwork === key && <CheckCircle className="text-blue-600" size={24} />}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <button
          onClick={() => setStep(4)}
          disabled={!usdtAmount || Number(usdtAmount) <= 0}
          className="w-full py-3 md:py-4 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white rounded-xl font-semibold transition-all text-base md:text-lg shadow-lg hover:shadow-xl"
        >
          Next: Admin Scanners
        </button>
        </div>
      </div>
    );
  }

  // ===== STEP 4: ADMIN SCANNERS =====
  if (step === 4) {
    return (
      <div className="p-4 md:p-6 lg:p-8 min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => setStep(3)}
            className="text-gray-600 hover:text-gray-800 p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Admin Scanners</h1>
        </div>

        {/* Summary */}
        <div className="mb-6 p-4 bg-gray-100 border border-gray-300 rounded-lg">
          <p className="text-xs text-gray-600 mb-2">Selling Amount:</p>
          <p className="text-xl font-bold text-gray-900">{usdtAmount} USDT</p>
          <p className="text-xs text-gray-600 mt-2 mb-1">Network:</p>
          <p className="font-medium text-gray-900">
            {networks[selectedNetwork].icon} {networks[selectedNetwork].network}
          </p>
        </div>

        {/* Admin QR Code for this Network */}
        <div className="mb-6 p-4 border-2 border-red-300 rounded-lg bg-red-50">
          <h2 className="font-semibold text-gray-800 mb-3">📱 Send USDT to Admin</h2>
          <p className="text-xs text-gray-600 mb-4">
            Scan this QR or send {usdtAmount} USDT to the address below on {networks[selectedNetwork].network}
          </p>

          {networkQrCode ? (
            <div className="p-4 bg-white rounded-lg text-center">
              {/* QR Code */}
              {networkQrCode.imageUrl && (
                <div className="mb-4">
                  <img
                    src={
                      networkQrCode.imageUrl.startsWith("http")
                        ? networkQrCode.imageUrl
                        : `${BASE_URL}${networkQrCode.imageUrl}`
                    }
                    alt={networkQrCode.network}
                    className="w-48 h-48 md:w-64 md:h-64 object-contain mx-auto"
                  />
                </div>
              )}
              
              {/* Admin Wallet Address */}
              {networkQrCode.address && (
                <div className="mb-3 p-3 bg-gray-100 rounded-lg">
                  <p className="text-xs text-gray-600 mb-2">Admin's {networks[selectedNetwork].network} Address:</p>
                  <p className="text-xs font-mono text-gray-900 break-all font-bold">
                    {networkQrCode.address}
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(networkQrCode.address);
                      toast.success("✅ Address copied!");
                    }}
                    className="mt-2 px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
                  >
                    Copy Address
                  </button>
                </div>
              )}
            </div>
          ) : (
            <p className="text-center py-4 text-red-500">
              ❌ QR code for {networks[selectedNetwork].network} not available
            </p>
          )}
        </div>

        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-300 rounded-lg">
          <p className="text-xs text-gray-700">
            <span className="font-semibold">ℹ️ Note:</span> Scan this QR or send the exact amount to admin address. Admin will verify and proceed to next step for transaction details.
          </p>
        </div>

        <button
          onClick={() => setStep(5)}
          className="w-full py-3 md:py-4 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold transition-all text-base md:text-lg shadow-lg hover:shadow-xl"
        >
          Next: Enter Transaction Details
        </button>
        </div>
      </div>
    );
  }

  // ===== STEP 5: CONFIRMATION =====
  if (step === 5) {
    return (
      <div className="p-4 md:p-6 lg:p-8 min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => setStep(4)}
            className="text-gray-600 hover:text-gray-800 p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Confirm Transaction</h1>
        </div>

        {/* Order Summary */}
        <div className="mb-6 p-4 bg-blue-50 border-2 border-blue-300 rounded-lg space-y-3">
          <div>
            <p className="text-xs text-gray-600">USDT Amount:</p>
            <p className="text-2xl font-bold text-blue-600">{usdtAmount} USDT</p>
          </div>

          <div>
            <p className="text-xs text-gray-600">Network:</p>
            <p className="font-medium text-gray-900">
              {networks[selectedNetwork].icon} {networks[selectedNetwork].network}
            </p>
          </div>

          <div>
            <p className="text-xs text-gray-600">Receiving INR at:</p>
            <p className="font-medium text-gray-900">{upiId}</p>
          </div>

          <div>
            <p className="text-xs text-gray-600">Bank:</p>
            <p className="text-sm text-gray-900">
              {bankAccount.accountHolderName} • {bankAccount.bankName}
            </p>
          </div>
        </div>

        {/* Transaction Hash Input */}
        <div className="mb-6 p-4 border-2 border-green-300 rounded-lg bg-green-50">
          <h2 className="font-semibold text-gray-800 mb-3">✅ Transaction Details</h2>
          <p className="text-xs text-gray-600 mb-3">
            Admin enters transaction hash/address after scanning your USDT
          </p>

          <div className="mb-3">
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Transaction Hash / Address
            </label>
            <input
              type="text"
              placeholder="Enter transaction hash or address provided by admin"
              value={transactionHash}
              onChange={(e) => setTransactionHash(e.target.value)}
              className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 text-gray-700 focus:outline-none focus:border-green-500 font-mono text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Admin's Wallet Address (Optional)
            </label>
            <input
              type="text"
              placeholder="Enter admin's wallet address for records"
              value={adminAddress}
              onChange={(e) => setAdminAddress(e.target.value)}
              className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 text-gray-700 focus:outline-none focus:border-green-500 font-mono text-xs"
            />
          </div>
        </div>

        <button
          onClick={handleSubmitSell}
          disabled={submitting || !transactionHash.trim() || isSellRestricted}
          className="w-full py-3 md:py-4 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-xl font-semibold transition-all text-base md:text-lg shadow-lg hover:shadow-xl mb-3"
        >
          {submitting ? "Processing..." : "✅ Confirm & Submit"}
        </button>

        <div className="p-4 md:p-6 bg-yellow-50 border border-yellow-300 rounded-xl shadow-sm">
          <p className="text-xs md:text-sm text-gray-700">
            <span className="font-semibold">📋 Checklist before submitting:</span>
          </p>
          <ul className="text-xs md:text-sm text-gray-600 mt-2 space-y-1">
            <li>✓ Send {usdtAmount} USDT from your wallet to admin address</li>
            <li>✓ Copy transaction hash from blockchain explorer</li>
            <li>✓ Paste transaction hash above</li>
            <li>✓ Admin will verify and send ₹ to your UPI</li>
          </ul>
        </div>
        </div>
      </div>
    );
  }
}
