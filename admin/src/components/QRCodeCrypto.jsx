import { UploadCloudIcon, FileIcon, XIcon, Trash2Icon } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { API_CONFIG } from "../config/api.config";

const API_BASE = API_CONFIG.API_BASE;
const BASE_URL = API_CONFIG.BASE_URL;

const QRCodeCrypto = () => {
  const [qrImage, setQrImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [qrCodes, setQrCodes] = useState([]);
  const [network, setNetwork] = useState("trc20");
  const [cryptoType, setCryptoType] = useState("usdt");
  const [address, setAddress] = useState("");
  const inputRef = useRef(null);

  // ✅ Fetch all existing crypto QR codes
  const fetchQrCodes = async () => {
    try {
      const res = await fetch(`${API_BASE}/crypto-qrcode/all`);
      const data = await res.json();

      if (data.success) {
        setQrCodes(data.data);
      } else {
        console.error("❌ Failed to load crypto QRs:", data.message);
      }
    } catch (err) {
      console.error("❌ Fetch error:", err);
    }
  };

  useEffect(() => {
    fetchQrCodes();
  }, []);

  // ✅ Drag & Drop
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      setQrImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  // ✅ File input change
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setQrImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  // ✅ Remove selected image
  const handleRemoveImage = () => {
    setQrImage(null);
    setPreview(null);
    if (inputRef.current) inputRef.current.value = null;
  };

  // ✅ Delete QR
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this Crypto QR code?"))
      return;

    try {
      const res = await fetch(`${API_BASE}/crypto-qrcode/delete/${id}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (data.success) {
        toast.success("🗑️ QR deleted successfully!");
        fetchQrCodes();
      } else {
        toast.error(data.message || "Failed to delete QR");
      }
    } catch (err) {
      toast.error("❌ Network error while deleting QR");
    }
  };

  // ✅ Submit form (upload)
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!qrImage) {
      toast.warn("Please select a QR Code image");
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("image", qrImage); // ✅ backend expects 'image'
      formData.append("title", `${cryptoType.toUpperCase()} ${network.toUpperCase()}`);
      formData.append("network", network);
      formData.append("cryptoType", cryptoType);
        formData.append("address", address);

      const res = await fetch(`${API_BASE}/crypto-qrcode/upload`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Upload failed");
      }

      toast.success("✅ Crypto QR uploaded successfully!");
      handleRemoveImage();
      fetchQrCodes();
    } catch (error) {
      console.error("❌ Upload error:", error);
      toast.error("❌ Error: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // 🧩 UI
  return (
    <div className="min-h-screen flex flex-col w-full p-8 items-center">
      {/* Upload Form */}
      <h2 className="text-2xl font-bold mb-4 w-full text-white text-left">
        📋 Upload Crypto QR Code
      </h2>

      <form
        onSubmit={handleSubmit}
        className="bg-gray-800 p-6 rounded-2xl shadow-lg w-full max-w-md mb-8"
      >
        {/* Select Crypto Type */}
        <div className="mb-4">
          <label className="block text-white font-medium mb-2">
            Select Crypto Type
          </label>
          <div className="flex gap-3">
            {["usdt"].map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setCryptoType(type)}
                className={`px-4 py-2 rounded-md ${
                  cryptoType === type ? "bg-blue-600 text-white" : "bg-gray-700 text-gray-300"
                }`}
              >
                {type.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Select Network */}
        <div className="mb-4">
          <label className="block text-white font-medium mb-2">
            Select Network
          </label>
          <div className="flex gap-3">
            {["trc20", "erc20", "bep20"].map((net) => (
              <button
                key={net}
                type="button"
                onClick={() => setNetwork(net)}
                className={`px-4 py-2 rounded-md ${
                  network === net ? "bg-green-600 text-white" : "bg-gray-700 text-gray-300"
                }`}
              >
                {net.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Address Input */}
        <div className="mb-4">
          <label className="block text-white font-medium mb-2">Wallet Address</label>
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder={`Enter ${cryptoType.toUpperCase()} ${network.toUpperCase()} address`}
            className="w-full p-2 rounded border border-gray-600 bg-gray-700 text-white"
          />
        </div>

        {/* Drag & Drop Upload Box */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-lg p-6 mb-4 cursor-pointer transition ${
            isDragging ? "border-blue-500 bg-gray-700" : "border-gray-600"
          }`}
          onClick={() => inputRef.current.click()}
        >
          {!qrImage ? (
            <div className="flex flex-col items-center justify-center h-32">
              <UploadCloudIcon className="w-10 h-10 text-gray-400 mb-2" />
              <span className="text-gray-400">
                Drag & drop or click to upload QR Code
              </span>
              <span className="text-xs text-gray-500 mt-1">Max size: 10 MB</span>
            </div>
          ) : (
            <div className="flex items-center justify-between bg-gray-700 px-3 py-2 rounded-lg">
              <div className="flex items-center gap-2">
                <FileIcon className="w-6 h-6 text-blue-400" />
                <p className="text-sm text-white">{qrImage.name}</p>
              </div>
              <button
                type="button"
                onClick={handleRemoveImage}
                className="text-red-400 hover:text-red-600"
              >
                <XIcon className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>

        {/* Hidden Input */}
        <input
          type="file"
          accept="image/*"
          ref={inputRef}
          onChange={handleFileChange}
          className="hidden"
        />

        {/* Preview */}
        {preview && (
          <div className="mb-4 flex justify-center">
            <img
              src={preview}
              alt="Crypto QR Preview"
              className="w-40 h-40 object-contain rounded-lg border border-gray-600"
            />
          </div>
        )}

        {/* Save Button */}
        <button
          type="submit"
          disabled={loading}
          className={`w-full ${
            loading ? "bg-gray-500" : "bg-blue-600 hover:bg-blue-700"
          } text-white font-semibold py-2 rounded-lg`}
        >
          {loading ? "Uploading..." : "Save QR Code"}
        </button>
      </form>

      {/* Uploaded QR Codes */}
      <div className="w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4 text-white">📋 Uploaded Crypto QR Codes</h2>
        <div className="space-y-4">
          {qrCodes.length > 0 ? (
            qrCodes.map((qr) => (
              <div
                key={qr._id}
                className="bg-gray-800 p-3 rounded-lg flex flex-col items-center"
              >
                <img
                  src={
                    qr.imageUrl.startsWith("http")
                      ? qr.imageUrl
                      : `${BASE_URL}${qr.imageUrl}`
                  }
                  alt={qr.title}
                  className="w-auto object-contain mb-2"
                />
                <p className="text-white mb-2">{qr.title}</p>
                {qr.address && (
                  <p className="text-gray-300 text-sm mb-2">Address: {qr.address}</p>
                )}
                <button
                  onClick={() => handleDelete(qr._id)}
                  className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-xs flex items-center gap-1"
                >
                  <Trash2Icon className="w-4 h-4" /> Delete
                </button>
              </div>
            ))
          ) : (
            <p className="text-gray-400 text-center">No Crypto QR Codes uploaded yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default QRCodeCrypto;
