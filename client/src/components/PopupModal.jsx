import React from "react";

export default function PopupModal({ open, title, message, buttonText = "Continue", onConfirm }) {
  React.useEffect(() => {
    if (!open) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = original; };
  }, [open]);

  if (!open) return null;

  return (
    <div style={overlayStyle} role="dialog" aria-modal="true">
      <div style={modalStyle}>
        <h3 style={{ margin: 0 }}>{title}</h3>
        <div style={{ marginTop: 12, whiteSpace: "pre-wrap" }}>{message}</div>
        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 18 }}>
          <button
            autoFocus
            onClick={() => onConfirm && onConfirm()}
            style={buttonStyle}
          >
            {buttonText}
          </button>
        </div>
      </div>
    </div>
  );
}

const overlayStyle = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.6)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 9999,
};

const modalStyle = {
  width: "90%",
  maxWidth: 520,
  background: "#fff",
  padding: 20,
  borderRadius: 8,
  boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
};

const buttonStyle = {
  padding: "10px 16px",
  background: "#0366d6",
  color: "#fff",
  border: "none",
  borderRadius: 6,
  cursor: "pointer",
};
