import React from "react";
import AdminBankAccountManager from "../components/AdminBankAccountManager";

const AdminBankAccountPage = () => {
  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">🏦 My Bank Accounts</h2>
        <p className="text-gray-600">
          Manage your bank accounts for receiving payments and withdrawals
        </p>
      </div>

      {/* Info Card */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <h3 className="font-semibold text-blue-900 mb-2">ℹ️ About Bank Accounts</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Add multiple bank accounts for flexibility</li>
          <li>• Set one account as primary - it will be auto-selected for payments</li>
          <li>• Payments will be sent to the selected or primary account</li>
          <li>• Make sure account details are correct to avoid payment delays</li>
        </ul>
      </div>

      {/* Bank Account Manager */}
      <AdminBankAccountManager />
    </div>
  );
};

export default AdminBankAccountPage;
