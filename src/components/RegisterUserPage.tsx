import React, { useState } from 'react';
import { 
  PlusCircle, 
  User, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  Phone, 
  MapPin, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle,
  Sparkles
} from 'lucide-react';
import { UserProfile } from '../types';
import { POPULAR_LOCATIONS } from '../data/mockData';

interface RegisterUserPageProps {
  onRegisterSuccess: (user: UserProfile) => void;
  onNavigate: (tab: string) => void;
  onShowToast: (msg: string) => void;
}

export const RegisterUserPage: React.FC<RegisterUserPageProps> = ({
  onRegisterSuccess,
  onNavigate,
  onShowToast,
}) => {
  const [fullName, setFullName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [locationName, setLocationName] = useState(POPULAR_LOCATIONS[0].name);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!fullName.trim() || !email.trim() || !password.trim()) {
      setErrorMessage('Please fill in all required fields.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please verify your password.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters.');
      return;
    }

    // Create new patient profile
    const newUser: UserProfile = {
      id: `user-${Date.now()}`,
      name: fullName.trim(),
      email: email.trim(),
      phone: mobileNumber.trim() || '+91 98765 43210',
      role: 'patient',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      searchesThisMonth: 1,
      savedPharmacyIds: [],
      orders: [],
      reminders: [],
      stockAlerts: [],
      recentSearches: [
        { query: 'Paracetamol 650mg', location: locationName, timestamp: 'Just now' }
      ],
      lowStockAlerts: 0,
    };

    onShowToast('Welcome to MediFinder!');
    // Automatic login and direct redirect to /search
    onRegisterSuccess(newUser);
  };

  return (
    <div className="py-8 sm:py-14 bg-slate-50 min-h-[85vh] flex items-center justify-center px-4">
      <div className="w-full max-w-lg space-y-6">
        
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div 
            onClick={() => onNavigate('home')}
            className="inline-flex items-center gap-3 cursor-pointer group select-none mb-1"
          >
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform duration-200">
              <PlusCircle className="w-7 h-7 stroke-[2.4]" />
            </div>
            <div className="text-left">
              <span className="text-2xl font-bold tracking-tight text-slate-900 font-outfit">
                Medi<span className="text-emerald-600">Finder</span>
              </span>
              <p className="text-xs text-slate-500 font-medium">"Find Medicine. Save Time."</p>
            </div>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Patient Registration
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
            Create your account to instantly search medicines across nearby pharmacies and set dose reminders.
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-200/90 relative overflow-hidden">
          
          {/* Badge */}
          <div className="mb-5 flex items-center justify-between p-3 bg-emerald-50 border border-emerald-200 rounded-2xl">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span className="text-xs font-bold text-emerald-800">
                Instant Search Access upon registration
              </span>
            </div>
            <span className="text-[11px] font-extrabold text-emerald-700 bg-white px-2 py-0.5 rounded-md border border-emerald-300">
              FREE
            </span>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleRegister} className="space-y-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Full Name <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
                <input
                  id="reg-fullname-input"
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Rahul Sharma"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-xs sm:text-sm font-medium text-slate-900"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Mobile Number <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
                  <input
                    id="reg-mobile-input"
                    type="tel"
                    required
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value)}
                    placeholder="e.g. 9876543210"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-xs sm:text-sm font-medium text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Email Address <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
                  <input
                    id="reg-email-input"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. rahul@example.com"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-xs sm:text-sm font-medium text-slate-900"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Password <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
                  <input
                    id="reg-password-input"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min. 6 chars"
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-xs sm:text-sm font-medium text-slate-900"
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

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Confirm Password <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
                  <input
                    id="reg-confirm-password-input"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter password"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-xs sm:text-sm font-medium text-slate-900"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Your Primary Location
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-emerald-600 absolute left-3.5 top-3.5 pointer-events-none" />
                <select
                  id="reg-location-select"
                  value={locationName}
                  onChange={(e) => setLocationName(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-xs sm:text-sm font-bold text-slate-800 cursor-pointer"
                >
                  {POPULAR_LOCATIONS.map((loc) => (
                    <option key={loc.name} value={loc.name}>
                      {loc.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Submit Button */}
            <button
              id="register-patient-submit-btn"
              type="submit"
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm rounded-xl shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all cursor-pointer mt-4"
            >
              <span>Register & Find Medicine Immediately</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Links */}
          <div className="mt-5 pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500 text-center">
            <span>
              Already have an account?{' '}
              <button
                onClick={() => onNavigate('login')}
                className="font-bold text-emerald-600 hover:text-emerald-700"
              >
                Login
              </button>
            </span>
            <span>
              Are you a Chemist?{' '}
              <button
                onClick={() => onNavigate('register-pharmacy')}
                className="font-bold text-teal-700 hover:text-teal-800"
              >
                Register Pharmacy
              </button>
            </span>
          </div>

        </div>
      </div>
    </div>
  );
};
