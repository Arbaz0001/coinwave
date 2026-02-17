import React from 'react';

export default function TargetedPopupModal({ open, title, message, buttonText = 'Done', onConfirm }){
  React.useEffect(() => {
    if (!open) return;
    const orig = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = orig;
    };
  }, [open]);
  if (!open) return null;
  return (
    <div style={overlay} role="dialog" aria-modal="true">
      <div style={modal} className="transition-transform">
        <h2 className="text-xl font-semibold mb-2">{title}</h2>
        <div className="mb-4 text-sm">{message}</div>
        <div className="flex justify-end">
          <button className="bg-blue-600 text-white px-4 py-2 rounded" onClick={onConfirm}>{buttonText}</button>
        </div>
      </div>
    </div>
  );
}

const overlay = { position:'fixed', inset:0, background:'rgba(0,0,0,0.6)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:9999 };
const modal = { width:'90%', maxWidth:560, background:'#fff', padding:20, borderRadius:8 };
