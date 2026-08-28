import React, { useState } from 'react';
import { 
  PlusCircle, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  User, 
  Store, 
  ShieldCheck, 
  CheckCircle2, 
  ArrowRight, 
  KeyRound, 
  AlertCircle,
  Sparkles,
  Phone
} from 'lucide-react';
import { UserRole, UserProfile } from '../types';
import { DEMO_USERS } from '../data/mockData';

interface LoginPageProps {
  onLoginSuccess: (user: UserProfile, redirectTab?: string) => void;
  onNavigate: (tab: string) => void;
  onShowToast: (msg: string) => void;
  initialRole?: UserRole;
  hasActiveSearch?: boolean;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onLoginSuccess,
  onNavigate,
  onShowToast,
  initialRole = 'patient',
  hasActiveSearch = false,
}) => {
  const [selectedRole, setSelectedRole] = useState<UserRole>(initialRole);
  const [emailOrPhone, setEmailOrPhone] = useState('user@medifinder.demo');
  const [password, setPassword] = useState('user123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Quick switch role tab
  const handleRoleChange = (role: UserRole) => {
    setSelectedRole(role);
    setErrorMessage(null);
    if (role === 'patient') {
      setEmailOrPhone('user@medifinder.demo');
      setPassword('user123');
    } else if (role === 'pharmacy_owner') {
      setEmailOrPhone('pharmacy@medifinder.demo');
      setPassword('pharmacy123');
    } else if (role === 'admin') {
      setEmailOrPhone('surajmahato8591@gmail.com');
      setPassword('123456');
    }
  };

  // Direct login with demo account
  const handleQuickDemoLogin = (role: UserRole) => {
    let demoUser: UserProfile;
    if (role === 'admin') {
      demoUser = { 
        ...DEMO_USERS.admin, 
        email: 'surajmahato8591@gmail.com',
        name: 'Suraj Mahato (Admin)' 
      };
      onShowToast('Logged in as Administrator (Suraj Mahato)');
      onLoginSuccess(demoUser, 'admin-dashboard');
    } else if (role === 'pharmacy_owner') {
      demoUser = { ...DEMO_USERS.pharmacy };
      onShowToast('Logged in as Pharmacy Owner');
      onLoginSuccess(demoUser, 'pharmacy-dashboard');
    } else {
      demoUser = { ...DEMO_USERS.patient };
      onShowToast('Welcome to MediFinder!');
      // Directly open /search/results if patient had an active search, else /search
      onLoginSuccess(demoUser, hasActiveSearch ? 'search-results' : 'search');
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!emailOrPhone.trim() || !password.trim()) {
      setErrorMessage('Please enter both email/mobile and password.');
      return;
    }

    const normalizedEmail = emailOrPhone.trim().toLowerCase();

    // Check if logging in as admin (explicit role or admin email)
    if (selectedRole === 'admin' || normalizedEmail === 'surajmahato8591@gmail.com' || normalizedEmail === 'admin@medifinder.demo') {
      const loggedInUser: UserProfile = {
        ...DEMO_USERS.admin,
        email: emailOrPhone.includes('@') ? emailOrPhone.trim() : 'surajmahato8591@gmail.com',
        name: 'Suraj Mahato (Admin)',
        role: 'admin',
      };
      onShowToast('Welcome Administrator Suraj Mahato!');
      onLoginSuccess(loggedInUser, 'admin-dashboard');
      return;
    }

    if (selectedRole === 'pharmacy_owner' || normalizedEmail === 'pharmacy@medifinder.demo') {
      const loggedInUser: UserProfile = {
        ...DEMO_USERS.pharmacy,
        email: emailOrPhone.includes('@') ? emailOrPhone.trim() : 'pharmacy@medifinder.demo',
        role: 'pharmacy_owner',
      };
      onShowToast('Welcome to Pharmacy Portal');
      onLoginSuccess(loggedInUser, 'pharmacy-dashboard');
      return;
    }

    // Patient user
    const loggedInUser: UserProfile = {
      ...DEMO_USERS.patient,
      email: emailOrPhone.includes('@') ? emailOrPhone.trim() : 'user@medifinder.demo',
      role: 'patient',
    };
    onShowToast('Welcome to MediFinder!');
    // Directly open /search/results if patient had an active search, else /search
    onLoginSuccess(loggedInUser, hasActiveSearch ? 'search-results' : 'search');
  };

  return (
    <div className="py-8 sm:py-14 bg-slate-50 min-h-[85vh] flex items-center justify-center px-4">
      <div className="w-full max-w-xl space-y-6">
        
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
            Account Login
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
            Choose your role to access medicine searches, chemist inventory management, or administration.
          </p>
        </div>

        {/* Main Login Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-200/90 relative overflow-hidden">
          
          {/* Role Selector Tabs */}
          <div className="mb-6">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Select Your Role:
            </label>
            <div className="grid grid-cols-3 gap-2 p-1 bg-slate-100/90 rounded-2xl border border-slate-200">
              <button
                type="button"
                id="role-btn-patient"
                onClick={() => handleRoleChange('patient')}
                className={`py-2.5 px-2 rounded-xl text-xs font-extrabold flex flex-col sm:flex-row items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  selectedRole === 'patient'
                    ? 'bg-white text-emerald-700 shadow-sm border border-slate-200/60 ring-2 ring-emerald-500/20'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <User className="w-4 h-4 text-emerald-600" />
                <span>Patient / User</span>
              </button>

              <button
                type="button"
                id="role-btn-pharmacy"
                onClick={() => handleRoleChange('pharmacy_owner')}
                className={`py-2.5 px-2 rounded-xl text-xs font-extrabold flex flex-col sm:flex-row items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  selectedRole === 'pharmacy_owner'
                    ? 'bg-white text-teal-700 shadow-sm border border-slate-200/60 ring-2 ring-teal-500/20'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Store className="w-4 h-4 text-teal-600" />
                <span>Pharmacy Owner</span>
              </button>

              <button
                type="button"
                id="role-btn-admin"
                onClick={() => handleRoleChange('admin')}
                className={`py-2.5 px-2 rounded-xl text-xs font-extrabold flex flex-col sm:flex-row items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  selectedRole === 'admin'
                    ? 'bg-white text-indigo-700 shadow-sm border border-slate-200/60 ring-2 ring-indigo-500/20'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <ShieldCheck className="w-4 h-4 text-indigo-600" />
                <span>Administrator</span>
              </button>
            </div>

            {/* Role Destination Hint */}
            <div className="mt-2.5 text-[11px] text-slate-500 flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200/60">
              <span className="font-semibold text-slate-700">Destination:</span>
              {selectedRole === 'patient' && (
                <span className="text-emerald-700 font-bold">Directly opens /search (Find Your Medicine)</span>
              )}
              {selectedRole === 'pharmacy_owner' && (
                <span className="text-teal-700 font-bold">Opens /pharmacy/dashboard (Inventory & Orders)</span>
              )}
              {selectedRole === 'admin' && (
                <span className="text-indigo-700 font-bold">Opens /admin/dashboard (Verifications & Master Catalogue)</span>
              )}
            </div>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleFormSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Email / Mobile Number
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
                <input
                  id="login-email-input"
                  type="text"
                  required
                  value={emailOrPhone}
                  onChange={(e) => setEmailOrPhone(e.target.value)}
                  placeholder="e.g. user@medifinder.demo or 9876543210"
                  className="w-full pl-10 pr-3.5 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-xs sm:text-sm font-medium text-slate-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
                <input
                  id="login-password-input"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full pl-10 pr-11 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-xs sm:text-sm font-medium text-slate-900"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none text-slate-600">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                />
                <span>Remember me</span>
              </label>
              <button
                type="button"
                onClick={() => onShowToast('Password reset link sent to registered email.')}
                className="font-bold text-emerald-600 hover:text-emerald-700 cursor-pointer"
              >
                Forgot Password?
              </button>
            </div>

            {/* Submit Button */}
            <button
              id="login-submit-btn"
              type="submit"
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm rounded-xl shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all cursor-pointer mt-2"
            >
              <span>Login as {selectedRole === 'admin' ? 'Administrator' : selectedRole === 'pharmacy_owner' ? 'Pharmacy Owner' : 'Patient / User'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Role Quick Selector Link Bar */}
          <div className="mt-4 pt-3 border-t border-slate-100 text-center">
            <span className="text-xs text-slate-500">Login as: </span>
            <button 
              onClick={() => handleRoleChange('patient')}
              className={`text-xs font-bold px-1.5 py-0.5 rounded cursor-pointer ${selectedRole === 'patient' ? 'text-emerald-700 bg-emerald-50' : 'text-slate-600 hover:text-emerald-600'}`}
            >
              Patient
            </button>
            <span className="text-slate-300 mx-1">|</span>
            <button 
              onClick={() => handleRoleChange('pharmacy_owner')}
              className={`text-xs font-bold px-1.5 py-0.5 rounded cursor-pointer ${selectedRole === 'pharmacy_owner' ? 'text-teal-700 bg-teal-50' : 'text-slate-600 hover:text-teal-600'}`}
            >
              Pharmacy
            </button>
            <span className="text-slate-300 mx-1">|</span>
            <button 
              onClick={() => handleRoleChange('admin')}
              className={`text-xs font-bold px-1.5 py-0.5 rounded cursor-pointer ${selectedRole === 'admin' ? 'text-indigo-700 bg-indigo-50' : 'text-slate-600 hover:text-indigo-600'}`}
            >
              Admin
            </button>
          </div>

          {/* Registration Options */}
          <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-2.5 text-xs text-slate-600">
            <span>Don't have an account?</span>
            <div className="flex items-center gap-2">
              <button
                id="create-patient-account-btn"
                onClick={() => onNavigate('register-user')}
                className="font-bold text-emerald-600 hover:text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg border border-emerald-200 transition-colors cursor-pointer"
              >
                Register as Patient
              </button>
              <button
                id="create-pharmacy-account-btn"
                onClick={() => onNavigate('register-pharmacy')}
                className="font-bold text-teal-700 hover:text-teal-800 bg-teal-50 hover:bg-teal-100 px-3 py-1.5 rounded-lg border border-teal-200 transition-colors cursor-pointer"
              >
                Register Pharmacy
              </button>
            </div>
          </div>
        </div>

        {/* 1-Click Demo Accounts Quick Test Panel */}
        <div className="bg-slate-900 text-white rounded-3xl p-5 sm:p-6 shadow-xl space-y-3.5 border border-slate-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <h3 className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-emerald-400">
                1-Click Demo Accounts (Instant Testing)
              </h3>
            </div>
            <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30">
              DEMO ACCOUNTS
            </span>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            Click any demo profile below to instantly log in and test specific role workflows:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {/* Patient Demo */}
            <button
              id="demo-login-patient-btn"
              onClick={() => handleQuickDemoLogin('patient')}
              className="p-3 bg-slate-800/90 hover:bg-emerald-950/60 border border-slate-700 hover:border-emerald-500/60 rounded-2xl text-left transition-all group cursor-pointer"
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-white group-hover:text-emerald-400 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-emerald-400" />
                  Patient / User
                </span>
                <span className="text-[10px] text-emerald-300 bg-emerald-500/20 px-1.5 py-0.5 rounded">1-Click</span>
              </div>
              <div className="text-[11px] text-slate-400 truncate">user@medifinder.demo</div>
              <div className="text-[10px] text-slate-500 font-mono">pwd: user123</div>
              <div className="mt-2 text-[10px] font-semibold text-emerald-400 flex items-center gap-1">
                <span>→ Opens /search</span>
              </div>
            </button>

            {/* Pharmacy Demo */}
            <button
              id="demo-login-pharmacy-btn"
              onClick={() => handleQuickDemoLogin('pharmacy_owner')}
              className="p-3 bg-slate-800/90 hover:bg-teal-950/60 border border-slate-700 hover:border-teal-500/60 rounded-2xl text-left transition-all group cursor-pointer"
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-white group-hover:text-teal-400 flex items-center gap-1.5">
                  <Store className="w-3.5 h-3.5 text-teal-400" />
                  Pharmacy Owner
                </span>
                <span className="text-[10px] text-teal-300 bg-teal-500/20 px-1.5 py-0.5 rounded">1-Click</span>
              </div>
              <div className="text-[11px] text-slate-400 truncate">pharmacy@medifinder.demo</div>
              <div className="text-[10px] text-slate-500 font-mono">pwd: pharmacy123</div>
              <div className="mt-2 text-[10px] font-semibold text-teal-400 flex items-center gap-1">
                <span>→ Opens /pharmacy/dashboard</span>
              </div>
            </button>

            {/* Admin Demo */}
            <button
              id="demo-login-admin-btn"
              onClick={() => handleQuickDemoLogin('admin')}
              className="p-3 bg-slate-800/90 hover:bg-indigo-950/60 border border-slate-700 hover:border-indigo-500/60 rounded-2xl text-left transition-all group cursor-pointer"
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-white group-hover:text-indigo-400 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
                  Administrator
                </span>
                <span className="text-[10px] text-indigo-300 bg-indigo-500/20 px-1.5 py-0.5 rounded">1-Click</span>
              </div>
              <div className="text-[11px] text-slate-400 truncate">surajmahato8591@gmail.com</div>
              <div className="text-[10px] text-slate-500 font-mono">pwd: 123456</div>
              <div className="mt-2 text-[10px] font-semibold text-indigo-400 flex items-center gap-1">
                <span>→ Opens /admin/dashboard</span>
              </div>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
