import React from "react";
import { FaTelegramPlane, FaWhatsapp } from "react-icons/fa";

export default function HelpSupport() {
  const telegramLink = "https://t.me/your_telegram_bot"; // Replace with your bot link
  const whatsappLink = "https://wa.me/919876543210"; // Replace with your WhatsApp number with country code

  return (
    <div className="max-w-md mx-auto p-6 bg-white shadow-lg rounded-2xl border border-gray-100">
      {/* Heading */}
      <h2 className="text-2xl font-bold mb-2 text-gray-900 text-center">
        Help & Support
      </h2>
      <p className="text-gray-600 mb-6 text-center">
        Need assistance? Connect with us on Telegram or WhatsApp. 
        Our support team is available 24/7.
      </p>

      {/* Buttons Section */}
      <div className="flex flex-col gap-4">
        {/* Telegram Support */}
        <a
          href={telegramLink}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-3 px-5 py-3 
                     bg-gradient-to-r from-blue-500 to-blue-600 
                     text-white font-medium rounded-xl shadow-md 
                     hover:scale-105 hover:shadow-lg transition"
        >
          <FaTelegramPlane size={24} />
          <span>Chat on Telegram</span>
        </a>

        {/* WhatsApp Support */}
        <a
          href={whatsappLink}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-3 px-5 py-3 
                     bg-gradient-to-r from-green-500 to-green-600 
                     text-white font-medium rounded-xl shadow-md 
                     hover:scale-105 hover:shadow-lg transition"
        >
          <FaWhatsapp size={24} />
          <span>Chat on WhatsApp</span>
        </a>
      </div>
    </div>
  );
}
