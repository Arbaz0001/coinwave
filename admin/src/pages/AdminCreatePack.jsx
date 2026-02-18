import React, { useState } from "react";
import { createPack } from "../services/investmentService";

const initialState = {
  packName: "",
  amount: "",
  interestPercent: "",
  description: "",
  isActive: true,
};

export default function AdminCreatePack() {
  const [form, setForm] = useState(initialState);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const onChange = (event) => {
    const { name, value, type, checked } = event.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    try {
      const payload = {
        ...form,
        amount: Number(form.amount),
        interestPercent: Number(form.interestPercent),
      };

      const response = await createPack(payload);
      if (!response?.success) {
        throw new Error(response?.message || "Failed to create pack");
      }

      setMessage("Pack created successfully");
      setForm(initialState);
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || "Failed to create pack");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Create Investment Pack</h2>

      {message && <p className="mb-3 text-green-600 font-medium">{message}</p>}
      {error && <p className="mb-3 text-red-600 font-medium">{error}</p>}

      <form onSubmit={onSubmit} className="space-y-4 bg-white p-4 rounded-lg border">
        <input
          className="w-full border rounded-md p-2"
          name="packName"
          placeholder="Pack Name"
          value={form.packName}
          onChange={onChange}
          required
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <input
            className="w-full border rounded-md p-2"
            name="amount"
            type="number"
            placeholder="Amount"
            value={form.amount}
            onChange={onChange}
            required
          />
          <input
            className="w-full border rounded-md p-2"
            name="interestPercent"
            type="number"
            placeholder="Interest %"
            value={form.interestPercent}
            onChange={onChange}
            required
          />
        </div>

        <textarea
          className="w-full border rounded-md p-2"
          name="description"
          placeholder="Description"
          rows={3}
          value={form.description}
          onChange={onChange}
        />

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="isActive"
            checked={form.isActive}
            onChange={onChange}
          />
          {" "}
          Active Pack
        </label>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-semibold py-2 rounded-md"
        >
          {loading ? "Creating..." : "Create Pack"}
        </button>
      </form>
    </div>
  );
}
