import React from "react";
import { Users, TrendingUp, Gift } from "lucide-react";

export default function Referrals() {
  return (
    <div className="p-4 md:p-6 lg:p-8 min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-bold mb-6 text-gray-800">👥 Referrals</h1>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-5 md:p-6 text-white">
            <Users className="w-8 h-8 md:w-10 md:h-10 mb-3 opacity-80" />
            <p className="text-blue-100 text-sm mb-1">Total Referrals</p>
            <p className="text-3xl md:text-4xl font-bold">0</p>
          </div>
          
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-5 md:p-6 text-white">
            <Gift className="w-8 h-8 md:w-10 md:h-10 mb-3 opacity-80" />
            <p className="text-green-100 text-sm mb-1">Rewards Earned</p>
            <p className="text-3xl md:text-4xl font-bold">₹0</p>
          </div>
          
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-5 md:p-6 text-white">
            <TrendingUp className="w-8 h-8 md:w-10 md:h-10 mb-3 opacity-80" />
            <p className="text-purple-100 text-sm mb-1">Active Referrals</p>
            <p className="text-3xl md:text-4xl font-bold">0</p>
          </div>
        </div>
        
        {/* Empty State */}
        <div className="bg-white rounded-xl shadow-md p-8 md:p-12 text-center">
          <Users className="w-16 h-16 md:w-20 md:h-20 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600 text-lg md:text-xl font-medium mb-2">
            No referrals yet
          </p>
          <p className="text-gray-500 text-sm md:text-base">
            Start inviting friends to earn rewards!
          </p>
        </div>
      </div>
    </div>
  );
}
