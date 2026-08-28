import React, { useState } from 'react';
import { 
  X, 
  BellRing, 
  CheckCircle2, 
  MapPin, 
  Phone, 
  Mail, 
  Pill, 
  Sparkles,
  ShieldCheck
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Medicine, MedicineStockAlert } from '../types';

interface StockNotificationModalProps {
  medicine: Medicine | null;
  userLocation: { name: string; lat: number; lng: number } | string;
  onClose: () => void;
  onSubscribeAlert: (alert: MedicineStockAlert) => void;
}

export const StockNotificationModal: React.FC<StockNotificationModalProps> = ({
  medicine,
  userLocation,
  onClose,
  onSubscribeAlert,
}) => {
  if (!medicine) return null;

  const locString = typeof userLocation === 'string' ? userLocation : userLocation?.name || 'Mira Road East';
  const [contactMethod, setContactMethod] = useState<'SMS & WhatsApp' | 'Email'>('SMS & WhatsApp');
  const [phoneNumber, setPhoneNumber] = useState('+91 98765 43210');
  const [emailAddress, setEmailAddress] = useState('suraj.mahato@medifinder.demo');
  const [locationRadius, setLocationRadius] = useState('Within 5 km');
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newAlert: MedicineStockAlert = {
      id: `alert-${Date.now()}`,
      medicineId: medicine.id,
      medicineName: medicine.name,
      location: `${locString} (${locationRadius})`,
      status: 'Waiting',
      timestamp: 'Just now',
    };

    onSubscribeAlert(newAlert);
    setIsSuccess(true);
    confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
    setTimeout(() => {
      onClose();
    }, 2200);
  };

  return (
    <div className="fixed inset-0 z-[10000] overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
      <div 
        id="stock-notification-modal-container"
        className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-150 relative max-h-[92vh] flex flex-col"
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-100 bg-gradient-to-r from-amber-50 via-teal-50/30 to-white flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center font-bold text-xl shadow-md">
              <BellRing className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">Restock Notification Alert</h3>
              <p className="text-xs text-slate-500">Get notified when medicine is available</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isSuccess ? (
          <div className="p-8 text-center space-y-4 my-auto">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto ring-8 ring-emerald-50">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h3 className="text-lg font-black text-slate-900">Alert Activated!</h3>
            <p className="text-xs text-slate-600 max-w-xs mx-auto leading-relaxed">
              We will send you an instant {contactMethod === 'Email' ? 'email' : 'SMS/WhatsApp'} alert as soon as any registered chemist in <strong>{userLocation || 'Mira Road'}</strong> restocks <strong>{medicine.name}</strong>.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 text-xs">
            {/* Medicine details badge */}
            <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-3.5 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center font-bold shrink-0">
                <Pill className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-extrabold text-slate-900">{medicine.name}</h4>
                <p className="text-[11px] text-slate-600">{medicine.genericName} • {medicine.dosage}</p>
                <span className="text-[10px] text-amber-800 font-bold bg-amber-200/60 px-2 py-0.5 rounded-full inline-block mt-0.5">
                  Currently Out of Stock nearby
                </span>
              </div>
            </div>

            {/* Notification preference */}
            <div>
              <label className="block font-bold text-slate-700 mb-1.5">Notification Channel</label>
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => setContactMethod('SMS & WhatsApp')}
                  className={`p-2.5 rounded-xl border font-bold flex items-center justify-center gap-2 transition-all ${
                    contactMethod === 'SMS & WhatsApp'
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-400 ring-2 ring-emerald-400/20'
                      : 'bg-slate-50 text-slate-700 border-slate-200'
                  }`}
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>WhatsApp / SMS</span>
                </button>

                <button
                  type="button"
                  onClick={() => setContactMethod('Email')}
                  className={`p-2.5 rounded-xl border font-bold flex items-center justify-center gap-2 transition-all ${
                    contactMethod === 'Email'
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-400 ring-2 ring-emerald-400/20'
                      : 'bg-slate-50 text-slate-700 border-slate-200'
                  }`}
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Email Alert</span>
                </button>
              </div>
            </div>

            {contactMethod === 'SMS & WhatsApp' ? (
              <div>
                <label className="block font-bold text-slate-700 mb-1">Mobile Number</label>
                <input
                  type="text"
                  required
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                />
              </div>
            ) : (
              <div>
                <label className="block font-bold text-slate-700 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={emailAddress}
                  onChange={(e) => setEmailAddress(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                />
              </div>
            )}

            <div>
              <label className="block font-bold text-slate-700 mb-1">Search Radius</label>
              <select
                value={locationRadius}
                onChange={(e) => setLocationRadius(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium"
              >
                <option value="Within 2 km">Within 2 km of {locString}</option>
                <option value="Within 5 km">Within 5 km (Recommended)</option>
                <option value="Within 10 km">Within 10 km (Wider Area)</option>
              </select>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <BellRing className="w-4 h-4" />
                <span>Notify Me When Stock Arrives</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
