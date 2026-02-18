import React, { useEffect, useState } from 'react';
import TargetedSidebar from '../components/TargetedSidebar';
import CreateTargetedPopup from '../components/CreateTargetedPopup';
import { useAdminAuth } from '../context/AdminAuthContext';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { API_CONFIG } from '../config/api.config';

const API_BASE = API_CONFIG.API_BASE;

// use AdminAuthContext token when possible
function getTokenFromContext(admin) {
  return admin?.token || localStorage.getItem('admin_token') || localStorage.getItem('token') || null;
}

export default function TargetedPopupPage(){
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedUsers, setSelectedUsers] = useState([]); // for multi-select
  const [multiSelect, setMultiSelect] = useState(false);
  const [collapsed, setCollapsed] = useState(true); // Default collapsed on mobile
  const [status, setStatus] = useState('Loading users...');

  const { admin } = useAdminAuth();

  useEffect(()=>{ fetchUsers(); }, [admin]);

  const fetchUsers = async (q='') =>{
    setStatus('Loading users...');
    try{
      const token = getTokenFromContext(admin);
      if(!token){ 
        setStatus('❌ No admin token found. Please login.'); 
        setUsers([]); 
        return; 
      }

      // primary: targeted-popups users endpoint
      console.log('📡 Fetching targeted popup users...');
      let res = await fetch(`${API_BASE}/targeted-popups/users?search=${encodeURIComponent(q)}`, { headers: { Authorization: `Bearer ${token}` } });
      
      if (res.status === 401 || res.status === 403) {
        // try fallback to general users endpoint
        console.warn('targeted-popups/users returned', res.status, 'trying /admin/users fallback');
        res = await fetch(`${API_BASE}/admin/users?search=${encodeURIComponent(q)}`, { headers: { Authorization: `Bearer ${token}` } });
      }

      const data = await res.json().catch(()=>null);
      console.log('📦 Targeted popup users response:', data);
      
      if(res.ok && data?.success){ 
        const usersList = data?.data || data?.users || [];
        console.log('✅ Users loaded:', usersList.length);
        setUsers(usersList); 
        setStatus(''); 
      }
      else if(res.ok && Array.isArray(data)) { 
        console.log('✅ Users loaded:', data.length);
        setUsers(data); 
        setStatus(''); 
      }
      else { 
        const errMsg = data?.message || `Failed to load users (status ${res.status})`;
        console.error('❌ Error:', errMsg);
        setUsers([]); 
        setStatus(`❌ ${errMsg}`); 
      }
    }catch(err){ 
      console.error('❌ Error loading users:', err); 
      setStatus('❌ Error loading users. Check console.'); 
      setUsers([]); 
    }
  };

  return (
    <div className="h-[84vh] lg:h-[90vh] min-h-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col lg:flex-row overflow-y-auto">
      {/* Sidebar - Fixed height with internal scroll */}
      <div className="w-full lg:w-80 xl:w-96 bg-slate-800 border-b lg:border-b-0 lg:border-r border-slate-700 flex flex-col min-h-0 max-h-[40vh] lg:max-h-none">
        <div className="p-3 sm:p-4 border-b border-slate-700 flex items-center gap-2 sm:gap-3 justify-between flex-shrink-0">
          <div className="text-slate-300 text-xs sm:text-sm font-medium">User Selection</div>
          <div className="flex items-center gap-2">
            <label className="text-xs text-slate-300 flex items-center gap-1.5 cursor-pointer">
              <input type="checkbox" checked={multiSelect} onChange={e=>setMultiSelect(e.target.checked)} className="w-4 h-4 cursor-pointer" />
              <span className="hidden sm:inline">Multi-select</span>
              <span className="sm:hidden">Multi</span>
            </label>
          </div>
        </div>

        {/* Scrollable sidebar content */}
        <div className="flex-1 min-h-0">
          <TargetedSidebar 
            users={users} 
            selectedId={selectedUser?._id} 
            selectedIds={selectedUsers.map(u=>String(u._id))}
            multiSelect={multiSelect}
            onSelect={u=>{
              setSelectedUser(u);
              setSelectedUsers([u]);
              setCollapsed(true);
            }} 
            onToggleUser={(u, checked) => {
              setSelectedUsers(prev => {
                const id = String(u._id);
                if (checked) return [...prev.filter(x=>String(x._id)!==id), u];
                return prev.filter(x=>String(x._id)!==id);
              });
            }}
            collapsed={collapsed} 
            onToggle={()=>setCollapsed(s=>!s)} 
          />
        </div>
      </div>

      {/* Main Content - Scrollable */}
      <main className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden">
        <div className="min-h-full p-3 sm:p-4 md:p-6 lg:p-8">
          {/* Status Alert */}
          {status && (
            <div className={`mb-4 sm:mb-6 p-3 sm:p-4 rounded-lg flex flex-col sm:flex-row items-start gap-2 sm:gap-3 ${
              status.includes('Error') || status.includes('Failed')
                ? 'bg-red-900/30 border border-red-600 text-red-300'
                : 'bg-blue-900/30 border border-blue-600 text-blue-300'
            }`}>
              <AlertCircle size={18} className="flex-shrink-0 mt-0.5 hidden sm:block" />
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm md:text-base font-medium break-words">{status}</p>
              </div>
              {status.includes('Error') && (
                <button 
                  onClick={() => fetchUsers()}
                  className="flex-shrink-0 w-full sm:w-auto px-3 py-1.5 sm:py-1 bg-blue-600 hover:bg-blue-700 rounded text-xs sm:text-sm transition flex items-center justify-center gap-1"
                >
                  <RefreshCw size={14} /> Retry
                </button>
              )}
            </div>
          )}

          {/* User Count */}
          {users.length > 0 && !status.includes('Error') && (
            <div className="mb-3 sm:mb-4 text-slate-400 text-xs sm:text-sm">
              📊 Total Users: <span className="font-bold text-white">{users.length}</span>
            </div>
          )}

          {/* Form */}
          <div className="overflow-x-auto">
            <CreateTargetedPopup 
              selectedUser={selectedUser} 
              selectedUsers={selectedUsers} 
              multiSelect={multiSelect} 
              onCreated={() => {
                setSelectedUser(null); 
                setSelectedUsers([]);
              }} 
            />
          </div>
        </div>
      </main>
    </div>
  );
}
