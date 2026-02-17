import React from "react";
import { Link, useLocation } from "react-router-dom";
import logo from "../assets/logo.jpeg";
import { MessageCircle, Home, RefreshCcw, User } from "lucide-react"; // icons

export default function Navbar() {
  const location = useLocation();

  return (
    <>
      {/* Top Navbar */}
      <nav className="bg-white shadow-sm fixed top-0 left-0 right-0 z-50">
        <div className="w-full mx-auto px-3 sm:px-4 md:px-6 py-2 flex items-center justify-between max-w-7xl">
          {/* Left Logo + Brand */}
          <div className="flex items-center gap-2">
            <img src={logo} alt="logo" className="h-8 w-8 sm:h-10 sm:w-10 object-contain" />
            <Link to="/" className="text-lg sm:text-xl font-bold truncate">
              coinwpay
            </Link>
          </div>

          {/* Right Chatbot Icon */}
          <button className="p-2 rounded-full hover:bg-gray-100 transition">
            <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700" />
          </button>
        </div>
      </nav>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-md flex justify-around py-2 sm:py-3 z-50">
        <Link
          to="/"
          className={`flex flex-col items-center text-xs sm:text-sm transition ${
            location.pathname === "/" ? "text-blue-600" : "text-gray-600"
          }`}
        >
          <Home className="w-5 h-5 sm:w-6 sm:h-6" />
          <span className="mt-0.5">Home</span>
        </Link>

        <Link
          to="/exchange"
          className={`flex flex-col items-center text-xs sm:text-sm transition ${
            location.pathname === "/exchange" ? "text-blue-600" : "text-gray-600"
          }`}
        >
          <RefreshCcw className="w-5 h-5 sm:w-6 sm:h-6" />
          <span className="mt-0.5">Exchange</span>
        </Link>

        <Link
          to="/mine"
          className={`flex flex-col items-center text-xs sm:text-sm transition ${
            location.pathname === "/mine" ? "text-blue-600" : "text-gray-600"
          }`}
        >
          <User className="w-5 h-5 sm:w-6 sm:h-6" />
          <span className="mt-0.5">Mine</span>
        </Link>
      </div>

      {/* Padding for fixed navbars */}
      <div className="pt-14 sm:pt-16 pb-16 sm:pb-20">
        {/* Adjust these values according to your top & bottom navbar height */}
      </div>
    </>
  );
}
