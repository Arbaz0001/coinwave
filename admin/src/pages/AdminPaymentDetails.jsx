import React, { useEffect, useState } from "react";
import { fetchAdminPaymentDetails, saveAdminPaymentDetails } from "../services/investmentService";
import { API_CONFIG } from "../config/api.config";

export default function AdminPaymentDetails() {
  const [bankAccountDetails, setBankAccountDetails] = useState("");
  const [upiId, setUpiId] = useState("");
  const [qrCodeFile, setQrCodeFile] = useState(null);
  const [qrCodeImage, setQrCodeImage] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const qrImageUrl = qrCodeImage
    ? `${qrCodeImage.startsWith("http") ? "" : API_CONFIG.BASE_URL}${qrCodeImage}`
    : "";

  const loadPaymentDetails = async () => {
    try {
      const response = await fetchAdminPaymentDetails();
      const details = response?.data;
      if (details) {
        setBankAccountDetails(details.bankAccountDetails || "");
        setUpiId(details.upiId || "");
        setQrCodeImage(details.qrCodeImage || "");
      }
    } catch {
      // keep silent state for first-time setup
    }
  };

  useEffect(() => {
    loadPaymentDetails();
  }, []);

  const onSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    try {
      const response = await saveAdminPaymentDetails({
        bankAccountDetails,
        upiId,
        qrCodeFile,
      });

      if (!response?.success) {
        throw new Error(response?.message || "Failed to save payment details");
      }

      setMessage("Payment details saved successfully");
      setQrCodeFile(null);
      loadPaymentDetails();
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || "Failed to save payment details");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Admin Payment Details</h2>

      {message && <p className="mb-3 text-green-600 font-medium">{message}</p>}
      {error && <p className="mb-3 text-red-600 font-medium">{error}</p>}

      <form onSubmit={onSubmit} className="space-y-4 bg-white p-4 rounded-lg border">
        <textarea
          className="w-full border rounded-md p-2"
          rows={4}
          placeholder="Bank account details"
          value={bankAccountDetails}
          onChange={(event) => setBankAccountDetails(event.target.value)}
          required
        />

        <input
          className="w-full border rounded-md p-2"
          type="text"
          placeholder="UPI ID"
          value={upiId}
          onChange={(event) => setUpiId(event.target.value)}
          required
        />

        <input
          className="w-full border rounded-md p-2"
          type="file"
          accept="image/*"
          onChange={(event) => setQrCodeFile(event.target.files?.[0] || null)}
          required={!qrCodeImage}
        />

        {qrImageUrl && (
          <img
            src={qrImageUrl}
            alt="QR Code"
            className="w-40 h-40 object-cover border rounded-md"
          />
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-semibold py-2 rounded-md"
        >
          {loading ? "Saving..." : "Save Payment Details"}
        </button>
      </form>
    </div>
  );
}
