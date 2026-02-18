 import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { initSocket, getSocket } from "../hooks/useSocket";
import Card from "../components/Card";
import { useBalance } from "../context/BalanceContext";
import { API_CONFIG } from "../config/api.config";
import {
  Gift,
  Users,
  History,
  FileText,
  Banknote,
  Briefcase,
  Wallet,
  LifeBuoy,
  LogOut,
} from "lucide-react";

export default function Mine() {
  const navigate = useNavigate();

  const [wallet, setWallet] = useState({ balance: 0 });
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const { balance } = useBalance();

  /* ======================
     AUTH CHECK (FIXED)
  ====================== */
  useEffect(() => {
    const storedUser = localStorage.getItem("cw_user");

    if (!storedUser) {
      navigate("/login", { replace: true });
      return;
    }

    try {
      const parsedUser = JSON.parse(storedUser);
      if (parsedUser?._id) {
        setUser(parsedUser);
      } else {
        navigate("/login", { replace: true });
      }
    } catch (err) {
      console.error("Failed to parse cw_user from storage", err);
      localStorage.removeItem("cw_user");
      navigate("/login", { replace: true });
    }
  }, [navigate]);

  /* ======================
     FETCH WALLET
  ====================== */
  useEffect(() => {
    const fetchWallet = async () => {
      if (!user?._id) return;

      try {
        setLoading(true);
        // Construct API URL with /api prefix
        const apiBase = API_CONFIG.API_BASE;
        const res = await axios.get(
          `${apiBase}/wallet/user/${user._id}`
        );

        if (res.data?.success) {
          setWallet(res.data.data);
          console.log("✅ Wallet loaded:", res.data.data);
        } else {
          console.warn("⚠️ Wallet fetch failed:", res.data?.message);
        }
      } catch (err) {
        console.error("❌ Wallet fetch error:", err?.response?.status, err?.message);
      } finally {
        setLoading(false);
      }
    };

    fetchWallet();
  }, [user]);

  useEffect(() => {
    if (!user?._id) return;

    const token =
      localStorage.getItem("token") ||
      localStorage.getItem("authToken") ||
      localStorage.getItem("accessToken") ||
      (function () {
        try {
          const auth = JSON.parse(localStorage.getItem("auth") || "{}");
          return auth?.accessToken || null;
        } catch {
          return null;
        }
      })();

    const socket = getSocket() || initSocket(token);
    if (!socket) return;

    const handler = (payload) => {
      if (!payload || String(payload.userId) !== String(user._id)) return;
      if (payload.balance == null) return;
      setWallet((prev) => ({ ...prev, balance: payload.balance }));
    };

    socket.on("balanceUpdated", handler);
    return () => socket.off("balanceUpdated", handler);
  }, [user?._id]);

  /* ======================
     LOGOUT (SAFE)
  ====================== */
  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    navigate("/login", { replace: true });
  };

  // ✅ Navigation menu items
  const menu = [
    { title: "Invite", path: "/invite", icon: <Users className="w-5 h-5 md:w-6 md:h-6 text-blue-600" /> },
    { title: "Pack", path: "/investment", icon: <Briefcase className="w-5 h-5 md:w-6 md:h-6 text-indigo-600" /> },
    { title: "My Investments", path: "/my-investments", icon: <Wallet className="w-5 h-5 md:w-6 md:h-6 text-emerald-600" /> },
    { title: "Exchange history", path: "/exchange-history", icon: <History className="w-5 h-5 md:w-6 md:h-6 text-green-600" /> },
    { title: "Statement", path: "/statement", icon: <FileText className="w-5 h-5 md:w-6 md:h-6 text-purple-600" /> },
    { title: "Bank account", path: "/bank-account", icon: <Banknote className="w-5 h-5 md:w-6 md:h-6 text-yellow-600" /> },
  ];

  /* ======================
     LOADING
  ====================== */
  if (loading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <p className="text-gray-600 font-medium">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-4 md:p-6 flex flex-col">
      <div className="max-w-4xl mx-auto w-full">
      {/* PROFILE */}
      <div className="bg-white rounded-xl shadow-md p-6 md:p-8 text-center">
        <div className="w-20 h-20 md:w-24 md:h-24 mx-auto rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-4xl md:text-5xl">
          👤
        </div>

        <p className="mt-3 font-semibold text-lg md:text-xl text-gray-800">
          {user.fullName || user.email || user.phoneNumber || "User"}
        </p>

        <div className="mt-4 md:mt-6">
          <p className="text-gray-500 text-sm md:text-base">Total Wallet Balance</p>
            <p className="text-3xl md:text-4xl font-bold text-gray-900 mt-1">
              ₹ {Number(balance ?? wallet?.balance ?? 0).toFixed(2)}
            </p>
        </div>
      </div>

      {/* REWARD */}
      <Card className="mt-6 p-4 md:p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gradient-to-r from-cyan-100 to-blue-200 rounded-xl">
        <div className="flex items-center gap-2">
          <Gift className="w-6 h-6 text-blue-600" />
          <div>
            <p className="text-gray-600">Reward</p>
            <p className="font-bold text-lg text-blue-700">₹0.00</p>
          </div>
        </div>

        <button className="px-3 py-1 rounded-full bg-blue-600 text-white text-sm hover:bg-blue-700">
          Details
        </button>
      </Card>

      {/* HELP & SUPPORT - PREMIUM PROFESSIONAL BUTTON */}
      <button 
        onClick={() => navigate("/help-support")}
        className="mt-6 w-full px-6 py-5 md:py-6 bg-gradient-to-br from-orange-500 via-orange-500 to-orange-600 hover:from-orange-600 hover:via-orange-600 hover:to-orange-700 text-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 flex items-center justify-between border border-orange-400 border-opacity-40"
      >
        <div className="flex items-center gap-4">
          <div className="p-3 bg-white bg-opacity-20 rounded-full">
            <LifeBuoy className="w-8 h-8 md:w-9 md:h-9 text-white" />
          </div>
          <div className="text-left">
            <p className="font-bold text-lg md:text-xl">Help & Support</p>
            <p className="text-xs md:text-sm opacity-95 font-medium">🟢 Available 24/7</p>
          </div>
        </div>
        <span className="text-2xl font-light">→</span>
      </button>

      {/* MENU */}
      <div className="mt-6 bg-white rounded-xl shadow-md divide-y">
        {menu.map((item) => (
          <button
            type="button"
            key={item.path}
            onClick={() => navigate(item.path)}
            className="w-full flex justify-between items-center px-4 md:px-6 py-4 md:py-5 cursor-pointer hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-3 md:gap-4 min-w-0 pr-2">
              {item.icon}
              <span className="text-gray-700 font-medium text-sm md:text-base text-left leading-snug break-words">
                {item.title}
              </span>
            </div>
            <span className="text-gray-400 shrink-0">›</span>
          </button>
        ))}
      </div>

      {/* LOGOUT BOTTOM */}
      <div className="mt-6 pb-4">
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 py-3 md:py-4 rounded-xl bg-red-600 text-white font-semibold hover:bg-red-700 transition-all shadow-lg hover:shadow-xl text-base md:text-lg"
        >
          <LogOut className="w-5 h-5" />
          Logout
        </button>
      </div>
      </div>
    </div>
  );
}
