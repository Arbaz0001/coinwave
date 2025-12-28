import axios from "axios";
import { ListCollapse } from "lucide-react";
import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";

const Withdrawals = () => {
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterMethod, setFilterMethod] = useState(""); // INR, USDT, ETH, or all

  // ✅ Fetch all withdrawals (INR + Crypto)
  const fetchWithdrawals = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/withdraws/all`);
      if (res.data.success) {
        setWithdrawals(res.data.data);
      } else {
        toast.error("Failed to fetch withdrawals");
      }
    } catch (error) {
      console.error("Error fetching withdrawals:", error);
      toast.error("Error fetching data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWithdrawals();
  }, []);

  // ✅ Approve / Reject Withdrawal
  const updateStatus = async (id, status) => {
    try {
      const res = await axios.put(
        `${import.meta.env.VITE_API_URL}/withdraws/update/${id}`,
        { status }
      );

      if (res.data.success) {
        toast.success(`Withdrawal ${status} successfully`);
        fetchWithdrawals();
      } else {
        toast.error(res.data.message || "Failed to update status");
      }
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Server error updating withdrawal");
    }
  };

  // ✅ Toggle details visibility
  const toggleDetails = (index) => {
    setWithdrawals((prev) =>
      prev.map((w, i) =>
        i === index ? { ...w, showDetails: !w.showDetails } : w
      )
    );
  };

  // ✅ Filter by method
  const filtered = filterMethod
    ? withdrawals.filter(
        (w) => w.method.toLowerCase() === filterMethod.toLowerCase()
      )
    : withdrawals;

  return (
    <div className="md:min-w-4xl w-auto mx-auto px-4 py-10">
      <h2 className="text-2xl font-bold text-center mb-6 text-gray-200">
        Withdrawal Requests (Admin)
      </h2>

      {/* 🔹 Filter buttons */}
      <div className="mb-6 flex justify-center gap-4">
        {["INR", "USDT", "ETH"].map((method) => (
          <button
            key={method}
            onClick={() =>
              setFilterMethod((prev) => (prev === method ? "" : method))
            }
            className={`px-4 py-2 rounded-md border ${
              filterMethod === method
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
            }`}
          >
            {method}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center text-xl text-gray-400">Loading...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center text-gray-400 py-10">
          No withdrawal requests found.
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((w, index) => (
            <div
              key={w._id}
              className="bg-white shadow-md rounded-lg overflow-hidden"
            >
              {/* Summary Row */}
              <div className="p-4 border-b flex justify-between items-center flex-wrap gap-4">
                <div className="flex flex-col md:flex-row gap-4">
                  <p>
                    <strong>User:</strong> {w.userId?.fullName || "Unknown"}
                  </p>
                  <p>
                    <strong>Method:</strong> {w.method}
                  </p>
                  <p>
                    <strong>Amount:</strong> ₹{w.amount}
                  </p>
                  <p>
                    <strong>Status:</strong>{" "}
                    <span
                      className={`${
                        w.status === "approved"
                          ? "text-green-600"
                          : w.status === "rejected"
                          ? "text-red-600"
                          : "text-yellow-600"
                      } font-semibold`}
                    >
                      {w.status}
                    </span>
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  {/* Approve/Reject buttons */}
                  {w.status === "pending" && (
                    <>
                      <button
                        onClick={() => updateStatus(w._id, "approved")}
                        className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-md"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => updateStatus(w._id, "rejected")}
                        className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md"
                      >
                        Reject
                      </button>
                    </>
                  )}

                  {/* Toggle details */}
                  <button
                    onClick={() => toggleDetails(index)}
                    className="text-blue-600 hover:underline"
                  >
                    <ListCollapse />
                  </button>
                </div>
              </div>

              {/* 🔹 Details Section */}
              {w.showDetails && (
                <div className="p-4 bg-gray-50">
                  <h4 className="font-semibold mb-2">Details</h4>
                  <ul className="list-disc pl-6 space-y-1 text-sm">
                    {Object.entries(w.details || {}).map(([key, val]) => (
                      <li key={key}>
                        <strong>{key}:</strong> {val?.toString() || "N/A"}
                      </li>
                    ))}
                  </ul>
                  {w.remarks && (
                    <p className="mt-2 text-gray-600">
                      <strong>Remarks:</strong> {w.remarks}
                    </p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Withdrawals;
