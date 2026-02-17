import React, { useState, useEffect, useCallback } from "react";
import { API_CONFIG } from "../config/api.config";

const API_BASE = API_CONFIG.API_BASE;
const API = `${API_BASE}/popups`;

const getToken = () => {
  return (
    localStorage.getItem("admin_token") ||
    localStorage.getItem("adminToken") ||
    localStorage.getItem("token") ||
    localStorage.getItem("authToken") ||
    null
  );
};

function debounce(fn, wait) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), wait);
  };
}

export default function AddPopup({ onCreated }) {
  const [form, setForm] = useState({ userIds: [], title: "", message: "", link: "", buttonText: "Continue", isActive: true });
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");
  const [results, setResults] = useState([]);
  const [loadingSearch, setLoadingSearch] = useState(false);

  const performSearch = useCallback(debounce(async (q) => {
    if (!q) { setResults([]); setLoadingSearch(false); return; }
    setLoadingSearch(true);
    try {
      const token = getToken();
      const res = await fetch(`${API_BASE}/popups/search-users?search=${encodeURIComponent(q)}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok && data.success) setResults(data.data || []);
      else setResults([]);
    } catch (err) {
      console.error("user search error", err);
      setResults([]);
    } finally {
      setLoadingSearch(false);
    }
  }, 350), []);

  useEffect(() => {
    setLoadingSearch(true);
    performSearch(search.trim());
  }, [search, performSearch]);

  const toggleUser = (id) => {
    setForm((f) => {
      const exists = f.userIds.includes(id);
      return { ...f, userIds: exists ? f.userIds.filter(x => x !== id) : [...f.userIds, id] };
    });
  };

  const submit = async (e) => {
    e.preventDefault();
    setStatus("Saving...");
    try {
      const token = getToken();
      if (!token) return setStatus("No admin token found");

      const payload = { ...form };

      const res = await fetch(API, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => null);
      if (res.ok) {
        setStatus("Popup created");
        setForm({ userIds: [], title: "", message: "", link: "", buttonText: "Continue", isActive: true });
        setResults([]);
        setSearch("");
        onCreated && onCreated(data?.data || data);
      } else {
        setStatus(`Error: ${data?.message || res.statusText}`);
      }
    } catch (err) {
      console.error(err);
      setStatus(`Error: ${err.message}`);
    }
  };

  return (
    <section className="mx-auto max-w-2xl">
      <h2 className="text-xl text-white font-bold mb-4">Create Targeted Popup</h2>
      <div className="p-4 bg-slate-700 text-white rounded">
        <form onSubmit={submit}>
          <div className="mb-3">
            <input className="w-full p-2 text-black" placeholder="Search users by name or email" value={search} onChange={e => setSearch(e.target.value)} />
            {loadingSearch && <div className="text-sm text-gray-300 mt-1">Searching...</div>}
          </div>

          {results.length > 0 && (
            <div className="max-h-44 overflow-auto bg-white text-black rounded mb-3 p-2">
              {results.map(u => (
                <label key={u._id} className="flex items-center gap-2 mb-2">
                  <input type="checkbox" checked={form.userIds.includes(u._id)} onChange={() => toggleUser(u._id)} />
                  <span>{u.fullName || u.email} <small className="text-xs">{u.email}</small></span>
                </label>
              ))}
            </div>
          )}

          <div className="mb-2">
            <input className="w-full p-2 mb-2 text-black" placeholder="Title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
            <textarea className="w-full p-2 mb-2 text-black" rows={4} placeholder="Message" value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} required />
            <input className="w-full p-2 mb-2 text-black" placeholder="Optional link" value={form.link} onChange={e => setForm({ ...form, link: e.target.value })} />
            <input className="w-full p-2 mb-2 text-black" placeholder="Button text" value={form.buttonText} onChange={e => setForm({ ...form, buttonText: e.target.value })} />
            <label className="flex items-center gap-2 mb-3">
              <input type="checkbox" checked={form.isActive} onChange={e => setForm({ ...form, isActive: e.target.checked })} /> Active
            </label>
          </div>

          <div className="mb-3 text-sm text-gray-200">Selected users: {form.userIds.length}</div>
          <button className="w-full bg-blue-600 py-2 rounded" type="submit" disabled={form.userIds.length === 0}>Create Popup</button>
        </form>
        {status && <div className="mt-3 text-sm">{status}</div>}
      </div>
    </section>
  );
}
