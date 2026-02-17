import React from 'react';
import axiosInstance from '../utils/axiosInstance';
import TargetedPopupModal from './TargetedPopupModal';
import { useAuth } from '../context/AuthContext';

export default function TargetedPopupManager(){
  const { user } = useAuth();
  const [popup, setPopup] = React.useState(null);
  const [open, setOpen] = React.useState(false);

  React.useEffect(()=>{
    if(!user) return;
    let cancelled = false;
    const fetchPopup = async () =>{
      try{
        const res = await axiosInstance.get('/api/targeted-popups/me');
        if(cancelled) return;
        if(res.status === 200 && res.data?.success && res.data.data){ setPopup(res.data.data); setOpen(true); }
      } catch (err) {
        if (err?.response?.status !== 204) console.error(err);
      }
    };
    fetchPopup();
    return ()=>{ cancelled = true; };
  }, [user]);

  const handleConfirm = async () =>{
    if(!popup) return;
    try{
      await axiosInstance.post(`/api/targeted-popups/${popup._id}/seen`);
      if(popup.link) window.open(popup.link, '_blank', 'noopener,noreferrer');
    }catch(err){ console.error('mark seen error', err); }
    finally{ setOpen(false); setPopup(null); }
  };

  return (
    <TargetedPopupModal open={open} title={popup?.title} message={popup?.message} buttonText={popup?.buttonText || 'Done'} onConfirm={handleConfirm} />
  );
}
