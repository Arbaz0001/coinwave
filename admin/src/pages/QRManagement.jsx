import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import upload from "../services/api";

const QRManagement = () => {
  const [upiQRs, setUpiQRs] = useState([]);
  const [cryptoQRs, setCryptoQRs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("upi"); // upi or crypto
  const [showUploadForm, setShowUploadForm] = useState(false);

  // UPI Upload
  const [upiTitle, setUpiTitle] = useState("UPI QR Code");
  const [upiImage, setUpiImage] = useState(null);
  const [uploading, setUploading] = useState(false);

  // Crypto Upload
  const [cryptoTitle, setCryptoTitle] = useState("");
  const [cryptoNetwork, setCryptoNetwork] = useState("trc20");
  const [cryptoType, setCryptoType] = useState("usdt");
  const [walletAddress, setWalletAddress] = useState("");
  const [cryptoImage, setCryptoImage] = useState(null);

  const API_BASE = import.meta.env.VITE_API_URL.replace(/\/$/, "") + "/api";
  const BASE_URL = import.meta.env.VITE_API_URL.replace(/\/$/, "");

  // ✅ Fetch all QRs
  useEffect(() => {
    fetchQRs();
  }, []);

  const fetchQRs = async () => {
    setLoading(true);
    try {
      const [upiRes, cryptoRes] = await Promise.all([
        axios.get(`${API_BASE}/admin/qr-codes`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("adminToken")}` },
        }),
        axios.get(`${API_BASE}/admin/crypto-qr-codes`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("adminToken")}` },
        }),
      ]);

      if (upiRes.data?.success) setUpiQRs(upiRes.data.data || []);
      if (cryptoRes.data?.success) setCryptoQRs(cryptoRes.data.data || []);

      console.log("✅ QRs loaded:", {
        upi: upiRes.data.count,
        crypto: cryptoRes.data.count,
      });
    } catch (error) {
      console.error("❌ Error fetching QRs:", error);
      toast.error("Failed to load QRs");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Upload UPI QR
  const handleUPIUpload = async (e) => {
    e.preventDefault();

    if (!upiImage) {
      toast.error("❌ Please select an image");
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("image", upiImage);
      formData.append("title", upiTitle);

      const response = await axios.post(`${API_BASE}/qrcode/qr`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
        },
      });

      if (response.data?.success) {
        toast.success("✅ UPI QR uploaded successfully!");
        setUpiImage(null);
        setUpiTitle("UPI QR Code");
        setShowUploadForm(false);
        fetchQRs();
      }
    } catch (error) {
      console.error("❌ Upload error:", error);
      toast.error(error.response?.data?.message || "Failed to upload QR");
    } finally {
      setUploading(false);
    }
  };

  // ✅ Upload Crypto QR
  const handleCryptoUpload = async (e) => {
    e.preventDefault();

    if (!cryptoImage || !cryptoTitle || !walletAddress) {
      toast.error("❌ Please fill all fields and select an image");
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("image", cryptoImage);
      formData.append("title", cryptoTitle);
      formData.append("cryptoType", cryptoType);
      formData.append("network", cryptoNetwork);
      formData.append("address", walletAddress);

      const response = await axios.post(
        `${API_BASE}/crypto-qrcode/upload`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
          },
        }
      );

      if (response.data?.success) {
        toast.success("✅ Crypto QR uploaded successfully!");
        setCryptoImage(null);
        setCryptoTitle("");
        setWalletAddress("");
        setCryptoNetwork("trc20");
        setCryptoType("usdt");
        setShowUploadForm(false);
        fetchQRs();
      }
    } catch (error) {
      console.error("❌ Upload error:", error);
      toast.error(error.response?.data?.message || "Failed to upload QR");
    } finally {
      setUploading(false);
    }
  };

  // ✅ Delete QR
  const handleDeleteQR = async (qrId, isCC = false) => {
    if (!window.confirm("Are you sure you want to delete this QR?")) return;

    try {
      const endpoint = isCC
        ? `${API_BASE}/admin/crypto-qr-codes/${qrId}`
        : `${API_BASE}/admin/qr-codes/${qrId}`;

      const response = await axios.delete(endpoint, {
        headers: { Authorization: `Bearer ${localStorage.getItem("adminToken")}` },
      });

      if (response.data?.success) {
        toast.success("✅ QR deleted successfully!");
        fetchQRs();
      }
    } catch (error) {
      console.error("❌ Delete error:", error);
      toast.error("Failed to delete QR");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">QR Code Management</h1>
            <p className="text-gray-600">Manage UPI and Crypto QR codes</p>
          </div>
          <button
            onClick={() => setShowUploadForm(!showUploadForm)}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            {showUploadForm ? "Cancel" : "Upload New QR"}
          </button>
        </div>

        {/* Upload Form */}
        {showUploadForm && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            {/* Tab Selection */}
            <div className="flex gap-4 mb-6 border-b">
              <button
                onClick={() => setActiveTab("upi")}
                className={`pb-3 font-semibold transition ${
                  activeTab === "upi"
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                💳 Upload UPI QR
              </button>
              <button
                onClick={() => setActiveTab("crypto")}
                className={`pb-3 font-semibold transition ${
                  activeTab === "crypto"
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                ₿ Upload Crypto QR
              </button>
            </div>

            {/* UPI Upload Form */}
            {activeTab === "upi" && (
              <form onSubmit={handleUPIUpload} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    QR Title
                  </label>
                  <input
                    type="text"
                    value={upiTitle}
                    onChange={(e) => setUpiTitle(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Upload QR Image
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setUpiImage(e.target.files?.[0])}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                  {upiImage && (
                    <p className="text-sm text-gray-500 mt-2">File: {upiImage.name}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={uploading || !upiImage}
                  className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50"
                >
                  {uploading ? "Uploading..." : "Upload UPI QR"}
                </button>
              </form>
            )}

            {/* Crypto Upload Form */}
            {activeTab === "crypto" && (
              <form onSubmit={handleCryptoUpload} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Crypto Type
                  </label>
                  <select
                    value={cryptoType}
                    onChange={(e) => setCryptoType(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="usdt">USDT</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Blockchain Network
                  </label>
                  <select
                    value={cryptoNetwork}
                    onChange={(e) => setCryptoNetwork(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="trc20">TRC20 (Tron)</option>
                    <option value="erc20">ERC20 (Ethereum)</option>
                    <option value="bep20">BEP20 (Binance)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    QR Title
                  </label>
                  <input
                    type="text"
                    value={cryptoTitle}
                    onChange={(e) => setCryptoTitle(e.target.value)}
                    placeholder="e.g., USDT BEP20"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Wallet Address
                  </label>
                  <input
                    type="text"
                    value={walletAddress}
                    onChange={(e) => setWalletAddress(e.target.value)}
                    placeholder="0x... or TQD... or 0x..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-mono text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Upload QR Image
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setCryptoImage(e.target.files?.[0])}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                  {cryptoImage && (
                    <p className="text-sm text-gray-500 mt-2">
                      File: {cryptoImage.name}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={uploading || !cryptoImage || !walletAddress}
                  className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50"
                >
                  {uploading ? "Uploading..." : "Upload Crypto QR"}
                </button>
              </form>
            )}
          </div>
        )}

        {/* UPI QRs */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">💳 UPI QR Codes</h2>

          {loading ? (
            <div className="text-center text-gray-500">Loading...</div>
          ) : upiQRs.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-8 text-center text-gray-500">
              No UPI QR codes uploaded yet
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {upiQRs.map((qr) => (
                <div key={qr._id} className="bg-white rounded-lg shadow-sm p-6">
                  <div className="mb-4">
                    <img
                      src={
                        qr.imageUrl.startsWith("http")
                          ? qr.imageUrl
                          : `${BASE_URL}${qr.imageUrl}`
                      }
                      alt={qr.title}
                      className="w-full h-48 object-contain rounded-lg border"
                    />
                  </div>

                  <h3 className="font-semibold text-gray-900 mb-2">{qr.title}</h3>
                  <p className="text-sm text-gray-500 mb-4">
                    Created: {new Date(qr.createdAt).toLocaleDateString("en-IN")}
                  </p>

                  <button
                    onClick={() => handleDeleteQR(qr._id)}
                    className="w-full bg-red-100 text-red-700 py-2 rounded-lg font-medium hover:bg-red-200 transition"
                  >
                    Delete QR
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Crypto QRs */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">₿ Crypto QR Codes</h2>

          {loading ? (
            <div className="text-center text-gray-500">Loading...</div>
          ) : cryptoQRs.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-8 text-center text-gray-500">
              No Crypto QR codes uploaded yet
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {cryptoQRs.map((qr) => (
                <div key={qr._id} className="bg-white rounded-lg shadow-sm p-6">
                  <div className="mb-4">
                    <img
                      src={
                        qr.imageUrl.startsWith("http")
                          ? qr.imageUrl
                          : `${BASE_URL}${qr.imageUrl}`
                      }
                      alt={qr.title}
                      className="w-full h-48 object-contain rounded-lg border"
                    />
                  </div>

                  <h3 className="font-semibold text-gray-900 mb-2">{qr.title}</h3>

                  <div className="text-sm text-gray-600 mb-4 space-y-1">
                    <p>
                      <strong>Network:</strong> {qr.network?.toUpperCase()}
                    </p>
                    <p>
                      <strong>Type:</strong> {qr.cryptoType?.toUpperCase()}
                    </p>
                  </div>

                  <div className="bg-gray-50 p-2 rounded mb-4 break-all">
                    <p className="text-xs text-gray-500 mb-1">Address:</p>
                    <p className="text-xs font-mono text-gray-900">{qr.address}</p>
                  </div>

                  <p className="text-sm text-gray-500 mb-4">
                    Created: {new Date(qr.createdAt).toLocaleDateString("en-IN")}
                  </p>

                  <button
                    onClick={() => handleDeleteQR(qr._id, true)}
                    className="w-full bg-red-100 text-red-700 py-2 rounded-lg font-medium hover:bg-red-200 transition"
                  >
                    Delete QR
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QRManagement;
