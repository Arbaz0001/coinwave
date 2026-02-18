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
// TransactionHistory removed per request
import USDTTransactionHistory from "./components/USDTTransactionHistory";
import QRCode from "./components/QRCode";
import QRCodeCrypto from "./components/QRCodeCrypto";
// Notification UI removed (replaced by Targeted Popup). Keep file for reference: ./components/addNotification
import SupportSettings from "./components/SupportSettings";
import TargetedPopupPage from "./pages/TargetedPopupPage";
import SellNotificationPage from "./pages/SellNotificationPage";
import BankAccountsManager from "./pages/BankAccountsManager";
import AdminBankAccountPage from "./pages/AdminBankAccountPage";
import SettingsManager from "./pages/SettingsManager";
import ExchangePriceManager from "./pages/ExchangePriceManager";
import AdminStatementManager from "./pages/AdminStatementManager";
import AdminCreatePack from "./pages/AdminCreatePack";
import AdminPackList from "./pages/AdminPackList";
import AdminPurchaseRequests from "./pages/AdminPurchaseRequests";
import AdminPaymentDetails from "./pages/AdminPaymentDetails";
import AdminPackHistory from "./pages/AdminPackHistory";

export default function App() {
  const { isLoggedIn, loading } = useAdminAuth();
  const [activeTab, setActiveTab] = useState("allusers");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  if (loading) return <p className="text-center mt-10">Loading...</p>;
  if (!isLoggedIn) return <Navigate to="/admin/login" replace />;

  // ✅ Clean Tab List (unwanted removed)
  const tabList = [
    { key: "allusers", label: "All Users", component: AllUsers },
    { key: "settings", label: "⚙️ Settings", component: SettingsManager },
    { key: "prices", label: "💱 Prices & Bonus", component: ExchangePriceManager },
    { key: "createpack", label: "📦 Create Pack", component: AdminCreatePack },
    { key: "packlist", label: "📋 All Packs", component: AdminPackList },
    { key: "packrequests", label: "🧾 Purchase Requests", component: AdminPurchaseRequests },
    { key: "packhistory", label: "📜 Pack History", component: AdminPackHistory },
    { key: "packpayment", label: "💳 Payment Details", component: AdminPaymentDetails },
    { key: "statements", label: "📊 User Statements", component: AdminStatementManager },
    { key: "adminbankaccounts", label: "🏦 My Bank Accounts", component: AdminBankAccountPage },
    { key: "bankaccounts", label: "🏦 User Bank Accounts", component: BankAccountsManager },
    { key: "deposits", label: "Deposits", component: Deposits },
    { key: "withdrawals", label: "Withdrawals", component: Withdrawals },
    { key: "refer", label: "Refer Amount", component: ReferAmount },
    // Transaction History tab removed
    { key: "usdt", label: "💱 USDT Transactions", component: USDTTransactionHistory },
    { key: "qrcode", label: "QR Code", component: QRCode },
    { key: "qrcodecrypto", label: "Crypto QR", component: QRCodeCrypto },
    // notifications removed
    { key: "targetedPopup", label: "Targeted Popup", component: TargetedPopupPage },
    { key: "sellNotification", label: "🚫 Sell Restrictions", component: SellNotificationPage },
    { key: "admincontroller", label: "Support Settings", component: SupportSettings },
  ];

  const CurrentTab = tabList.find((t) => t.key === activeTab)?.component || AllUsers;

  return (
    <div className="min-h-screen flex bg-gray-100 text-gray-900">
      {/* 🧱 Desktop Sidebar */}
      <div
        className="hidden lg:flex lg:w-64 lg:flex-col bg-gradient-to-b from-blue-600 to-indigo-700 
        text-white shadow-xl p-4 fixed top-0 left-0 h-full overflow-y-auto z-30"
      >
        <h2 className="text-2xl font-bold tracking-wide mb-6">Admin Panel</h2>
        <nav className="flex flex-col gap-2 pb-8">
          {tabList.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2.5 rounded-lg text-left transition-all duration-200 text-sm ${
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
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-black/50 lg:hidden"
              onClick={() => setIsSidebarOpen(false)}
            />

            <motion.aside
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ duration: 0.3, type: "spring", damping: 25 }}
              className="fixed inset-y-0 left-0 z-50 lg:hidden w-72 sm:w-80 bg-gradient-to-b from-blue-600 to-indigo-700 
              text-white shadow-xl p-4 flex flex-col overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl sm:text-2xl font-bold tracking-wide">Admin Panel</h2>
                <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden hover:bg-blue-500 rounded p-1">
                  <X size={24} />
                </button>
              </div>

              <nav className="flex flex-col gap-2 pb-8">
                {tabList.map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => {
                      setActiveTab(tab.key);
                      setIsSidebarOpen(false);
                    }}
                    className={`px-4 py-2.5 rounded-lg text-left transition-all duration-200 text-sm ${
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
          </>
        )}
      </AnimatePresence>

      {/* 🖥️ Main Content */}
      <div className="flex-1 flex flex-col min-h-screen lg:ml-64 w-full">
        {/* Header */}
        <header className="flex items-center justify-between px-3 sm:px-4 md:px-6 py-3 sm:py-4 bg-white shadow-md sticky top-0 z-30">
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="lg:hidden bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-md transition"
            >
              <Menu size={20} />
            </button>
            <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-blue-700 truncate">Admin Dashboard</h1>
          </div>
          <div className="hidden sm:block text-xs sm:text-sm text-gray-600">Welcome, Admin 👋</div>
        </header>

        {/* Page Content (Scrollable only here) */}
        <main className="p-3 sm:p-4 md:p-6 flex-1 overflow-y-auto bg-gray-50">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
            className="w-full"
          >
            <div className="bg-white rounded-xl shadow-md p-3 sm:p-4 md:p-6 lg:p-8 overflow-x-auto">
              <CurrentTab />
            </div>
          </motion.div>
        </main>
      </div>
    </div>
  );
}
