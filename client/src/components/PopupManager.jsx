import React from "react";
import axiosInstance from "../utils/axiosInstance";
import PopupModal from "./PopupModal";
import { useAuth } from "../context/AuthContext";

export default function PopupManager() {
  const { user } = useAuth();
  const [popup, setPopup] = React.useState(null);
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    if (!user) return;

    let cancelled = false;
    const fetchPopup = async () => {
      try {
        const res = await axiosInstance.get(`/api/popups/me`);
        if (cancelled) return;
        if (res.status === 200 && res.data?.success && res.data.data) {
          setPopup(res.data.data);
          setOpen(true);
        }
      } catch (err) {
        if (err.response && err.response.status === 204) {
          // no popup
        } else {
          console.error("Popup fetch error", err);
        }
      }
    };

    fetchPopup();
    return () => { cancelled = true; };
  }, [user]);

  const handleConfirm = async () => {
    if (!popup) return;
    try {
      await axiosInstance.post(`/api/popups/${popup._id}/seen`);
      if (popup.link) {
        window.open(popup.link, "_blank", "noopener,noreferrer");
      }
    } catch (err) {
      console.error("Failed to mark popup seen", err);
    } finally {
      setOpen(false);
      setPopup(null);
    }
  };

  return (
    <PopupModal
      open={open}
      title={popup?.title}
      message={popup?.message}
      buttonText={popup?.buttonText || 'Continue'}
      onConfirm={handleConfirm}
    />
  );
}
