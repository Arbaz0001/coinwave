import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { fetchPaymentDetails, submitPackPurchase } from "../services/investmentService";
import { API_CONFIG } from "../config/api.config";

export default function BuyPackModal({ open, onClose, pack, onSuccess }) {
  const safePack = pack || {};
  const [paymentDetails, setPaymentDetails] = useState(null);
  const [amountPaid, setAmountPaid] = useState(safePack.amount || "");
  const [paymentScreenshot, setPaymentScreenshot] = useState(null);
  const [loading, setLoading] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;

    setAmountPaid(safePack.amount || "");
    setPaymentScreenshot(null);
    setError("");

    const loadPaymentDetails = async () => {
      try {
        setDetailsLoading(true);
        const response = await fetchPaymentDetails();
        setPaymentDetails(response?.data || null);
      } catch {
        setPaymentDetails(null);
      } finally {
        setDetailsLoading(false);
      }
    };

    loadPaymentDetails();
  }, [open, safePack.amount]);

  if (!open || !pack) return null;

  const hasCompletePaymentDetails =
    Boolean(paymentDetails?.bankAccountDetails?.trim()) &&
    Boolean(paymentDetails?.upiId?.trim()) &&
    Boolean(paymentDetails?.qrCodeImage);

  const qrCodeUrl = paymentDetails?.qrCodeImage
    ? `${paymentDetails.qrCodeImage.startsWith("http") ? "" : API_CONFIG.BASE_URL}${paymentDetails.qrCodeImage}`
    : "";

  const onSubmit = async (event) => {
    event.preventDefault();

    if (!hasCompletePaymentDetails) {
      setError("Admin payment details are not available right now. Please try later.");
      return;
    }

    if (!paymentScreenshot) {
      setError("Please upload payment screenshot");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await submitPackPurchase({
        packId: safePack._id,
        amountPaid,
        paymentScreenshot,
      });

      if (!response?.success) {
        throw new Error(response?.message || "Failed to submit purchase request");
      }

      onSuccess?.();
      onClose?.();
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || "Failed to submit purchase request");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-white rounded-xl p-4 sm:p-5 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold">Buy {safePack.packName}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">✕</button>
        </div>

        {error && <p className="mb-3 text-red-600 text-sm">{error}</p>}

        <div className="space-y-2 text-sm bg-gray-50 border rounded-lg p-3 mb-4">
          <p><span className="font-semibold">Bank Details:</span> {paymentDetails?.bankAccountDetails || "Not available"}</p>
          <p><span className="font-semibold">UPI ID:</span> {paymentDetails?.upiId || "Not available"}</p>
          {qrCodeUrl && (
            <img
              src={qrCodeUrl}
              alt="QR Code"
              className="w-36 h-36 rounded-md border object-cover"
            />
          )}
          {!detailsLoading && !hasCompletePaymentDetails && (
            <p className="text-xs text-red-600">Payment details are incomplete. Please contact admin.</p>
          )}
        </div>

        <form className="space-y-3" onSubmit={onSubmit}>
          <input
            type="number"
            className="w-full border rounded-md p-2"
            value={amountPaid}
            onChange={(event) => setAmountPaid(event.target.value)}
            placeholder="Enter paid amount"
            required
          />
          <input
            type="file"
            className="w-full border rounded-md p-2"
            accept="image/*"
            onChange={(event) => setPaymentScreenshot(event.target.files?.[0] || null)}
            required
          />
          <button
            type="submit"
            disabled={loading || detailsLoading || !hasCompletePaymentDetails}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-semibold py-2 rounded-md"
          >
            {loading ? "Submitting..." : detailsLoading ? "Loading payment details..." : "Submit"}
          </button>
        </form>
      </div>
    </div>
  );
}

BuyPackModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func,
  onSuccess: PropTypes.func,
  pack: PropTypes.object,
};

BuyPackModal.defaultProps = {
  onClose: undefined,
  onSuccess: undefined,
  pack: null,
};
