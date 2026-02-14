// import React, { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import axios from "axios";
// import Card from "../components/Card";
// import { Gift, Users, History, FileText, Banknote, UserPlus } from "lucide-react";

// export default function Mine() {
//   const navigate = useNavigate();
//   const [wallet, setWallet] = useState({ balance: 0 });
//   const [loading, setLoading] = useState(true);
//   const [user, setUser] = useState(null);

//   // ✅ Load user from localStorage
//   useEffect(() => {
//     const storedUser = JSON.parse(localStorage.getItem("cw_user"));
//     if (!storedUser || !storedUser._id) {
//       alert("Please login again!");
//       navigate("/login");
//     } else {
//       setUser(storedUser);
//     }
//   }, [navigate]);

//   // ✅ Fetch Wallet Balance
//   useEffect(() => {
//     const fetchWallet = async () => {
//       if (!user?._id) return;
//       setLoading(true);
//       try {
//         const res = await axios.get(`${import.meta.env.VITE_API_URL}/wallet/user/${user._id}`);
//         if (res.data.success) {
//           setWallet(res.data.data);
//         } else {
//           console.warn("Wallet fetch failed:", res.data.message);
//         }
//       } catch (err) {
//         console.error("Error fetching wallet:", err);
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchWallet();
//   }, [user]);

//   const menu = [
//     { title: "Invite", path: "/invite", icon: <Users className="w-5 h-5 text-blue-600" /> },
//     { title: "Exchange history", path: "/exchange-history", icon: <History className="w-5 h-5 text-green-600" /> },
//     { title: "Statement", path: "/statement", icon: <FileText className="w-5 h-5 text-purple-600" /> },
//     { title: "Bank account", path: "/bank-account", icon: <Banknote className="w-5 h-5 text-yellow-600" /> },
//     { title: "Help-Support", path: "/help-support", icon: <UserPlus className="w-5 h-5 text-pink-600" /> },
//   ];

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center min-h-screen">
//         <p className="text-gray-500 text-lg font-medium">Loading wallet...</p>
//       </div>
//     );
//   }

//   return (
//     <div className="p-4">
//       {/* Profile Section */}
//       <div className="flex flex-col items-center text-center">
//         <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-4xl">
//           👤
//         </div>
//         <p className="mt-2 font-semibold text-lg">
//           {user?.fullName || user?.email || user?.phoneNumber || "User"}
//         </p>

//         {/* Wallet Balance */}
//         <div className="flex justify-around w-full mt-4 text-sm">
//           <div>
//             <p className="text-gray-600">Total Balance (₹)</p>
//             <p className="font-bold text-lg">{wallet?.balance?.toFixed(2) || 0}</p>
//           </div>
//           <div>
//             <p className="text-gray-600">Available (₹)</p>
//             <p className="font-bold text-lg">{wallet?.balance?.toFixed(2) || 0}</p>
//           </div>
//           <div>
//             <p className="text-gray-600">Progressing (₹)</p>
//             <p className="font-bold text-lg text-gray-400">0.00</p>
//           </div>
//         </div>
//       </div>

//       {/* Reward Card */}
//       <Card className="mt-6 p-4 flex justify-between items-center bg-gradient-to-r from-cyan-100 to-blue-200">
//         <div className="flex items-center gap-2">
//           <Gift className="w-6 h-6 text-blue-600" />
//           <div>
//             <p className="text-gray-600">Reward</p>
//             <p className="font-bold text-lg text-blue-700">₹0.00</p>
//           </div>
//         </div>
//         <div className="text-right">
//           <button className="px-3 py-1 rounded-full bg-blue-600 text-white text-sm hover:bg-blue-700">
//             Details
//           </button>
//           <p className="text-gray-600 mt-1">--</p>
//         </div>
//       </Card>

//       {/* Menu Items */}
//       <div className="mt-6 bg-white rounded-lg shadow divide-y">
//         {menu.map((item, idx) => (
//           <div
//             key={idx}
//             className="flex justify-between items-center px-4 py-3 cursor-pointer hover:bg-gray-50"
//             onClick={() => navigate(item.path)}
//           >
//             <div className="flex items-center gap-3">
//               {item.icon}
//               <span>{item.title}</span>
//             </div>
//             <span className="text-gray-400">›</span>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }



import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Card from "../components/Card";
import {
  Gift,
  Users,
  History,
  FileText,
  Banknote,
  UserPlus,
  LogOut,
} from "lucide-react";

export default function Mine() {
  const navigate = useNavigate();

  const [wallet, setWallet] = useState({ balance: 0 });
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

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
      if (!parsedUser?._id) {
        navigate("/login", { replace: true });
      } else {
        setUser(parsedUser);
      }
    } catch (err) {
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
        const apiBase = import.meta.env.VITE_API_URL.replace(/\/$/, "") + "/api";
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

  /* ======================
     LOGOUT (SAFE)
  ====================== */
  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    navigate("/login", { replace: true });
  };

  const menu = [
    { title: "Invite", path: "/invite", icon: <Users className="w-5 h-5 text-blue-600" /> },
    { title: "Exchange history", path: "/exchange-history", icon: <History className="w-5 h-5 text-green-600" /> },
    { title: "Statement", path: "/statement", icon: <FileText className="w-5 h-5 text-purple-600" /> },
    { title: "Bank account", path: "/bank-account", icon: <Banknote className="w-5 h-5 text-yellow-600" /> },
    { title: "Help & Support", path: "/help-support", icon: <UserPlus className="w-5 h-5 text-pink-600" /> },
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
    <div className="min-h-screen bg-gray-100 p-4 flex flex-col">
      {/* PROFILE */}
      <div className="bg-white rounded-xl shadow p-6 text-center">
        <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-4xl">
          👤
        </div>

        <p className="mt-3 font-semibold text-lg text-gray-800">
          {user.fullName || user.email || user.phoneNumber || "User"}
        </p>

        <div className="mt-4">
          <p className="text-gray-500 text-sm">Total Wallet Balance</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">
            ₹ {wallet?.balance?.toFixed(2) || "0.00"}
          </p>
        </div>
      </div>

      {/* REWARD */}
      <Card className="mt-6 p-4 flex justify-between items-center bg-gradient-to-r from-cyan-100 to-blue-200">
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

      {/* MENU */}
      <div className="mt-6 bg-white rounded-lg shadow divide-y">
        {menu.map((item, idx) => (
          <div
            key={idx}
            onClick={() => navigate(item.path)}
            className="flex justify-between items-center px-4 py-3 cursor-pointer hover:bg-gray-50"
          >
            <div className="flex items-center gap-3">
              {item.icon}
              <span className="text-gray-700 font-medium">{item.title}</span>
            </div>
            <span className="text-gray-400">›</span>
          </div>
        ))}
      </div>

      {/* LOGOUT BOTTOM */}
      <div className="mt-auto pt-6">
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-red-600 text-white font-semibold hover:bg-red-700"
        >
          <LogOut className="w-5 h-5" />
          Logout
        </button>
      </div>
    </div>
  );
}
