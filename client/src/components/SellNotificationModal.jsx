import React from 'react';

export default function SellNotificationModal({ open, title, message, buttonText = 'Go to Help Support', redirectUrl = '/help-support', onPrimary, onCancel }){
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
      <div style={modal}>
        <h3 style={{margin:0}}>{title}</h3>
        <p style={{marginTop:12}}>{message}</p>
        <div style={{display:'flex', gap:10, marginTop:18, justifyContent:'flex-end'}}>
          <button onClick={onCancel} style={cancelBtn}>Cancel</button>
          <button onClick={() => onPrimary(redirectUrl)} style={primaryBtn}>{buttonText}</button>
        </div>
      </div>
    </div>
  );
}

const overlay = { position:'fixed', inset:0, background:'rgba(0,0,0,0.6)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:9999 };
const modal = { width:'90%', maxWidth:560, background:'#fff', padding:20, borderRadius:8 };
const primaryBtn = { background:'#0366d6', color:'#fff', padding:'10px 16px', border:'none', borderRadius:6 };
const cancelBtn = { background:'#e5e7eb', color:'#111827', padding:'10px 14px', border:'none', borderRadius:6 };
