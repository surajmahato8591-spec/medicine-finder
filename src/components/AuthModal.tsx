import React, { useState, useEffect } from 'react';
import { 
  X, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  PlusCircle, 
  User,
  Store,
  Info
} from 'lucide-react';
import { UserRole, UserProfile } from '../types';
import { INITIAL_USER, DEMO_USERS } from '../data/mockData';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: UserProfile) => void;
  initialRegister?: boolean;
  initialRole?: UserRole;
  notice?: string | null;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  initialRegister = false,
  initialRole = 'patient',
  notice = null,
}) => {
  if (!isOpen) return null;

  const [isRegister, setIsRegister] = useState(initialRegister);
  const [selectedRole, setSelectedRole] = useState<UserRole>(initialRole);
  const [email, setEmail] = useState('user@medifinder.demo');
  const [password, setPassword] = useState('user123');
  const [name, setName] = useState('Rahul Verma');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const [selectedPharmaAccount, setSelectedPharmaAccount] = useState<'PH001' | 'PH002' | 'PH003'>('PH001');

  useEffect(() => {
    setIsRegister(initialRegister);
    setSelectedRole(initialRole);
    if (initialRole === 'admin') {
      setEmail('surajmahato8591@gmail.com');
      setPassword('123456');
      setName('Suraj Mahato (Admin)');
    } else if (initialRole === 'pharmacy_owner') {
      setEmail('shreesai@medifinder.demo');
      setPassword('pharmacy123');
      setName('Ramesh Gupta (Shree Sai)');
      setSelectedPharmaAccount('PH001');
    } else {
      setEmail('user@medifinder.demo');
      setPassword('user123');
      setName('Rahul Verma');
    }
  }, [initialRegister, initialRole, isOpen]);

  const handleRoleChange = (role: UserRole) => {
    setSelectedRole(role);
    if (role === 'admin') {
      setEmail('surajmahato8591@gmail.com');
      setPassword('123456');
      setName('Suraj Mahato (Admin)');
    } else if (role === 'pharmacy_owner') {
      handlePharmaAccountChange('PH001');
    } else {
      setEmail('user@medifinder.demo');
      setPassword('user123');
      setName('Rahul Verma');
    }
  };

  const handlePharmaAccountChange = (pId: 'PH001' | 'PH002' | 'PH003') => {
    setSelectedPharmaAccount(pId);
    if (pId === 'PH001') {
      setEmail('shreesai@medifinder.demo');
      setPassword('pharmacy123');
      setName('Ramesh Gupta (Shree Sai Medicals)');
    } else if (pId === 'PH002') {
      setEmail('pharmacy@medifinder.demo');
      setPassword('pharmacy123');
      setName('Rajesh Sharma (HealthCare Pharmacy)');
    } else if (pId === 'PH003') {
      setEmail('citymedical@medifinder.demo');
      setPassword('pharmacy123');
      setName('Anil Kumar (City Medical Store)');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const normalized = email.trim().toLowerCase();
    let loggedInUser: UserProfile;

    if (selectedRole === 'admin' || normalized === 'surajmahato8591@gmail.com' || normalized === 'admin@medifinder.demo') {
      loggedInUser = {
        ...DEMO_USERS.admin,
        name: isRegister ? name : 'Suraj Mahato (Admin)',
        email: email.trim(),
        role: 'admin',
      };
    } else if (selectedRole === 'pharmacy_owner' || normalized.includes('shreesai') || normalized.includes('pharmacy') || normalized.includes('citymedical')) {
      if (normalized === 'shreesai@medifinder.demo' || selectedPharmaAccount === 'PH001') {
        loggedInUser = {
          ...DEMO_USERS.shreesai_owner,
          name: isRegister ? name : DEMO_USERS.shreesai_owner.name,
          email: email.trim(),
          role: 'pharmacy_owner',
          managedPharmacyId: 'PH001',
        };
      } else if (normalized === 'citymedical@medifinder.demo' || selectedPharmaAccount === 'PH003') {
        loggedInUser = {
          ...DEMO_USERS.citymedical_owner,
          name: isRegister ? name : DEMO_USERS.citymedical_owner.name,
          email: email.trim(),
          role: 'pharmacy_owner',
          managedPharmacyId: 'PH003',
        };
      } else {
        loggedInUser = {
          ...DEMO_USERS.pharmacy,
          name: isRegister ? name : DEMO_USERS.pharmacy.name,
          email: email.trim(),
          role: 'pharmacy_owner',
          managedPharmacyId: 'PH002',
        };
      }
    } else {
      loggedInUser = {
        ...INITIAL_USER,
        name: isRegister ? name : (name || 'Verified Patient'),
        email: email.trim(),
        role: 'patient',
      };
    }

    onLoginSuccess(loggedInUser);
    onClose();
  };

  const handleGoogleLogin = () => {
    const googleUser: UserProfile = {
      ...INITIAL_USER,
      name: 'Suraj Mahato',
      email: 'surajmahato8591@gmail.com',
      role: 'patient',
    };
    onLoginSuccess(googleUser);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[10000] overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div 
        id="auth-modal-container"
        className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-150 relative"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Top Banner */}
        <div className="pt-7 pb-4 px-6 text-center bg-gradient-to-b from-emerald-50 via-teal-50/40 to-white">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white shadow-lg shadow-emerald-500/20 mb-2">
            <PlusCircle className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-extrabold text-slate-900">
            {isRegister ? 'Create MediFinder Account' : 'Welcome Back'}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {isRegister ? 'Register to check live medicine stock & reserve' : 'Login to MediFinder to continue'}
          </p>

          {/* Action Notice banner if redirected */}
          {notice && (
            <div className="mt-3 p-2.5 bg-emerald-100/90 text-emerald-900 border border-emerald-300 rounded-xl text-xs font-semibold flex items-center gap-2 text-left animate-in slide-in-from-top-1">
              <Info className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>{notice}</span>
            </div>
          )}
        </div>

        {/* Role Selector Tabs */}
        <div className="px-6 pt-1 pb-2">
          <label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-wider mb-1.5 text-center">
            Select Your Role
          </label>
          <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 rounded-2xl border border-slate-200/80">
            <button
              type="button"
              onClick={() => handleRoleChange('patient')}
              className={`py-2 px-1.5 rounded-xl text-[11px] font-bold flex flex-col items-center gap-1 transition-all ${
                selectedRole === 'patient'
                  ? 'bg-white text-emerald-700 shadow-xs border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <User className="w-4 h-4" />
              <span>Patient / User</span>
            </button>
            <button
              type="button"
              onClick={() => handleRoleChange('pharmacy_owner')}
              className={`py-2 px-1.5 rounded-xl text-[11px] font-bold flex flex-col items-center gap-1 transition-all ${
                selectedRole === 'pharmacy_owner'
                  ? 'bg-white text-teal-700 shadow-xs border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Store className="w-4 h-4" />
              <span>Chemist Owner</span>
            </button>
            <button
              type="button"
              onClick={() => handleRoleChange('admin')}
              className={`py-2 px-1.5 rounded-xl text-[11px] font-bold flex flex-col items-center gap-1 transition-all ${
                selectedRole === 'admin'
                  ? 'bg-white text-indigo-700 shadow-xs border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Administrator</span>
            </button>
          </div>

          {/* If Pharmacy Owner role is selected, show demo pharmacy selector pills */}
          {selectedRole === 'pharmacy_owner' && !isRegister && (
            <div className="mt-2.5 p-2 bg-emerald-50/70 border border-emerald-200/80 rounded-2xl">
              <span className="block text-[10px] font-extrabold text-emerald-800 uppercase tracking-wider mb-1.5 text-center">
                Select Store Demo Account:
              </span>
              <div className="grid grid-cols-3 gap-1">
                <button
                  type="button"
                  onClick={() => handlePharmaAccountChange('PH001')}
                  className={`py-1.5 px-1 rounded-xl text-[10px] font-bold text-center border transition-all ${
                    selectedPharmaAccount === 'PH001'
                      ? 'bg-emerald-600 text-white border-emerald-700 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="truncate font-black">Shree Sai</div>
                  <div className="text-[9px] opacity-80 font-mono">PH001</div>
                </button>
                <button
                  type="button"
                  onClick={() => handlePharmaAccountChange('PH002')}
                  className={`py-1.5 px-1 rounded-xl text-[10px] font-bold text-center border transition-all ${
                    selectedPharmaAccount === 'PH002'
                      ? 'bg-emerald-600 text-white border-emerald-700 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="truncate font-black">HealthCare</div>
                  <div className="text-[9px] opacity-80 font-mono">PH002</div>
                </button>
                <button
                  type="button"
                  onClick={() => handlePharmaAccountChange('PH003')}
                  className={`py-1.5 px-1 rounded-xl text-[10px] font-bold text-center border transition-all ${
                    selectedPharmaAccount === 'PH003'
                      ? 'bg-emerald-600 text-white border-emerald-700 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="truncate font-black">City Medical</div>
                  <div className="text-[9px] opacity-80 font-mono">PH003</div>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Form Body */}
        <div className="p-6 pt-2 space-y-3.5">
          <form onSubmit={handleSubmit} className="space-y-3 text-xs">
            {isRegister && (
              <div>
                <label className="block font-bold text-slate-700 mb-1">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your full name"
                    className="w-full pl-9.5 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 font-medium"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block font-bold text-slate-700 mb-1">Email Address / Phone</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                <input
                  type="text"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter email or mobile number"
                  className="w-full pl-9.5 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="w-full pl-9.5 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 font-medium"
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
                onClick={() => alert('Password reset link sent to your email!')}
                className="font-bold text-emerald-600 hover:text-emerald-700"
              >
                Forgot Password?
              </button>
            </div>

            <button
              id="auth-submit-btn"
              type="submit"
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-md shadow-emerald-600/20 transition-all mt-2 cursor-pointer"
            >
              {isRegister ? 'Create Account' : 'Login'}
            </button>
          </form>

          {/* Social Login Separator */}
          <div className="relative flex items-center justify-center my-2">
            <div className="border-t border-slate-200 w-full"></div>
            <span className="bg-white px-3 text-[11px] font-bold text-slate-400 uppercase">or</span>
          </div>

          {/* Google Sign In */}
          <button
            onClick={handleGoogleLogin}
            className="w-full py-2.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
              <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"/>
              <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.02 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
              <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
            </svg>
            <span>Continue with Google</span>
          </button>

          {/* Switch Register/Login */}
          <div className="text-center pt-1 text-xs text-slate-500">
            {isRegister ? (
              <span>
                Already have an account?{' '}
                <button
                  onClick={() => setIsRegister(false)}
                  className="font-bold text-emerald-600 hover:text-emerald-700"
                >
                  Login
                </button>
              </span>
            ) : (
              <span>
                Don't have an account?{' '}
                <button
                  onClick={() => setIsRegister(true)}
                  className="font-bold text-emerald-600 hover:text-emerald-700"
                >
                  Register
                </button>
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
