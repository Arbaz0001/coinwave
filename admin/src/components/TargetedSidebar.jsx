import React from 'react';
import { ChevronDown, X } from 'lucide-react';

export default function TargetedSidebar({ users, selectedId, onSelect, collapsed, onToggle, multiSelect = false, selectedIds = [], onToggleUser }) {
  return (
    <>
      {/* Mobile Toggle Button */}
      <button 
        onClick={onToggle}
        className="md:hidden w-full p-3 bg-slate-900 text-white flex items-center justify-between border-b border-slate-700"
      >
        <span className="font-semibold">👥 Select User</span>
        <ChevronDown size={20} className={`transition ${collapsed ? '' : 'rotate-180'}`} />
      </button>

      {/* Sidebar */}
      <aside className={`${
        collapsed ? 'hidden md:block' : 'block'
      } md:block w-full md:w-80 max-h-[70vh] md:max-h-none md:h-full bg-gradient-to-b from-slate-800 to-slate-900 text-white md:border-r border-slate-700 flex flex-col min-h-0`}>
        {/* Header */}
        <div className="p-4 border-b border-slate-700 flex items-center justify-between sticky top-0 bg-slate-800">
          <h3 className="font-bold text-lg">👥 Users</h3>
          {collapsed && <button onClick={onToggle} className="md:hidden text-slate-400 hover:text-white"><X size={20} /></button>}
        </div>

        {/* User List */}
        <div className="overflow-y-scroll flex-1 min-h-0">
          {users && users.length > 0 ? (
            <div className="space-y-1 p-2">
              {users.map((u) => (
                <label
                  key={u._id}
                  className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition duration-200 ${
                    (multiSelect ? selectedIds.includes(String(u._id)) : String(selectedId) === String(u._id))
                      ? 'bg-blue-600 shadow-lg'
                      : 'bg-slate-700 hover:bg-slate-600'
                  }`}>
                  <input
                    type={multiSelect ? 'checkbox' : 'radio'}
                    name={multiSelect ? 'selectedUsers' : 'selectedUser'}
                    checked={multiSelect ? selectedIds.includes(String(u._id)) : String(selectedId) === String(u._id)}
                    onChange={(e) => {
                      if (multiSelect && typeof onToggleUser === 'function') {
                        onToggleUser(u, e.target.checked);
                        return;
                      }
                      if (onSelect) onSelect(u);
                    }}
                    className="w-4 h-4 cursor-pointer"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold text-sm truncate">{u.fullName || u.name || u.email}</div>
                    <div className="text-xs text-slate-300 truncate">{u.email}</div>
                  </div>
                </label>
              ))}
            </div>
          ) : (
            <div className="p-6 text-center text-slate-400">
              <p className="text-sm">❌ No users found</p>
              <p className="text-xs mt-2">Check your connection</p>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
