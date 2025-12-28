// import React, { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { useAdminAuth } from "../context/AdminAuthContext.jsx";
// import { loginAdmin } from "../utils/adminApi.js";

// export default function AdminLogin() {
//   const [identifier, setIdentifier] = useState(""); // Email or Phone
//   const [password, setPassword] = useState("");
//   const [showPassword, setShowPassword] = useState(false);
//   const [loading, setLoading] = useState(false);

//   const { login } = useAdminAuth();
//   const navigate = useNavigate();

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);

//     try {
//       // loginAdmin returns the response data object from API
//       const data = await loginAdmin({ identifier, password });
//       // server expected shape: { accessToken, user } (or similar)
//       // Normalize possible shapes:
//       const accessToken =
//         data?.accessToken ?? data?.token ?? data?.data?.accessToken ?? null;
//       const user =
//         data?.user ?? data?.admin ?? data?.data?.user ?? data?.data?.admin ?? null;

//       if (!accessToken || !user) {
//         console.error("Unexpected login response:", data);
//         alert("Invalid server response. Please try again.");
//         setLoading(false);
//         return;
//       }

//       // Save token and user in localStorage in a consistent shape used by interceptor
//       const adminAuth = { accessToken, user };
//       localStorage.setItem("adminAuth", JSON.stringify(adminAuth));
//       // also keep a shortcut token key if any other code expects it
//       localStorage.setItem("admin_token", accessToken);

//       // Update context
//       login({ token: accessToken, admin: user }); // adjust to your context shape if needed

//       // Redirect to admin dashboard
//       navigate("/admin");
//     } catch (error) {
//       console.error("❌ Admin login error:", error);
//       const msg =
//         error?.response?.data?.message ||
//         error?.response?.data ||
//         error?.message ||
//         "Login failed. Check credentials or server.";
//       alert(msg);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="flex items-center justify-center min-h-screen bg-gray-100">
//       <form
//         onSubmit={handleSubmit}
//         className="bg-white rounded-xl shadow-md p-8 w-96 flex flex-col gap-4"
//       >
//         <h2 className="text-2xl font-bold text-center mb-4">Admin Login</h2>

//         <div className="flex flex-col">
//           <label className="mb-1 font-medium">Email or Phone *</label>
//           <input
//             type="text"
//             placeholder="Enter email or phone number"
//             value={identifier}
//             onChange={(e) => setIdentifier(e.target.value)}
//             className="border p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//             required
//           />
//         </div>

//         <div className="flex flex-col relative">
//           <label className="mb-1 font-medium">Password *</label>
//           <input
//             type={showPassword ? "text" : "password"}
//             placeholder="Enter password"
//             value={password}
//             onChange={(e) => setPassword(e.target.value)}
//             className="border p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//             required
//           />
//           <span
//             onClick={() => setShowPassword(!showPassword)}
//             className="absolute right-3 top-9 text-sm text-blue-500 cursor-pointer select-none"
//           >
//             {showPassword ? "Hide" : "Show"}
//           </span>
//         </div>

//         <button
//           type="submit"
//           disabled={loading}
//           className="bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition disabled:opacity-50"
//         >
//           {loading ? "Logging in..." : "Login"}
//         </button>
//       </form>
//     </div>
//   );
// }

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAdminAuth } from "../context/AdminAuthContext.jsx";
import { loginAdmin } from "../utils/adminApi.js";

export default function AdminLogin() {
  const [identifier, setIdentifier] = useState(""); // Email or Phone
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const { login } = useAdminAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // loginAdmin returns the response data object from API
      const data = await loginAdmin({ identifier, password });
      // server expected shape: { accessToken, user } (or similar)
      // Normalize possible shapes:
      const accessToken =
        data?.accessToken ?? data?.token ?? data?.data?.accessToken ?? data?.data?.token ?? null;
      const user =
        data?.user ?? data?.admin ?? data?.data?.user ?? data?.data?.admin ?? null;

      if (!accessToken || !user) {
        console.error("Unexpected login response:", data);
        alert("Invalid server response. Please try again.");
        setLoading(false);
        return;
      }

      // Save token and user in localStorage in a consistent shape used by other parts
      const adminAuth = { accessToken, user };
      localStorage.setItem("adminAuth", JSON.stringify(adminAuth));

      // Compatibility: save token under multiple keys so different parts of app find it
      localStorage.setItem("admin_token", accessToken);
      localStorage.setItem("adminToken", accessToken); // used by addNotification.jsx
      localStorage.setItem("token", accessToken);
      localStorage.setItem("authToken", accessToken);

      // Update context
      login({ token: accessToken, admin: user }); // adjust to your context shape if needed

      // Redirect to admin dashboard
      navigate("/admin");
    } catch (error) {
      console.error("❌ Admin login error:", error);
      const msg =
        error?.response?.data?.message ||
        error?.response?.data ||
        error?.message ||
        "Login failed. Check credentials or server.";
      alert(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-xl shadow-md p-8 w-96 flex flex-col gap-4"
      >
        <h2 className="text-2xl font-bold text-center mb-4">Admin Login</h2>

        <div className="flex flex-col">
          <label className="mb-1 font-medium">Email or Phone *</label>
          <input
            type="text"
            placeholder="Enter email or phone number"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            className="border p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div className="flex flex-col relative">
          <label className="mb-1 font-medium">Password *</label>
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <span
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-9 text-sm text-blue-500 cursor-pointer select-none"
          >
            {showPassword ? "Hide" : "Show"}
          </span>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition disabled:opacity-50"
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
}
