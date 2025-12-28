 
import React, { useState } from "react";

export default function BankAccount() {
  const [account, setAccount] = useState({
    holder: "Arbaz Sheikh",
    number: "XXXX-XXXX-1234",
    ifsc: "HDFC0001234",
    bank: "HDFC Bank",
  });

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Bank Account</h1>

      {account ? (
        <div className="space-y-3 p-4 border rounded-lg shadow">
          <p>
            <span className="font-semibold">Account Holder:</span>{" "}
            {account.holder}
          </p>
          <p>
            <span className="font-semibold">Account Number:</span>{" "}
            {account.number}
          </p>
          <p>
            <span className="font-semibold">IFSC Code:</span> {account.ifsc}
          </p>
          <p>
            <span className="font-semibold">Bank:</span> {account.bank}
          </p>
        </div>
      ) : (
        <p>No bank account linked yet.</p>
      )}
    </div>
  );
}
