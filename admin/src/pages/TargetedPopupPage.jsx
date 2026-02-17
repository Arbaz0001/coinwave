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
  const [collapsed, setCollapsed] = useState(false);
  const [status, setStatus] = useState('');

  const { admin } = useAdminAuth();

  useEffect(()=>{ fetchUsers(); }, [admin]);

  const fetchUsers = async (q='') =>{
    setStatus('Loading users...');
    try{
      const token = getTokenFromContext(admin);
      if(!token){ setStatus('No admin token found. Please login.'); setUsers([]); return; }

      // primary: targeted-popups users endpoint
      let res = await fetch(`${API_BASE}/targeted-popups/users?search=${encodeURIComponent(q)}`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.status === 401 || res.status === 403) {
        // try fallback to general users endpoint
        console.warn('targeted-popups/users returned', res.status, 'trying /users fallback');
        res = await fetch(`${API_BASE}/users?search=${encodeURIComponent(q)}`, { headers: { Authorization: `Bearer ${token}` } });
      }

      const data = await res.json().catch(()=>null);
      console.log('📦 Targeted popup users response:', data);
      if(res.ok && data && data.success){ setUsers(data.data || []); setStatus(''); }
      else if(res.ok && Array.isArray(data)) { setUsers(data || []); setStatus(''); }
      else { setUsers([]); setStatus(data?.message || `Failed to load users (status ${res.status})`); }
    }catch(err){ console.error('❌ Error loading users:', err); setStatus('Error loading users'); setUsers([]); }
  };

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Sidebar */}
      <div className="w-full md:w-72 bg-slate-800 md:border-r border-slate-700 md:h-screen md:sticky md:top-0 order-2 md:order-1">
        <div className="p-4 border-b border-slate-700 flex items-center gap-3 justify-between">
          <div className="text-slate-300 text-sm">User Selection</div>
          <div className="flex items-center gap-2">
            <label className="text-xs text-slate-300 flex items-center gap-2">
              <input type="checkbox" checked={multiSelect} onChange={e=>setMultiSelect(e.target.checked)} className="w-4 h-4" />
              <span>Multi-select</span>
            </label>
          </div>
        </div>

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

      <main className="flex-1 p-6 overflow-auto order-1 md:order-2">
        {status && <div className="mb-4 text-sm text-yellow-300">{status}</div>}
        <CreateTargetedPopup selectedUser={selectedUser} selectedUsers={selectedUsers} multiSelect={multiSelect} onCreated={() => {setSelectedUser(null); setSelectedUsers([]);}} />
      </main>
    </div>
  );
}
