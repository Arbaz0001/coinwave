import React from "react";
import Navbar from "../components/Navbar";
import BottomBar from "../components/BottomBar";
import UpiManager from "../components/UpiManager";

const UpiAccountPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="container mx-auto px-4 py-6 pb-24">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">💳 UPI Accounts</h1>
          <p className="text-gray-600">
            Manage your UPI IDs for fast withdrawals
          </p>
        </div>

        {/* Info Card */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-blue-900 mb-2">ℹ️ About UPI Accounts</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Add multiple UPI IDs for quick payments</li>
            <li>• Set one UPI as primary - it will be auto-selected for withdrawals</li>
            <li>• UPI withdrawals are faster than bank transfers</li>
            <li>• Make sure your UPI ID is active and verified</li>
          </ul>
        </div>

        {/* UPI Manager Component */}
        <UpiManager />
      </div>

      <BottomBar />
    </div>
  );
};

export default UpiAccountPage;
