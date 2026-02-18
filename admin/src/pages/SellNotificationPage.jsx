import React, { useEffect, useState } from 'react';
import SellNotificationSidebar from '../components/SellNotificationSidebar';
import CreateSellNotification from '../components/CreateSellNotification';
import SellNotificationList from '../components/SellNotificationList';
import { useAdminAuth } from '../context/AdminAuthContext';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { API_CONFIG } from '../config/api.config';

const API_BASE = API_CONFIG.API_BASE;

function getTokenFromContext(admin) {
  return admin?.token || localStorage.getItem('admin_token') || localStorage.getItem('admin_token') || localStorage.getItem('token') || null;
}

export default function SellNotificationPage(){
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedUsers, setSelectedUsers] = useState([]); // for multi-select
  const [multiSelect, setMultiSelect] = useState(false);
  const [collapsed, setCollapsed] = useState(true); // Default collapsed on mobile
  const [status, setStatus] = useState('Loading users...');
  const [isLoading, setIsLoading] = useState(true);
  const [refreshList, setRefreshList] = useState(0);

  const { admin } = useAdminAuth();

  useEffect(()=>{ fetchUsers(); }, [admin]);

  const fetchUsers = async (q='') =>{
    setIsLoading(true);
    setStatus('Loading users...');
    try{
      const token = getTokenFromContext(admin);
      console.log('🔍 Token check:', token ? '✅ Found' : '❌ Not found');
      
      if(!token){ 
        setStatus('❌ No admin token found. Please login.'); 
        setUsers([]); 
        setIsLoading(false);
        return; 
      }
      // Use admin-scoped users endpoint
      console.log('📡 Fetching users from:', `${API_BASE}/admin/users`);

      // Fetch users
      let res = await fetch(`${API_BASE}/admin/users?search=${encodeURIComponent(q)}`, { 
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        } 
      });
      
      console.log('📥 Response status:', res.status);
      
      const data = await res.json().catch((err)=>{
        console.error('❌ JSON parse error:', err);
        return null;
      });

      console.log('📦 Response data:', data);

      // Support multiple response shapes: { success:true, users: [...] } or { success:true, data: [...] } or plain array
      if (res.ok && data) {
        const usersList = data.users || data.data || (Array.isArray(data) ? data : null);
        if (Array.isArray(usersList)) {
          console.log('✅ Users loaded:', usersList.length);
          setUsers(usersList);
          setStatus('');
        } else {
          const errMsg = data?.message || `Unexpected response shape (status ${res.status})`;
          console.error('❌ Error:', errMsg);
          setUsers([]);
          setStatus(`❌ ${errMsg}`);
        }
      } else {
        const errMsg = data?.message || `Failed to load users (status ${res.status})`;
        console.error('❌ Error:', errMsg);
        setUsers([]);
        setStatus(`❌ ${errMsg}`);
      }
    }catch(err){ 
      console.error('❌ Fetch error:', err); 
      setStatus('❌ Error loading users. Check console.'); 
      setUsers([]); 
    }
    finally {
      setIsLoading(false);
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
          <SellNotificationSidebar 
          users={users} 
          selectedId={selectedUser?._id} 
          selectedIds={selectedUsers.map(u=>String(u._id))}
          multiSelect={multiSelect}
          onSelect={u=>{
            setSelectedUser(u);
            setSelectedUsers([u]);
            setCollapsed(true); // Auto-close sidebar on mobile after selection
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
        <div className="min-h-full p-3 sm:p-4 md:p-6 lg:p-8 flex flex-col">
          {/* Top Alert */}
          {status && (
            <div className={`mb-4 sm:mb-6 p-3 sm:p-4 rounded-lg flex flex-col sm:flex-row items-start gap-2 sm:gap-3 ${
              status.includes('✅') || !status.includes('❌')
                ? 'bg-blue-900/30 border border-blue-600 text-blue-300'
                : 'bg-red-900/30 border border-red-600 text-red-300'
            }`}>
              <AlertCircle size={18} className="flex-shrink-0 mt-0.5 hidden sm:block" />
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm md:text-base font-medium break-words">{status}</p>
                {isLoading && <p className="text-xs mt-1 opacity-75">Please wait...</p>}
              </div>
              {!isLoading && status.includes('Error') && (
                <button 
                  onClick={() => fetchUsers()}
                  className="flex-shrink-0 w-full sm:w-auto px-3 py-1.5 sm:py-1 bg-red-600 hover:bg-red-700 rounded text-xs sm:text-sm transition flex items-center justify-center gap-1"
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
          <div className="mb-6 sm:mb-8">
            <CreateSellNotification 
              selectedUser={selectedUser}
              selectedUsers={selectedUsers}
              multiSelect={multiSelect}
              onCreated={() => {
                setRefreshList(r => r + 1);
                setSelectedUser(null);
                setSelectedUsers([]);
              }} 
            />
          </div>

          {/* List Section */}
          <div className="bg-slate-800/50 rounded-lg p-3 sm:p-4 md:p-6 border border-slate-700 overflow-x-auto">
            <SellNotificationList key={refreshList} />
          </div>
        </div>
      </main>
    </div>
  );
}
