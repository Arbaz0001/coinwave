import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";

const Login = () => {
  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { login, user, loading } = useAuth();
  const navigate = useNavigate();

  // ✅ Redirect if already logged in
  useEffect(() => {
    if (!loading && user) {
      navigate("/");
    }
  }, [loading, user, navigate]);

  if (loading) return null;

  // 🟩 Handle Submit
 const handleSubmit = async (e) => {
  e.preventDefault();
  setError("");
  setIsLoading(true);

  const input = emailOrPhone.trim();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phoneRegex = /^[0-9]{10}$/;

  if (!input || !password) {
    setError("Please fill in all fields");
    setIsLoading(false);
    return;
  }

  try {
    const loginData = emailRegex.test(input)
      ? { email: input, password }
      : { phoneNumber: input, password };

    const res = await login(loginData);
    if (res?.user && res?.accessToken) {
      // ✅ Everything stored already by AuthContext
      console.log("👤 User stored:", res.user);
      navigate("/");
    } else {
      setError("Invalid credentials");
    }
  } catch (err) {
    setError(err.response?.data?.message || "Login failed");
  } finally {
    setIsLoading(false);
  }
};


  // 🧩 UI
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="max-w-sm w-full bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
        <h1 className="text-3xl font-bold text-gray-900 text-center mb-6">
          Login
        </h1>

        {error && (
          <p className="text-red-500 text-center text-sm mb-4">{error}</p>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email / Phone Field */}
          <div>
            <label className="block text-gray-800 font-medium mb-1">
              Email or Phone <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Enter email or phone number"
              value={emailOrPhone}
              onChange={(e) => setEmailOrPhone(e.target.value)}
              className="w-full bg-gray-800 text-white placeholder-gray-400 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-300 shadow-md"
              required
            />
          </div>

          {/* Password Field */}
          <div>
            <label className="block text-gray-800 font-medium mb-1">
              Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-gray-800 text-white placeholder-gray-400 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-300 shadow-md"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-3 text-gray-300 hover:text-white text-sm"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-blue-500 text-white font-semibold rounded-xl hover:bg-blue-600 transition-all duration-300 shadow-md"
          >
            {isLoading ? "Logging in..." : "Login"}
          </button>
        </form>

        {/* Signup link */}
        <p className="text-center text-gray-700 mt-6 text-sm">
          Don’t have an account?{" "}
          <Link
            to="/signup"
            className="text-blue-600 font-semibold hover:underline"
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
