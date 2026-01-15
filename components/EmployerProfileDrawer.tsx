
import React, { useState, useRef, useEffect } from 'react';
import { EmployerProfile, Location, ShopPhoto } from '../types';

interface EmployerProfileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  profile: EmployerProfile;
  onSave: (p: EmployerProfile) => void;
  isMandatory?: boolean;
}

const INDUSTRY_OPTIONS = [
  "Hotel / Restaurant",
  "Retail / Shop",
  "Automobile / Garage",
  "Construction",
  "Factory / Warehouse",
  "Logistics",
  "Office / Services",
  "Other"
];

const EmployerProfileDrawer: React.FC<EmployerProfileDrawerProps> = ({ isOpen, onClose, profile, onSave, isMandatory = false }) => {
  const [localProfile, setLocalProfile] = useState<EmployerProfile>(profile);
  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setLocalProfile(profile);
      setStep(1);
      setErrors({});
    }
  }, [profile, isOpen]);

  if (!isOpen) return null;

  // If isMandatory is false, it means the user is viewing their profile normally
  const isEditMode = !isMandatory;

  const totalSteps = 5; 
  const progressPercent = Math.round((step / totalSteps) * 100);

  const validateAll = () => {
    const newErrors: Record<string, string> = {};
    if (!localProfile.firstName?.trim()) newErrors.firstName = "Name is required";
    if (!localProfile.shopName?.trim()) newErrors.shopName = "Business name is required";
    if (!localProfile.industry) newErrors.industry = "Industry selection is required";
    if (!localProfile.location?.address?.trim()) newErrors.location = "Location address is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    const newErrors: Record<string, string> = {};
    if (step === 1 && !localProfile.firstName?.trim()) newErrors.firstName = "Name is required";
    if (step === 2) {
      if (!localProfile.shopName?.trim()) newErrors.shopName = "Business name is required";
      if (!localProfile.industry) newErrors.industry = "Industry selection is required";
    }
    if (step === 3 && (!localProfile.location?.address?.trim())) newErrors.location = "Location address is required";
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    if (step < totalSteps) setStep(step + 1);
    else onSave(localProfile);
  };

  const handleSaveEdit = () => {
    if (validateAll()) {
      onSave(localProfile);
    }
  };

  const detectLocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setLocalProfile({
          ...localProfile,
          location: { 
            lat: pos.coords.latitude, 
            lng: pos.coords.longitude, 
            address: "Detected: Latitude " + pos.coords.latitude.toFixed(4), 
            source: 'GPS' 
          }
        });
      }, (err) => {
        setErrors({ location: "GPS failed. Please enter address manually." });
      });
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      setLocalProfile({
        ...localProfile,
        shopPhoto: { url: event.target?.result as string, uploadedAt: new Date().toISOString() }
      });
      setIsUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const renderSignupWizard = () => (
    <>
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Employer Signup</h2>
          <div className="flex items-center gap-3 mt-2">
            <div className="w-32 h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
              <div className="h-full bg-indigo-600 transition-all duration-500" style={{ width: `${progressPercent}%` }}></div>
            </div>
            <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Step {step} of {totalSteps}</span>
          </div>
        </div>
      </div>

      <div className="mt-8">
        {step === 1 && (
          <div className="space-y-6 animate-in slide-in-from-right-4">
            <h3 className="text-xl font-black text-slate-800 leading-tight">Welcome! Let's start with your name.</h3>
            <div>
              <label className="block text-[10px] font-black text-slate-600 uppercase tracking-widest mb-2 px-1">First Name</label>
              <input 
                type="text" autoFocus
                className={`w-full bg-white border-2 rounded-2xl p-5 font-bold text-lg outline-none transition-all ${errors.firstName ? 'border-red-500 bg-red-50' : 'border-slate-400 focus:border-indigo-600'}`}
                value={localProfile.firstName || ''}
                onChange={e => setLocalProfile({...localProfile, firstName: e.target.value})}
              />
            </div>
          </div>
        )}
        {step === 2 && (
          <div className="space-y-6 animate-in slide-in-from-right-4">
            <h3 className="text-xl font-black text-slate-800 leading-tight">Tell us about your business.</h3>
            <div>
              <label className="block text-[10px] font-black text-slate-600 uppercase tracking-widest mb-2 px-1">Business Name</label>
              <input 
                type="text" autoFocus
                className={`w-full bg-white border-2 rounded-2xl p-5 font-bold text-lg outline-none transition-all ${errors.shopName ? 'border-red-500 bg-red-50' : 'border-slate-400 focus:border-indigo-600'}`}
                value={localProfile.shopName || ''}
                onChange={e => setLocalProfile({...localProfile, shopName: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-600 uppercase tracking-widest mb-2 px-1">Industry</label>
              <select className="w-full bg-white border-2 border-slate-400 rounded-2xl p-5 font-bold text-lg focus:border-indigo-600 outline-none cursor-pointer" value={localProfile.industry || ''} onChange={e => setLocalProfile({...localProfile, industry: e.target.value})}>
                <option value="" disabled>Select industry</option>
                {INDUSTRY_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </div>
          </div>
        )}
        {step === 3 && (
          <div className="space-y-6 animate-in slide-in-from-right-4 text-center">
            <h3 className="text-xl font-black text-slate-800 leading-tight">Where is your shop?</h3>
            <button onClick={detectLocation} className="w-full py-5 bg-indigo-50 text-indigo-700 border-2 border-indigo-200 rounded-2xl font-black uppercase text-[11px] tracking-widest active:scale-95 transition-transform"><i className="fa-solid fa-location-crosshairs mr-2"></i> Detect GPS Location</button>
            <textarea className="w-full bg-white border-2 border-slate-400 rounded-2xl p-5 font-bold text-sm min-h-[100px] outline-none focus:border-indigo-600 transition-all" placeholder="Enter manual address" value={localProfile.location?.address || ''} onChange={e => setLocalProfile({...localProfile, location: { lat: 0, lng: 0, address: e.target.value, source: 'MANUAL' }})} />
          </div>
        )}
        {step === 4 && (
          <div className="space-y-6 animate-in slide-in-from-right-4">
            <h3 className="text-xl font-black text-slate-800 leading-tight">Shop Photo</h3>
            <div onClick={() => fileInputRef.current?.click()} className="aspect-video w-full rounded-[32px] border-4 border-dashed border-slate-400 flex flex-col items-center justify-center cursor-pointer overflow-hidden bg-slate-50 active:bg-slate-100 transition-all">
              {localProfile.shopPhoto ? <img src={localProfile.shopPhoto.url} className="w-full h-full object-cover" alt="Shop" /> : <i className="fa-solid fa-camera text-4xl text-slate-300"></i>}
            </div>
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
          </div>
        )}
        {step === 5 && (
          <div className="space-y-6 animate-in slide-in-from-right-4">
            <h3 className="text-xl font-black text-slate-800 leading-tight">Verify & Submit</h3>
            <div className="bg-slate-50 border-2 border-slate-300 rounded-[32px] p-6 space-y-4 shadow-inner text-left">
              <p className="text-sm font-bold"><strong>Name:</strong> {localProfile.firstName}</p>
              <p className="text-sm font-bold"><strong>Business:</strong> {localProfile.shopName}</p>
              <p className="text-sm font-bold"><strong>Location:</strong> {localProfile.location?.address}</p>
            </div>
          </div>
        )}
      </div>

      <div className="mt-12 flex gap-4">
        {step > 1 && <button onClick={() => setStep(step - 1)} className="flex-1 py-5 font-black text-slate-500 uppercase tracking-widest text-[11px] border-2 border-slate-300 rounded-2xl active:scale-95 transition-all">Back</button>}
        <button onClick={handleNext} className="flex-[1.5] bg-indigo-600 text-white py-5 rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-xl active:scale-95 transition-all border-b-4 border-indigo-800">
          {step === totalSteps ? 'Final Submit' : 'Continue'}
        </button>
      </div>
    </>
  );

  const renderEditForm = () => (
    <div className="space-y-8 pb-10">
      <div className="flex justify-between items-center mb-6">
        <div className="text-left">
          <h2 className="text-2xl font-black text-slate-900 tracking-tight leading-none">My Profile</h2>
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-2">Manage your business account</p>
        </div>
        <button onClick={onClose} className="w-10 h-10 bg-slate-50 border-2 border-slate-200 rounded-full flex items-center justify-center text-slate-400 active:scale-90 transition-all shadow-sm"><i className="fa-solid fa-xmark"></i></button>
      </div>

      <div className="space-y-6 text-left">
        <div>
          <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 px-1">Employer Name</label>
          <input 
            className={`w-full bg-white border-2 rounded-2xl p-4 font-bold text-slate-700 outline-none transition-all ${errors.firstName ? 'border-red-500 bg-red-50' : 'border-slate-400 focus:border-indigo-600'}`} 
            value={localProfile.firstName || ''} 
            onChange={e => setLocalProfile({...localProfile, firstName: e.target.value})} 
          />
        </div>
        <div>
          <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 px-1">Business Name</label>
          <input 
            className={`w-full bg-white border-2 rounded-2xl p-4 font-bold text-slate-700 outline-none transition-all ${errors.shopName ? 'border-red-500 bg-red-50' : 'border-slate-400 focus:border-indigo-600'}`} 
            value={localProfile.shopName || ''} 
            onChange={e => setLocalProfile({...localProfile, shopName: e.target.value})} 
          />
        </div>
        <div>
          <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 px-1">Industry</label>
          <select className="w-full bg-white border-2 border-slate-400 rounded-2xl p-4 font-bold text-slate-700 cursor-pointer outline-none focus:border-indigo-600" value={localProfile.industry || ''} onChange={e => setLocalProfile({...localProfile, industry: e.target.value})}>
            {INDUSTRY_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
          </select>
        </div>
        <div>
          <div className="flex justify-between items-center mb-2 px-1">
            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest">Office / Shop Address</label>
            <button onClick={detectLocation} className="text-[9px] font-black text-indigo-600 uppercase tracking-widest active:scale-90"><i className="fa-solid fa-location-crosshairs mr-1"></i> Use GPS</button>
          </div>
          <textarea 
            className={`w-full bg-white border-2 rounded-2xl p-4 font-bold text-slate-700 min-h-[100px] outline-none transition-all ${errors.location ? 'border-red-500 bg-red-50' : 'border-slate-400 focus:border-indigo-600'}`} 
            value={localProfile.location?.address || ''} 
            onChange={e => setLocalProfile({...localProfile, location: { ...localProfile.location!, lat: 0, lng: 0, address: e.target.value }})} 
          />
        </div>
        <div>
          <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 px-1">Shop Photo</label>
          <div onClick={() => fileInputRef.current?.click()} className="aspect-video w-full rounded-[32px] border-4 border-dashed border-slate-400 flex items-center justify-center cursor-pointer overflow-hidden bg-slate-50 active:bg-slate-100 transition-all">
            {localProfile.shopPhoto ? <img src={localProfile.shopPhoto.url} className="w-full h-full object-cover" alt="Shop" /> : <i className="fa-solid fa-camera text-4xl text-slate-300"></i>}
          </div>
          <input type="file" className="hidden" ref={fileInputRef} accept="image/*" onChange={handleImageUpload} />
        </div>
      </div>

      <button onClick={handleSaveEdit} className="w-full bg-indigo-600 text-white py-5 rounded-2xl font-black uppercase tracking-widest shadow-xl active:scale-95 transition-all border-b-4 border-indigo-800 mt-10">
        Update Profile
      </button>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[600] flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-t-[40px] sm:rounded-[40px] p-8 shadow-2xl animate-in slide-in-from-bottom-10 duration-300 max-h-[95vh] overflow-y-auto no-scrollbar border-t border-slate-200">
        {isEditMode ? renderEditForm() : renderSignupWizard()}
      </div>
    </div>
  );
};

export default EmployerProfileDrawer;
