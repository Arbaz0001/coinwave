import { UploadCloudIcon, FileIcon, XIcon, Trash2Icon } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { API_CONFIG } from "../config/api.config";

const API_BASE = API_CONFIG.API_BASE;
const BASE_URL = API_CONFIG.BASE_URL;

const QRCode = () => {
  const [qrImage, setQrImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [qrCodes, setQrCodes] = useState([]);
  const [upiId, setUpiId] = useState("");
  const inputRef = useRef(null);

  // ✅ Fetch existing QR Codes
  const fetchQrCodes = async () => {
    try {
      const res = await fetch(`${API_BASE}/qrcode/qr-codes`);
      const data = await res.json();
      if (data.success) setQrCodes(data.data);
    } catch (err) {
      console.error("Failed to fetch QR Codes:", err);
    }
  };

  useEffect(() => {
    fetchQrCodes();
  }, []);

  // ✅ Drag & drop
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

  // ✅ File selection
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setQrImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  // ✅ Remove image
  const handleRemoveImage = () => {
    setQrImage(null);
    setPreview(null);
    setUpiId("");
    if (inputRef.current) inputRef.current.value = null;
  };

  // ✅ Delete QR Code
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this QR code?")) return;
    try {
      const res = await fetch(`${API_BASE}/qrcode/delete-qr/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("🗑️ QR Code deleted successfully!");
        fetchQrCodes();
      } else {
        toast.error(data.message || "Failed to delete QR Code");
      }
    } catch (err) {
      toast.error("❌ Failed to delete QR Code");
    }
  };

  // ✅ Submit form (upload QR)
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!qrImage) {
      toast.warn("Please select a QR Code image first!");
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("image", qrImage); // ✅ Field name fixed
      formData.append("type", "UPI");
      if (upiId.trim()) {
        formData.append("upiId", upiId.trim());
      }

      const res = await fetch(`${API_BASE}/qrcode/qr`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Upload failed");
      }

      toast.success("✅ QR Code uploaded successfully!");
      handleRemoveImage();
      fetchQrCodes();
    } catch (error) {
      console.error("❌ Upload Error:", error);
      toast.error(error.message || "Error uploading QR Code");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col w-full p-8 items-center bg-gray-900 text-white">
      {/* Upload Form */}
      {qrCodes.length < 1 ? (
        <>
          <h2 className="text-2xl font-bold mb-4 w-full text-left">📋 Add QR Code</h2>
          <form
            onSubmit={handleSubmit}
            className="bg-gray-800 p-6 rounded-2xl shadow-lg w-full max-w-md mb-8"
          >
            {/* Drag & Drop Upload Box */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => inputRef.current.click()}
              className={`border-2 border-dashed rounded-lg p-6 mb-4 cursor-pointer transition ${
                isDragging ? "border-blue-500 bg-gray-700" : "border-gray-600"
              }`}
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
                  alt="QR Code Preview"
                  className="w-40 h-40 object-contain rounded-lg border border-gray-600"
                />
              </div>
            )}

            {/* UPI ID Input */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                UPI ID (Optional)
              </label>
              <input
                type="text"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                placeholder="e.g., username@paytm, 9876543210@upi"
                className="w-full px-4 py-2 bg-gray-700 text-white border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
              <p className="text-xs text-gray-400 mt-1">
                This will be displayed to users along with the QR code
              </p>
            </div>

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
        </>
      ) : (
        <div className="w-full max-w-md">
          <h2 className="text-2xl font-bold mb-4">📋 Uploaded QR Codes</h2>
          <div className="flex flex-col gap-4">
            {qrCodes.map((qr) => (
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
                {qr.upiId && (
                  <div className="w-full mt-3 p-3 bg-gray-700 rounded-lg">
                    <p className="text-xs text-gray-400 mb-1">UPI ID:</p>
                    <p className="text-sm font-mono text-blue-400 break-all">{qr.upiId}</p>
                  </div>
                )}

                <button
                  onClick={() => handleDelete(qr._id)}
                  className="bg-red-600 mt-3 hover:bg-red-700 text-white px-3 py-1 rounded text-xs flex items-center gap-1"
                >
                  <Trash2Icon className="w-4 h-4" /> Delete
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default QRCode;
