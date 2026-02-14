import React, { useState } from "react";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Navigate } from "react-router-dom";
import { useAdminAuth } from "./context/AdminAuthContext.jsx";

// Components
import AllUsers from "./pages/AllUsers";
import Deposits from "./components/Deposite";
import Withdrawals from "./components/Withdrawals";
import ReferAmount from "./components/ReferAmount";
import TransactionHistory from "./components/TransactionHistory";
import USDTTransactionHistory from "./components/USDTTransactionHistory";
import QRCode from "./components/QRCode";
import QRCodeCrypto from "./components/QRCodeCrypto";
import AddNotification from "./components/addNotification";
import SupportSettings from "./components/SupportSettings";

export default function App() {
  const { isLoggedIn, loading } = useAdminAuth();
  const [activeTab, setActiveTab] = useState("allusers");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); // ✅ sidebar always open on desktop

  if (loading) return <p className="text-center mt-10">Loading...</p>;
  if (!isLoggedIn) return <Navigate to="/admin/login" replace />;

  // ✅ Clean Tab List (unwanted removed)
  const tabList = [
    { key: "allusers", label: "All Users", component: AllUsers },
    { key: "deposits", label: "Deposits", component: Deposits },
    { key: "withdrawals", label: "Withdrawals", component: Withdrawals },
    { key: "refer", label: "Refer Amount", component: ReferAmount },
    { key: "history", label: "Transaction History", component: TransactionHistory },
    { key: "usdt", label: "💱 USDT Transactions", component: USDTTransactionHistory },
    { key: "qrcode", label: "QR Code", component: QRCode },
    { key: "qrcodecrypto", label: "Crypto QR", component: QRCodeCrypto },
    { key: "notification", label: "Notifications", component: AddNotification },
    { key: "admincontroller", label: "Support Settings", component: SupportSettings },
  ];

  const CurrentTab = tabList.find((t) => t.key === activeTab)?.component || AllUsers;

  return (
    <div className="min-h-screen flex bg-gray-100 text-gray-900">
      {/* 🧱 Desktop Sidebar */}
      <div
        className="hidden md:flex md:w-64 md:flex-col bg-gradient-to-b from-blue-600 to-indigo-700 
        text-white shadow-xl p-4 fixed top-0 left-0 h-full overflow-y-auto"
      >
        <h2 className="text-2xl font-bold tracking-wide mb-6">Admin Panel</h2>
        <nav className="flex flex-col gap-2 pb-8">
          {tabList.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2 rounded-lg text-left transition-all duration-200 ${
                activeTab === tab.key
                  ? "bg-white text-blue-700 font-semibold shadow-md"
                  : "hover:bg-blue-500"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* 📱 Mobile Sidebar */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.aside
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            transition={{ duration: 0.3 }}
            className="fixed z-50 md:hidden w-64 h-screen bg-gradient-to-b from-blue-600 to-indigo-700 
            text-white shadow-xl p-4"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold tracking-wide">Admin Panel</h2>
              <button onClick={() => setIsSidebarOpen(false)} className="md:hidden">
                <X size={22} />
              </button>
            </div>

            <nav className="flex flex-col gap-2">
              {tabList.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => {
                    setActiveTab(tab.key);
                    setIsSidebarOpen(false);
                  }}
                  className={`px-4 py-2 rounded-lg text-left transition-all duration-200 ${
                    activeTab === tab.key
                      ? "bg-white text-blue-700 font-semibold shadow-md"
                      : "hover:bg-blue-500"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* 🖥️ Main Content */}
      <div className="flex-1 flex flex-col min-h-screen md:ml-64">
        {/* Header */}
        <header className="flex items-center justify-between px-6 py-4 bg-white shadow-md sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="md:hidden bg-blue-600 text-white p-2 rounded-md"
            >
              <Menu size={22} />
            </button>
            <h1 className="text-xl md:text-2xl font-bold text-blue-700">Admin Dashboard</h1>
          </div>
          <div className="text-sm text-gray-600">Welcome, Admin 👋</div>
        </header>

        {/* Page Content (Scrollable only here) */}
        <main className="p-4 md:p-6 flex-1 overflow-y-auto">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
          >
            <div className="bg-white rounded-xl shadow-md p-5 md:p-8">
              <CurrentTab />
            </div>
          </motion.div>
        </main>
      </div>
    </div>
  );
}
