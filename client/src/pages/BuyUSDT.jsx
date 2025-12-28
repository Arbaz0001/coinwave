import React, { useState } from "react";
import { User } from "lucide-react"; // profile icon

export default function BuyUSDT() {
  const [showBindForm, setShowBindForm] = useState(false);
  const [showAccountsPage, setShowAccountsPage] = useState(false);
  const [wallets, setWallets] = useState([]);
  const [selectedWallet, setSelectedWallet] = useState(null);
  const [amount, setAmount] = useState("");

  const [formData, setFormData] = useState({
    bankName: "",
    accNo: "",
    ifsc: "",
    accName: "",
    upiId: "",
  });

  // helper: decide type (bank or upi)
  const getWalletType = (wallet) => {
    return wallet.upiId ? "UPI" : "Bank";
  };

  // Buy action
  const handleBuy = () => {
    if (!selectedWallet) {
      alert("Please select or add a payee first!");
      return;
    }
    const parsed = parseFloat(amount);
    if (!parsed || parsed <= 0) {
      alert("Please enter a valid amount!");
      return;
    }

    alert(`Buying ${parsed} USDT using ${getWalletType(selectedWallet)}`);
  };

  // Commit new wallet
  const handleCommit = () => {
    if (!formData.bankName.trim()) {
      alert("Please enter bank name");
      return;
    }
    if (!formData.accNo.trim() && !formData.upiId.trim()) {
      alert("Please enter account number or UPI ID");
      return;
    }

    const newWallet = { ...formData, id: Date.now() };
    setWallets((prev) => [...prev, newWallet]);
    setSelectedWallet(newWallet);
    setFormData({
      bankName: "",
      accNo: "",
      ifsc: "",
      accName: "",
      upiId: "",
    });
    setShowBindForm(false);
  };

  // Delete wallet
  const handleDelete = (id) => {
    const filtered = wallets.filter((w) => w.id !== id);
    setWallets(filtered);
    if (selectedWallet?.id === id) {
      setSelectedWallet(null);
    }
  };

  return (
    <div className="p-4 min-h-screen bg-white">
      {/* ----------------- Accounts Page ----------------- */}
      {showAccountsPage ? (
        <>
          <h1 className="text-xl font-semibold mb-4 text-gray-800">
            My Accounts
          </h1>

          {wallets.length === 0 ? (
            <p className="text-gray-500 mb-4">No accounts added yet.</p>
          ) : (
            <ul className="space-y-3 mb-6">
              {wallets.map((w) => (
                <li
                  key={w.id}
                  className="flex justify-between items-center border p-3 rounded"
                >
                  <span className="text-gray-700 font-medium">
                    {getWalletType(w)}
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setSelectedWallet(w);
                        setShowAccountsPage(false);
                      }}
                      className="px-3 py-1 text-sm bg-green-500 text-white rounded"
                    >
                      Select
                    </button>
                    <button
                      onClick={() => handleDelete(w.id)}
                      className="px-3 py-1 text-sm bg-red-500 text-white rounded"
                    >
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}

          <button
            onClick={() => setShowBindForm(true)}
            className="w-full py-3 border-2 border-dashed border-green-400 text-green-600 rounded-md mb-4"
          >
            + Add new account
          </button>

          <button
            onClick={() => setShowAccountsPage(false)}
            className="w-full py-3 bg-gray-200 rounded-lg text-gray-700"
          >
            Back
          </button>
        </>
      ) : showBindForm ? (
        /* ----------------- Bind Form ----------------- */
        <>
          <h1 className="text-xl font-semibold mb-4 text-gray-800">
            Bind bank card
          </h1>

          <div className="space-y-3">
            <input
              type="text"
              placeholder="Please enter bank name"
              className="w-full border p-2 rounded"
              value={formData.bankName}
              onChange={(e) =>
                setFormData({ ...formData, bankName: e.target.value })
              }
            />
            <input
              type="text"
              placeholder="Please enter account no"
              className="w-full border p-2 rounded"
              value={formData.accNo}
              onChange={(e) =>
                setFormData({ ...formData, accNo: e.target.value })
              }
            />
            <input
              type="text"
              placeholder="Please enter IFSC"
              className="w-full border p-2 rounded"
              value={formData.ifsc}
              onChange={(e) =>
                setFormData({ ...formData, ifsc: e.target.value })
              }
            />
            <input
              type="text"
              placeholder="Please enter payee name"
              className="w-full border p-2 rounded"
              value={formData.accName}
              onChange={(e) =>
                setFormData({ ...formData, accName: e.target.value })
              }
            />
            <input
              type="text"
              placeholder="Please enter UPI ID"
              className="w-full border p-2 rounded"
              value={formData.upiId}
              onChange={(e) =>
                setFormData({ ...formData, upiId: e.target.value })
              }
            />
          </div>

          <div className="flex gap-3 mt-6">
            <button
              onClick={() => {
                setShowBindForm(false);
              }}
              className="flex-1 py-3 border rounded-lg text-gray-700"
            >
              Cancel
            </button>
            <button
              onClick={handleCommit}
              className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
            >
              Commit
            </button>
          </div>
        </>
      ) : (
        /* ----------------- Main Buy Page ----------------- */
        <>
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-xl font-semibold text-gray-800">Buy USDT</h1>
            <button
              onClick={() => setShowAccountsPage(true)}
              className="p-2 text-gray-600"
            >
              <User />
            </button>
          </div>

          {/* Wallet Section */}
          <div className="border rounded-lg p-4 mb-4">
            <h2 className="font-medium text-gray-700 mb-2">Select payee</h2>

            {wallets.length === 0 ? (
              <button
                onClick={() => setShowBindForm(true)}
                className="w-full py-3 border-2 border-dashed border-green-400 text-green-600 rounded-md flex justify-center items-center gap-2"
              >
                + Add wallet address
              </button>
            ) : (
              <select
                className="w-full border rounded px-3 py-2 mb-3"
                value={selectedWallet?.id || ""}
                onChange={(e) =>
                  setSelectedWallet(
                    wallets.find((w) => w.id === Number(e.target.value)) || null
                  )
                }
              >
                <option value="">-- Select Wallet --</option>
                {wallets.map((w) => (
                  <option key={w.id} value={w.id}>
                    {getWalletType(w)}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Amount Section */}
          <div className="border rounded-lg p-4 mb-4">
            <h2 className="font-medium text-gray-700 mb-2">Buy amount</h2>
            <input
              type="number"
              min="0"
              placeholder="Please enter the amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full border rounded px-3 py-2 mb-2"
            />
            <p className="text-sm text-gray-500">
              Available(₹) <span className="text-blue-600 font-medium">0</span>
            </p>
            <p className="text-xs text-gray-400">1 USDT = ₹110.4</p>
          </div>

          {/* Confirm */}
          <button
            onClick={handleBuy}
            className="w-full py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg"
          >
            Confirm
          </button>
        </>
      )}
    </div>
  );
}
