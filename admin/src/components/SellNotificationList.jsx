import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { Trash2, Check, X, Loader } from 'lucide-react';
import { API_CONFIG } from '../config/api.config';

const API_BASE = API_CONFIG.API_BASE;

function getToken(){
  return localStorage.getItem('admin_token') || localStorage.getItem('token') || null;
}

export default function SellNotificationList(){
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState(null);

  useEffect(() => { fetchNotifications(); }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    setError('');
    try {
      const token = getToken();
      if (!token) {
        setError('❌ No admin token found');
        setNotifications([]);
        return;
      }

      const res = await fetch(`${API_BASE}/sell-notification`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = await res.json().catch(()=>null);
      console.log('📥 Notifications:', data);

      if (res.ok && data?.success) {
        setNotifications(data.data || []);
      } else if (res.ok && Array.isArray(data)) {
        setNotifications(data || []);
      } else {
        setError(data?.message || 'Failed to load notifications');
        setNotifications([]);
      }
    } catch (err) {
      console.error('❌ Error:', err);
      setError('Error loading notifications');
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, userName) => {
    if (!confirm(`Delete sell restriction for ${userName}?`)) return;

    setDeleting(id);
    try {
      const token = getToken();
      const res = await fetch(`${API_BASE}/sell-notification/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = await res.json().catch(()=>null);

      if (res.ok && data?.success) {
        toast.success('✅ Deleted successfully');
        setNotifications(n => n.filter(x => x._id !== id));
      } else {
        toast.error(`❌ ${data?.message || 'Failed to delete'}`);
      }
    } catch (err) {
      console.error('❌ Error:', err);
      toast.error('❌ Error deleting notification');
    } finally {
      setDeleting(null);
    }
  };

  const handleToggle = async (id, currentStatus, userName) => {
    try {
      const token = getToken();
      const res = await fetch(`${API_BASE}/sell-notification/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ isActive: !currentStatus })
      });

      const data = await res.json().catch(()=>null);

      if (res.ok && data?.success) {
        toast.success(`✅ ${!currentStatus ? 'Enabled' : 'Disabled'} for ${userName}`);
        setNotifications(n => n.map(x => x._id === id ? { ...x, isActive: !currentStatus } : x));
      } else {
        toast.error(`❌ ${data?.message || 'Failed to update'}`);
      }
    } catch (err) {
      console.error('❌ Error:', err);
      toast.error('❌ Error updating notification');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader size={24} className="animate-spin text-red-500" />
        <span className="ml-2 text-slate-400">Loading notifications...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-900/30 border border-red-600 rounded-lg text-red-300">
        <p className="font-semibold">{error}</p>
        <button
          onClick={() => fetchNotifications()}
          className="mt-2 px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-sm transition"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!notifications.length) {
    return (
      <div className="p-8 text-center text-slate-400">
        <p className="text-lg font-semibold">📭 No Active Restrictions</p>
        <p className="text-sm mt-2">Create one using the form above</p>
      </div>
    );
  }

  return (
    <div className="mt-8">
      <h3 className="text-xl md:text-2xl font-bold text-white mb-4">📋 Active Sell Restrictions</h3>
      
      {/* Desktop View */}
      <div className="hidden md:block overflow-x-auto rounded-lg border border-slate-700">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-800 border-b border-slate-700">
              <th className="px-4 py-3 text-left font-semibold text-slate-300">User</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-300">Message</th>
              <th className="px-4 py-3 text-center font-semibold text-slate-300">Button</th>
              <th className="px-4 py-3 text-center font-semibold text-slate-300">Status</th>
              <th className="px-4 py-3 text-center font-semibold text-slate-300">Actions</th>
            </tr>
          </thead>
          <tbody>
            {notifications.map(n => (
              <tr key={n._id} className="border-b border-slate-700 hover:bg-slate-800/50 transition">
                <td className="px-4 py-3">
                  <div className="font-medium text-white">{n.userId?.fullName || n.userId?.name || '—'}</div>
                  <div className="text-xs text-slate-400">{n.userId?.email}</div>
                </td>
                <td className="px-4 py-3">
                  <div className="text-xs line-clamp-2 text-slate-300">{n.message}</div>
                </td>
                <td className="px-4 py-3 text-center text-xs text-slate-300">{n.buttonText}</td>
                <td className="px-4 py-3 text-center">
                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${
                    n.isActive ? 'bg-green-900/30 text-green-400' : 'bg-gray-900/30 text-gray-400'
                  }`}>
                    {n.isActive ? <><Check size={14} /> Active</> : <><X size={14} /> Inactive</>}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => handleToggle(n._id, n.isActive, n.userId?.fullName || n.userId?.name)}
                      className={`px-3 py-1 rounded text-xs transition ${
                        n.isActive
                          ? 'bg-yellow-600 hover:bg-yellow-700'
                          : 'bg-green-600 hover:bg-green-700'
                      }`}
                      title={n.isActive ? 'Disable' : 'Enable'}
                    >
                      {n.isActive ? 'Disable' : 'Enable'}
                    </button>
                    <button
                      onClick={() => handleDelete(n._id, n.userId?.fullName || n.userId?.name)}
                      disabled={deleting === n._id}
                      className="px-3 py-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 rounded text-xs transition"
                    >
                      {deleting === n._id ? <Loader size={14} className="animate-spin" /> : <Trash2 size={14} />}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile View */}
      <div className="md:hidden space-y-3">
        {notifications.map(n => (
          <div key={n._id} className="bg-slate-800 rounded-lg p-4 border border-slate-700">
            <div className="flex items-start justify-between mb-2">
              <div>
                <div className="font-semibold text-white">{n.userId?.fullName || n.userId?.name || '—'}</div>
                <div className="text-xs text-slate-400">{n.userId?.email}</div>
              </div>
              <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${
                n.isActive ? 'bg-green-900/30 text-green-400' : 'bg-gray-900/30 text-gray-400'
              }`}>
                {n.isActive ? <Check size={14} /> : <X size={14} />}
              </span>
            </div>
            
            <div className="mb-3 text-xs text-slate-300">
              <p className="text-slate-400 mb-1 font-medium">Message:</p>
              <p className="line-clamp-2">{n.message}</p>
            </div>

            <div className="mb-3 text-xs text-slate-300">
              <p className="text-slate-400 mb-1 font-medium">Button:</p>
              <p>{n.buttonText}</p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => handleToggle(n._id, n.isActive, n.userId?.fullName || n.userId?.name)}
                className={`flex-1 px-2 py-2 rounded text-xs font-medium transition ${
                  n.isActive
                    ? 'bg-yellow-600 hover:bg-yellow-700'
                    : 'bg-green-600 hover:bg-green-700'
                }`}
              >
                {n.isActive ? 'Disable' : 'Enable'}
              </button>
              <button
                onClick={() => handleDelete(n._id, n.userId?.fullName || n.userId?.name)}
                disabled={deleting === n._id}
                className="flex-1 px-2 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 rounded text-xs font-medium transition"
              >
                {deleting === n._id ? '...' : 'Delete'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
