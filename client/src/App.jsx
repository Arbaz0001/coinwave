// src/App.jsx
import React, { useState } from "react";
import { Routes, Route } from "react-router-dom";
import { MessageCircle, X } from "lucide-react";

// common components
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import HelpSupport from "./pages/HelpSupport";
import TargetedPopupManager from "./components/TargetedPopupManager";

// main pages
import Home from "./pages/Home";
import Exchange from "./pages/Exchange";
import Mine from "./pages/Mine";
import Login from "./components/Login";
import Signup from "./components/Signup";
import VerifyEmail from "./pages/VerifyEmail";

// exchange pages
import BuyUSDT from "./pages/BuyUSDT";
import SellUSDT from "./pages/SellUSDT";
import Deposit from "./pages/Deposit";
import Withdraw from "./pages/withdrawal/Withdraw";
import WithdrawalProfile from "./pages/withdrawal/ProfilePage";
import WithdrawalFormETH from "./pages/withdrawal/WithdrawalFormETH";
import WithdrawalFormINR from "./pages/withdrawal/WithdrawalFormINR";
import WithdrawalFormUSDT from "./pages/withdrawal/WithdrawalFormUSDT";
import WithdrawalTabs from "./pages/withdrawal/WithdrawalTabs";

import Invite from "./pages/Invite";
import ExchangePrices from "./components/ExchangePrices";

// mine sub-pages
import ExchangeHistory from "./pages/ExchangeHistory";
import Statement from "./pages/Statement";
import BankAccountPage from "./pages/BankAccountPage";

export default function App() {
  const [showSupport, setShowSupport] = useState(false);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <TargetedPopupManager />
      <main className="flex-grow w-full mx-auto px-4 sm:px-6 md:px-8 py-4 sm:py-6 max-w-7xl">
        <Routes>
          {/* Public Routes */}
          {/* <Route path="/" element={<Home />} /> */}
          {/* <Route path="/exchange" element={<Exchange />} /> */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/verify-email" element={<VerifyEmail />} />

          {/* Protected Routes */}
           <Route path="/exchange" element={
            <ProtectedRoute>
              <Exchange />
            </ProtectedRoute>
          } />

          <Route path="/" element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }/>
          <Route
            path="/mine"
            element={
              <ProtectedRoute>
                <Mine />
              </ProtectedRoute>
            }
          />
          <Route
            path="/buy"
            element={
              <ProtectedRoute>
                <BuyUSDT />
              </ProtectedRoute>
            }
          />
          <Route
            path="/sell"
            element={
              <ProtectedRoute>
                <SellUSDT />
              </ProtectedRoute>
            }
          />
          <Route
            path="/deposit"
            element={
              <ProtectedRoute>
                <Deposit />
              </ProtectedRoute>
            }
          />
          <Route
            path="/withdraw"
            element={
              <ProtectedRoute>
                <Withdraw />
              </ProtectedRoute>
            }
          />
          <Route
            path="/withdraw/profile"
            element={
              <ProtectedRoute>
                <WithdrawalProfile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/withdraw/eth"
            element={
              <ProtectedRoute>
                <WithdrawalFormETH />
              </ProtectedRoute>
            }
          />
          <Route
            path="/withdraw/inr"
            element={
              <ProtectedRoute>
                <WithdrawalFormINR />
              </ProtectedRoute>
            }
          />
          <Route
            path="/withdraw/usdt"
            element={
              <ProtectedRoute>
                <WithdrawalFormUSDT />
              </ProtectedRoute>
            }
          />
          <Route
            path="/withdraw/tabs"
            element={
              <ProtectedRoute>
                <WithdrawalTabs />
              </ProtectedRoute>
            }
          />

          <Route
            path="/invite"
            element={
              <ProtectedRoute>
                <Invite />
              </ProtectedRoute>
            }
          />
          <Route
            path="/exchange-prices"
            element={
              <ProtectedRoute>
                <ExchangePrices />
              </ProtectedRoute>
            }
          />

          {/* Mine sub-pages */}
          <Route
            path="/exchange-history"
            element={
              <ProtectedRoute>
                <ExchangeHistory />
              </ProtectedRoute>
            }
          />
          <Route
            path="/statement"
            element={
              <ProtectedRoute>
                <Statement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/bank-account"
            element={
              <ProtectedRoute>
                <BankAccountPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/help-support"
            element={
              <ProtectedRoute>
                <HelpSupport />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>

      <footer className="bg-white border-t py-3 sm:py-4 text-center text-sm sm:text-base px-4">
        © {new Date().getFullYear()} Coinpay - Built by Arbaz Sheikh
      </footer>

      {/* Fixed Support Button - Shows on Every Page */}
      <button
        onClick={() => setShowSupport(true)}
        className="fixed bottom-20 right-4 sm:right-6 z-50 bg-green-600 hover:bg-green-700 text-white p-3 sm:p-4 rounded-full shadow-xl transition transform hover:scale-110 flex items-center justify-center"
        title="Help & Support"
      >
        <MessageCircle className="w-6 h-6 sm:w-7 sm:h-7" />
      </button>

      {/* Support Modal */}
      {showSupport && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-gray-900 rounded-xl w-[95%] sm:w-[90%] md:w-[80%] lg:w-[70%] max-w-3xl max-h-[90vh] overflow-y-auto relative">
            {/* Close Button */}
            <button
              onClick={() => setShowSupport(false)}
              className="absolute top-4 right-4 z-10 bg-red-600 hover:bg-red-700 text-white p-2 rounded-full transition"
            >
              <X size={24} />
            </button>

            {/* Help Support Component */}
            <HelpSupport />
          </div>
        </div>
      )}
    </div>
  );
}
