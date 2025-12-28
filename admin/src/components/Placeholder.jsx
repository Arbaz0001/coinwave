// src/components/Placeholder.jsx
import React from "react";

export default function Placeholder({ title }) {
  return (
    <div className="p-6 bg-white rounded shadow">
      <h1 className="text-2xl font-bold">{title}</h1>
      <p className="text-gray-500 mt-2">This page is under construction.</p>
    </div>
  );
}
