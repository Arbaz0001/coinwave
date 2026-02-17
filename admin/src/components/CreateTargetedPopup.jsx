import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { Send, Loader } from 'lucide-react';
import { API_CONFIG } from '../config/api.config';

const API_BASE = API_CONFIG.API_BASE;

function getToken(){
  return localStorage.getItem('admin_token') || localStorage.getItem('token') || null;
}

export default function CreateTargetedPopup({ selectedUser, selectedUsers, multiSelect = false, onCreated }){
  const [form, setForm] = useState({ title: '', message: '', link: '', buttonText: 'Done', isActive: true });
  const [status, setStatus] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => { setStatus(''); }, [selectedUser, selectedUsers]);

  const submit = async (e) => {
    e.preventDefault();
    
    // Get targets: either multi-select or single select
    const targets = (multiSelect && Array.isArray(selectedUsers) && selectedUsers.length > 0) ? selectedUsers : (selectedUser ? [selectedUser] : []);
    
    if (targets.length === 0) {
      toast.error('❌ Please select at least one user');
      return;
    }

    setStatus(`Creating popups for ${targets.length} user(s)...`);
    setIsLoading(true);

    try{
      const token = getToken();
      if (!token) {
        toast.error('❌ No admin token found. Please login again.');
        setStatus('No admin token found');
        setIsLoading(false);
        return;
      }

      const results = [];
      for (const user of targets) {
        const payload = { userId: user._id, ...form };
        console.log('📤 Creating popup for:', user.email || user._id);

        try {
          const res = await fetch(`${API_BASE}/targeted-popups`, { 
            method: 'POST', 
            headers: { 
              'Content-Type': 'application/json', 
              Authorization: `Bearer ${token}` 
            }, 
            body: JSON.stringify(payload) 
          });
          const data = await res.json().catch(()=>null);
          results.push({ user, ok: res.ok, data });

          if(res.ok){ 
            toast.success(`✅ Created for ${user.fullName || user.email}`);
          }
          else {
            const errMsg = data?.message || res.statusText || 'Unknown error';
            toast.error(`❌ ${user.email}: ${errMsg}`);
          }
        } catch (err) {
          console.error('❌ Request error:', err);
          toast.error(`❌ ${user.email}: Network error`);
          results.push({ user, ok: false, data: null });
        }
      }

      const successCount = results.filter(r => r.ok).length;
      if (successCount > 0) {
        setStatus(`✅ Created ${successCount}/${results.length} popups`);
        setForm({ title:'', message:'', link:'', buttonText:'Done', isActive:true }); 
        onCreated && onCreated();
      } else {
        setStatus('❌ Failed to create popups. See messages above.');
      }
    }catch(err){ 
      console.error('❌ Error:', err); 
      setStatus('❌ Error creating popups'); 
      toast.error('❌ Error creating popups');
    }
    finally {
      setIsLoading(false);
    }
  };

  const selectedCount = multiSelect ? (Array.isArray(selectedUsers) ? selectedUsers.length : 0) : (selectedUser ? 1 : 0);
  const selectedNames = multiSelect 
    ? selectedUsers?.map(u => u.fullName || u.email).join(', ') 
    : (selectedUser?.fullName || selectedUser?.email || 'None');

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">🎯 Create Targeted Popup</h2>
        <p className="text-slate-400 text-sm md:text-base">
          {multiSelect ? (
            <>
              Selected Users: <span className="font-bold text-blue-400">{selectedCount}</span> 
              {selectedCount > 0 && <span className="text-xs ml-2 text-slate-300">({selectedNames})</span>}
            </>
          ) : (
            <>
              Selected User: <span className="font-bold text-blue-400">{selectedNames}</span>
            </>
          )}
        </p>
      </div>

      {selectedCount === 0 && (
        <div className="mb-6 p-4 bg-yellow-900/30 border border-yellow-600 rounded-lg text-yellow-300 text-sm">
          <p className="font-semibold">⚠️ Select at least one user to continue</p>
          <p className="text-xs mt-1">👈 Use the sidebar to select user(s)</p>
        </div>
      )}

      <form onSubmit={submit} className="bg-slate-800 rounded-lg p-4 md:p-6 space-y-4">
        {/* Title */}
        <div>
          <label className="block text-sm font-semibold text-slate-300 mb-2">📝 Title</label>
          <input 
            className="w-full px-4 py-2 md:py-3 bg-slate-700 text-white rounded-lg border border-slate-600 focus:border-blue-500 focus:outline-none transition text-sm md:text-base" 
            placeholder="e.g., Special Offer" 
            value={form.title} 
            onChange={e=>setForm({...form,title:e.target.value})} 
            required 
          />
        </div>

        {/* Message */}
        <div>
          <label className="block text-sm font-semibold text-slate-300 mb-2">💬 Message</label>
          <textarea 
            className="w-full px-4 py-2 md:py-3 bg-slate-700 text-white rounded-lg border border-slate-600 focus:border-blue-500 focus:outline-none transition resize-none text-sm md:text-base" 
            placeholder="e.g., Check out our exclusive offer just for you!" 
            rows={4} 
            value={form.message} 
            onChange={e=>setForm({...form,message:e.target.value})} 
            required 
          />
        </div>

        {/* Link */}
        <div>
          <label className="block text-sm font-semibold text-slate-300 mb-2">🔗 Link (Optional)</label>
          <input 
            className="w-full px-4 py-2 md:py-3 bg-slate-700 text-white rounded-lg border border-slate-600 focus:border-blue-500 focus:outline-none transition text-sm md:text-base" 
            placeholder="e.g., https://example.com/offer" 
            value={form.link} 
            onChange={e=>setForm({...form,link:e.target.value})} 
          />
        </div>

        {/* Button Text */}
        <div>
          <label className="block text-sm font-semibold text-slate-300 mb-2">🔘 Button Text</label>
          <input 
            className="w-full px-4 py-2 md:py-3 bg-slate-700 text-white rounded-lg border border-slate-600 focus:border-blue-500 focus:outline-none transition text-sm md:text-base" 
            placeholder="e.g., Claim Now" 
            value={form.buttonText} 
            onChange={e=>setForm({...form,buttonText:e.target.value})} 
            required 
          />
        </div>

        {/* Active Checkbox */}
        <label className="flex items-center gap-3 cursor-pointer bg-slate-700/50 p-3 rounded-lg hover:bg-slate-700 transition">
          <input 
            type="checkbox" 
            checked={form.isActive} 
            onChange={e=>setForm({...form,isActive:e.target.checked})} 
            className="w-5 h-5 cursor-pointer accent-blue-600"
          /> 
          <span className="font-medium text-sm md:text-base">✅ Active Now (Enable immediately)</span>
        </label>

        {/* Status Message */}
        {status && (
          <div className={`p-3 rounded-lg text-sm ${
            status.includes('✅') ? 'bg-green-900/30 border border-green-600 text-green-300' : 'bg-yellow-900/30 border border-yellow-600 text-yellow-300'
          }`}>
            {status}
          </div>
        )}

        {/* Submit Button */}
        <button 
          className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-600 disabled:to-gray-700 text-white font-bold py-3 md:py-4 rounded-lg transition flex items-center justify-center gap-2 text-sm md:text-base"
          type="submit"
          disabled={selectedCount === 0 || isLoading}
        >
          {isLoading ? (
            <>
              <Loader size={18} className="animate-spin" />
              Creating... {selectedCount > 1 ? `(${selectedCount})` : ''}
            </>
          ) : (
            <>
              <Send size={18} />
              Create Popup {selectedCount > 1 ? `for ${selectedCount} Users` : ''}
            </>
          )}
        </button>
      </form>
    </div>
  );
}
