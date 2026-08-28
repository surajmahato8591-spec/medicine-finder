import React, { useState } from 'react';
import { 
  PlusCircle, 
  Store, 
  User, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  Phone, 
  MapPin, 
  FileText, 
  Clock, 
  ArrowRight, 
  AlertCircle,
  ShieldCheck,
  Building2,
  CheckCircle2
} from 'lucide-react';
import { Pharmacy, UserProfile } from '../types';
import { POPULAR_LOCATIONS } from '../data/mockData';

interface RegisterPharmacyPageProps {
  onRegisterPharmacySuccess: (newPharmacy: Pharmacy, ownerUser: UserProfile) => void;
  onNavigate: (tab: string) => void;
  onShowToast: (msg: string) => void;
}

export const RegisterPharmacyPage: React.FC<RegisterPharmacyPageProps> = ({
  onRegisterPharmacySuccess,
  onNavigate,
  onShowToast,
}) => {
  const [ownerName, setOwnerName] = useState('');
  const [pharmacyName, setPharmacyName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [address, setAddress] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [openHours, setOpenHours] = useState('8:00 AM - 11:00 PM (All Days)');
  const [selectedArea, setSelectedArea] = useState('Mira Road East');
  const [is24x7, setIs24x7] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!ownerName.trim() || !pharmacyName.trim() || !email.trim() || !password.trim() || !licenseNumber.trim()) {
      setErrorMessage('Please fill in all mandatory fields marked with an asterisk (*).');
      return;
    }

    const newPharmacyId = `pharma-reg-${Date.now()}`;

    // Create Pharmacy with status: 'pending' and isVerified: false
    const newPharmacy: Pharmacy = {
      id: newPharmacyId,
      name: pharmacyName.trim(),
      tagline: 'Committed to genuine medicines & patient health',
      address: address.trim() || `Shop 1, Near Station, ${selectedArea}`,
      area: selectedArea,
      city: 'Mumbai / Mira Bhayandar',
      pincode: '401107',
      lat: 19.2880 + (Math.random() - 0.5) * 0.02,
      lng: 72.8550 + (Math.random() - 0.5) * 0.02,
      phone: phone.trim() || '+91 98765 00000',
      email: email.trim(),
      ownerName: ownerName.trim(),
      rating: 4.5,
      reviewCount: 1,
      openHours: is24x7 ? 'Open 24 Hours' : openHours,
      isOpenNow: true,
      is24x7,
      isQualityAssured: true,
      hasGenuineMedicines: true,
      hasWheelchairAccess: true,
      colorTag: '#0d9488', // Teal
      licenseNumber: licenseNumber.trim(),
      isVerified: false, // CRITICAL: Verification Pending
      verificationStatus: 'pending',
      registrationDate: new Date().toLocaleDateString('en-GB'),
      inventory: [
        { medicineId: 'med-1', pharmacyId: newPharmacyId, inStockStatus: 'In Stock', stockQuantity: 20, price: 15.0, lastUpdated: 'Just now', expiryDate: '12/2027' },
        { medicineId: 'med-2', pharmacyId: newPharmacyId, inStockStatus: 'In Stock', stockQuantity: 15, price: 62.0, lastUpdated: 'Just now', expiryDate: '08/2026' },
      ],
    };

    // Owner user profile
    const ownerUser: UserProfile = {
      id: `user-pharma-${Date.now()}`,
      name: ownerName.trim(),
      email: email.trim(),
      phone: phone.trim() || '+91 98765 00000',
      role: 'pharmacy_owner',
      avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&auto=format&fit=crop&q=80',
      managedPharmacyId: newPharmacyId,
      searchesThisMonth: 0,
      savedPharmacyIds: [],
      orders: [],
      reminders: [],
      stockAlerts: [],
      recentSearches: [],
      lowStockAlerts: 0,
    };

    onShowToast('Pharmacy registered! Verification is currently pending review.');
    onRegisterPharmacySuccess(newPharmacy, ownerUser);
  };

  return (
    <div className="py-8 sm:py-14 bg-slate-50 min-h-[85vh] flex items-center justify-center px-4">
      <div className="w-full max-w-2xl space-y-6">
        
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div 
            onClick={() => onNavigate('home')}
            className="inline-flex items-center gap-3 cursor-pointer group select-none mb-1"
          >
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-teal-600 to-emerald-500 flex items-center justify-center text-white shadow-lg shadow-teal-500/20 group-hover:scale-105 transition-transform duration-200">
              <Store className="w-7 h-7 stroke-[2.4]" />
            </div>
            <div className="text-left">
              <span className="text-2xl font-bold tracking-tight text-slate-900 font-outfit">
                Medi<span className="text-teal-600">Finder</span>
              </span>
              <p className="text-xs text-slate-500 font-medium">"Find Medicine. Save Time."</p>
            </div>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Register Chemist / Pharmacy
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-lg mx-auto">
            Join MediFinder's certified network. Manage real-time inventory and receive prescription reservation requests from local patients.
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-200/90 relative overflow-hidden">
          
          {/* Verification Notice Banner */}
          <div className="mb-5 p-3.5 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3 text-amber-900">
            <ShieldCheck className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-xs space-y-0.5">
              <p className="font-bold text-amber-950">
                Drug License Verification Process
              </p>
              <p className="text-amber-800 leading-relaxed">
                Upon registration, your status will be set to <strong>"Verification Pending"</strong>. Our compliance team or system admin will verify your license number before granting the green <strong>"✓ Verified Pharmacy"</strong> badge.
              </p>
            </div>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleRegister} className="space-y-4">
            
            {/* Owner & Pharmacy Name */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Owner / Pharmacist Name <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
                  <input
                    id="pharma-owner-name-input"
                    type="text"
                    required
                    value={ownerName}
                    onChange={(e) => setOwnerName(e.target.value)}
                    placeholder="e.g. Rajesh Sharma"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 text-xs sm:text-sm font-medium text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Pharmacy / Shop Name <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Store className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
                  <input
                    id="pharma-shop-name-input"
                    type="text"
                    required
                    value={pharmacyName}
                    onChange={(e) => setPharmacyName(e.target.value)}
                    placeholder="e.g. HealthCare Plus Chemist"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 text-xs sm:text-sm font-medium text-slate-900"
                  />
                </div>
              </div>
            </div>

            {/* Email & Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Official Email <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
                  <input
                    id="pharma-email-input"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. contact@healthcarepharma.com"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 text-xs sm:text-sm font-medium text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Mobile / Store Phone <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
                  <input
                    id="pharma-phone-input"
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. +91 98765 43210"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 text-xs sm:text-sm font-medium text-slate-900"
                  />
                </div>
              </div>
            </div>

            {/* License Number & Area */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Drug License Number <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <FileText className="w-4 h-4 text-teal-600 absolute left-3.5 top-3.5 pointer-events-none" />
                  <input
                    id="pharma-license-input"
                    type="text"
                    required
                    value={licenseNumber}
                    onChange={(e) => setLicenseNumber(e.target.value)}
                    placeholder="e.g. MH-RA-2024-88991"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 text-xs sm:text-sm font-medium text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Area / Zone <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-teal-600 absolute left-3.5 top-3.5 pointer-events-none" />
                  <select
                    id="pharma-area-select"
                    value={selectedArea}
                    onChange={(e) => setSelectedArea(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 text-xs sm:text-sm font-bold text-slate-800 cursor-pointer"
                  >
                    {POPULAR_LOCATIONS.map((loc) => (
                      <option key={loc.name} value={loc.name}>
                        {loc.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Address */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Pharmacy Full Address <span className="text-rose-500">*</span>
              </label>
              <input
                id="pharma-address-input"
                type="text"
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="e.g. Shop 3, Silver Plaza, Near Station Road, Mira Road East"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 text-xs sm:text-sm font-medium text-slate-900"
              />
            </div>

            {/* Hours & Password */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Operating Hours
                </label>
                <div className="relative">
                  <Clock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
                  <input
                    id="pharma-hours-input"
                    type="text"
                    value={openHours}
                    onChange={(e) => setOpenHours(e.target.value)}
                    placeholder="e.g. 8:00 AM - 11:00 PM"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 text-xs sm:text-sm font-medium text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Create Password <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
                  <input
                    id="pharma-password-input"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min. 6 chars"
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 text-xs sm:text-sm font-medium text-slate-900"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Checkboxes */}
            <div className="flex flex-wrap items-center gap-6 pt-1 text-xs text-slate-700 font-semibold">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={is24x7}
                  onChange={(e) => setIs24x7(e.target.checked)}
                  className="rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                />
                <span>Open 24x7 (Emergency Night Counter Service)</span>
              </label>
            </div>

            {/* Submit */}
            <button
              id="register-pharmacy-submit-btn"
              type="submit"
              className="w-full py-3.5 bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-sm rounded-xl shadow-md shadow-teal-600/20 flex items-center justify-center gap-2 transition-all cursor-pointer mt-4"
            >
              <span>Complete Chemist Registration</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Bottom Link */}
          <div className="mt-5 pt-4 border-t border-slate-100 text-center text-xs text-slate-500">
            Already registered?{' '}
            <button
              onClick={() => onNavigate('login')}
              className="font-bold text-teal-700 hover:text-teal-800"
            >
              Login to Chemist Portal
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
