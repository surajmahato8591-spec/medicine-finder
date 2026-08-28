import React, { useState } from 'react';
import { 
  PlusCircle, 
  User, 
  Store, 
  Menu, 
  X,
  Bell,
  Clock,
  ShieldCheck,
  Sparkles,
  LogOut,
  Bookmark,
  Calendar,
  Pill
} from 'lucide-react';
import { UserProfile, UserRole } from '../types';

export type NavTabType = 
  | 'home' 
  | 'search' 
  | 'search-results' 
  | 'nearby-pharmacies' 
  | 'dashboard' 
  | 'pharmacy-dashboard' 
  | 'admin-dashboard' 
  | 'about' 
  | 'how-it-works';

interface NavbarProps {
  activeTab: NavTabType;
  setActiveTab: (tab: NavTabType) => void;
  currentUser: UserProfile | null;
  onOpenAuth: (isRegister?: boolean, role?: UserRole) => void;
  onLogout: () => void;
  onOpenAiPharmacist: () => void;
  savedCount?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  currentUser,
  onOpenAuth,
  onLogout,
  onOpenAiPharmacist,
  savedCount = 0,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  const isSearchActive = activeTab === 'search' || activeTab === 'search-results';

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          {/* Brand Logo */}
          <div 
            id="medifinder-brand-logo"
            onClick={() => setActiveTab('home')}
            className="flex items-center gap-3 cursor-pointer group select-none"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform duration-200">
              <PlusCircle className="w-6 h-6 stroke-[2.4]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-bold tracking-tight text-slate-900 font-outfit">
                  Medi<span className="text-emerald-600">Finder</span>
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium tracking-wide">Find Medicine. Save Time.</p>
            </div>
          </div>

          {/* Desktop Navigation Links depending on user role */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            <button
              id="nav-tab-home"
              onClick={() => setActiveTab('home')}
              className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
                activeTab === 'home'
                  ? 'bg-emerald-50 text-emerald-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
              }`}
            >
              Home
            </button>

            {/* PATIENT links (Logged in only) */}
            {currentUser && currentUser.role === 'patient' && (
              <>
                <button
                  id="nav-tab-search"
                  onClick={() => setActiveTab('search')}
                  className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
                    isSearchActive
                      ? 'bg-emerald-50 text-emerald-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                  }`}
                >
                  Search Medicine
                </button>
                <button
                  id="nav-tab-map"
                  onClick={() => setActiveTab('nearby-pharmacies')}
                  className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
                    activeTab === 'nearby-pharmacies'
                      ? 'bg-emerald-50 text-emerald-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                  }`}
                >
                  Nearby Pharmacies
                </button>
                <button
                  id="nav-tab-dashboard"
                  onClick={() => setActiveTab('dashboard')}
                  className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
                    activeTab === 'dashboard'
                      ? 'bg-emerald-50 text-emerald-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                  }`}
                >
                  My Dashboard
                </button>
              </>
            )}

            {/* PHARMACY OWNER links */}
            {currentUser && currentUser.role === 'pharmacy_owner' && (
              <>
                <button
                  id="nav-tab-pharmacy-dashboard"
                  onClick={() => setActiveTab('pharmacy-dashboard')}
                  className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
                    activeTab === 'pharmacy-dashboard'
                      ? 'bg-emerald-50 text-emerald-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                  }`}
                >
                  Pharmacy Dashboard
                </button>
                <button
                  id="nav-tab-nearby-pharmacies-pharma"
                  onClick={() => setActiveTab('nearby-pharmacies')}
                  className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
                    activeTab === 'nearby-pharmacies'
                      ? 'bg-emerald-50 text-emerald-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                  }`}
                >
                  Nearby Pharmacies
                </button>
              </>
            )}

            {/* ADMIN links */}
            {currentUser && currentUser.role === 'admin' && (
              <>
                <button
                  id="nav-tab-admin-dashboard"
                  onClick={() => setActiveTab('admin-dashboard')}
                  className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
                    activeTab === 'admin-dashboard'
                      ? 'bg-emerald-50 text-emerald-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                  }`}
                >
                  Admin Dashboard
                </button>
                <button
                  id="nav-tab-nearby-pharmacies-admin"
                  onClick={() => setActiveTab('nearby-pharmacies')}
                  className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
                    activeTab === 'nearby-pharmacies'
                      ? 'bg-emerald-50 text-emerald-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                  }`}
                >
                  Pharmacies Directory
                </button>
              </>
            )}

            {/* Common Public Links (Always shown or unauthenticated) */}
            <button
              id="nav-tab-how-it-works"
              onClick={() => setActiveTab('how-it-works')}
              className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
                activeTab === 'how-it-works'
                  ? 'bg-emerald-50 text-emerald-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
              }`}
            >
              How It Works
            </button>
            <button
              id="nav-tab-about"
              onClick={() => setActiveTab('about')}
              className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
                activeTab === 'about'
                  ? 'bg-emerald-50 text-emerald-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
              }`}
            >
              About Us
            </button>
          </nav>

          {/* Right Side Actions */}
          <div className="flex items-center gap-2.5">
            {/* AI Pharmacist Button (Only available when logged in) */}
            {currentUser && (
              <button
                id="navbar-ai-pharmacist-btn"
                onClick={onOpenAiPharmacist}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-emerald-900 bg-gradient-to-r from-emerald-100 via-teal-100 to-emerald-100 hover:from-emerald-200 hover:to-teal-200 rounded-xl transition-all border border-emerald-300 shadow-xs group cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-emerald-600 group-hover:scale-110 transition-transform" />
                <span className="hidden sm:inline">AI Assistant</span>
              </button>
            )}

            {/* Notification Bell (Logged in users) */}
            {currentUser && (
              <div className="relative">
                <button
                  id="navbar-notification-btn"
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors relative cursor-pointer"
                  aria-label="View notifications"
                >
                  <Bell className="w-5 h-5" />
                  {currentUser.lowStockAlerts > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-amber-500 rounded-full ring-2 ring-white"></span>
                  )}
                </button>

                {showNotifications && (
                  <div 
                    id="notifications-dropdown-menu"
                    className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-slate-200 p-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                  >
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                      <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">Alerts & Reminders</span>
                      <span className="text-[11px] text-emerald-600 font-semibold">{currentUser.reminders.filter(r => r.isActive).length} active</span>
                    </div>
                    <div className="divide-y divide-slate-100 max-h-64 overflow-y-auto">
                      {currentUser.reminders.filter(r => r.isActive).map((rem) => (
                        <div key={rem.id} className="py-2.5 flex items-start gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                            <Clock className="w-3.5 h-3.5" />
                          </div>
                          <div className="text-xs">
                            <p className="font-semibold text-slate-800">{rem.medicineName}</p>
                            <p className="text-slate-500 text-[11px]">{rem.dosage} • {rem.time} ({rem.instructions})</p>
                          </div>
                        </div>
                      ))}
                      {currentUser.reminders.filter(r => r.isActive).length === 0 && (
                        <p className="py-4 text-center text-xs text-slate-400">No active stock or dosage alerts</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Profile Avatar / Login & Register Controls */}
            {currentUser ? (
              <div className="relative">
                <button
                  id="navbar-user-profile-btn"
                  onClick={() => setShowUserDropdown(!showUserDropdown)}
                  className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 transition-all cursor-pointer"
                >
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    className="w-7 h-7 rounded-full object-cover ring-1 ring-slate-200"
                  />
                  <span className="text-xs font-semibold text-slate-800 max-w-[100px] truncate hidden sm:inline">
                    {currentUser.name.split(' ')[0]}
                  </span>
                </button>

                {showUserDropdown && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-slate-200 p-2 z-50 text-xs font-semibold animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="p-3 border-b border-slate-100">
                      <div className="font-extrabold text-slate-900">{currentUser.name}</div>
                      <div className="text-[11px] text-slate-500">{currentUser.email}</div>
                      <div className="mt-1.5 inline-block text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                        {currentUser.role === 'admin' ? 'System Administrator' : currentUser.role === 'pharmacy_owner' ? 'Pharmacy Partner' : 'Verified Patient'}
                      </div>
                    </div>

                    <div className="py-1 space-y-0.5">
                      {currentUser.role === 'patient' && (
                        <button
                          onClick={() => {
                            setActiveTab('dashboard');
                            setShowUserDropdown(false);
                          }}
                          className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-50 text-slate-700 flex items-center gap-2 cursor-pointer"
                        >
                          <User className="w-4 h-4 text-emerald-600" />
                          <span>My Dashboard</span>
                        </button>
                      )}

                      {currentUser.role === 'pharmacy_owner' && (
                        <button
                          onClick={() => {
                            setActiveTab('pharmacy-dashboard');
                            setShowUserDropdown(false);
                          }}
                          className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-50 text-slate-700 flex items-center gap-2 cursor-pointer"
                        >
                          <Store className="w-4 h-4 text-teal-600" />
                          <span>Pharmacy Dashboard</span>
                        </button>
                      )}

                      {currentUser.role === 'admin' && (
                        <button
                          onClick={() => {
                            setActiveTab('admin-dashboard');
                            setShowUserDropdown(false);
                          }}
                          className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-50 text-slate-700 flex items-center gap-2 cursor-pointer"
                        >
                          <ShieldCheck className="w-4 h-4 text-indigo-600" />
                          <span>Admin QA Dashboard</span>
                        </button>
                      )}
                    </div>

                    <div className="pt-1 border-t border-slate-100">
                      <button
                        onClick={() => {
                          setShowUserDropdown(false);
                          onLogout();
                        }}
                        className="w-full text-left px-3 py-2 rounded-xl text-rose-600 hover:bg-rose-50 font-bold flex items-center gap-2 cursor-pointer"
                      >
                        <LogOut className="w-4 h-4 text-rose-500" />
                        <span>Logout</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* LOGGED OUT BUTTONS */
              <div className="flex items-center gap-2">
                <button
                  id="navbar-login-btn"
                  onClick={() => onOpenAuth(false)}
                  className="px-3.5 py-2 text-xs font-bold text-slate-700 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                >
                  Login
                </button>
                <button
                  id="navbar-register-btn"
                  onClick={() => onOpenAuth(true)}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs shadow-emerald-600/20 transition-all cursor-pointer"
                >
                  Register
                </button>
              </div>
            )}

            {/* Mobile Drawer Toggle */}
            <button
              id="mobile-menu-toggle-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div id="mobile-nav-drawer" className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-2 animate-in slide-in-from-top-4 duration-200">
          <button
            onClick={() => { setActiveTab('home'); setMobileMenuOpen(false); }}
            className={`w-full text-left px-3.5 py-2.5 rounded-lg text-sm font-semibold ${
              activeTab === 'home' ? 'bg-emerald-50 text-emerald-700' : 'text-slate-700 hover:bg-slate-50'
            }`}
          >
            Home
          </button>

          {currentUser && currentUser.role === 'patient' && (
            <>
              <button
                onClick={() => { setActiveTab('search'); setMobileMenuOpen(false); }}
                className={`w-full text-left px-3.5 py-2.5 rounded-lg text-sm font-semibold ${
                  isSearchActive ? 'bg-emerald-50 text-emerald-700' : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                Search Medicine
              </button>
              <button
                onClick={() => { setActiveTab('nearby-pharmacies'); setMobileMenuOpen(false); }}
                className={`w-full text-left px-3.5 py-2.5 rounded-lg text-sm font-semibold ${
                  activeTab === 'nearby-pharmacies' ? 'bg-emerald-50 text-emerald-700' : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                Nearby Pharmacies
              </button>
              <button
                onClick={() => { setActiveTab('dashboard'); setMobileMenuOpen(false); }}
                className={`w-full text-left px-3.5 py-2.5 rounded-lg text-sm font-semibold ${
                  activeTab === 'dashboard' ? 'bg-emerald-50 text-emerald-700' : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                My Dashboard
              </button>
            </>
          )}

          {currentUser && currentUser.role === 'pharmacy_owner' && (
            <>
              <button
                onClick={() => { setActiveTab('pharmacy-dashboard'); setMobileMenuOpen(false); }}
                className={`w-full text-left px-3.5 py-2.5 rounded-lg text-sm font-semibold ${
                  activeTab === 'pharmacy-dashboard' ? 'bg-emerald-50 text-emerald-700' : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                Pharmacy Dashboard
              </button>
              <button
                onClick={() => { setActiveTab('nearby-pharmacies'); setMobileMenuOpen(false); }}
                className={`w-full text-left px-3.5 py-2.5 rounded-lg text-sm font-semibold ${
                  activeTab === 'nearby-pharmacies' ? 'bg-emerald-50 text-emerald-700' : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                Nearby Pharmacies
              </button>
            </>
          )}

          {currentUser && currentUser.role === 'admin' && (
            <>
              <button
                onClick={() => { setActiveTab('admin-dashboard'); setMobileMenuOpen(false); }}
                className={`w-full text-left px-3.5 py-2.5 rounded-lg text-sm font-semibold ${
                  activeTab === 'admin-dashboard' ? 'bg-emerald-50 text-emerald-700' : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                Admin Dashboard
              </button>
            </>
          )}

          <button
            onClick={() => { setActiveTab('how-it-works'); setMobileMenuOpen(false); }}
            className={`w-full text-left px-3.5 py-2.5 rounded-lg text-sm font-semibold ${
              activeTab === 'how-it-works' ? 'bg-emerald-50 text-emerald-700' : 'text-slate-700 hover:bg-slate-50'
            }`}
          >
            How It Works
          </button>
          <button
            onClick={() => { setActiveTab('about'); setMobileMenuOpen(false); }}
            className={`w-full text-left px-3.5 py-2.5 rounded-lg text-sm font-semibold ${
              activeTab === 'about' ? 'bg-emerald-50 text-emerald-700' : 'text-slate-700 hover:bg-slate-50'
            }`}
          >
            About Us
          </button>

          {!currentUser && (
            <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
              <button
                onClick={() => { onOpenAuth(false); setMobileMenuOpen(false); }}
                className="flex-1 py-2 text-center text-xs font-bold text-slate-700 border border-slate-200 rounded-xl"
              >
                Login
              </button>
              <button
                onClick={() => { onOpenAuth(true); setMobileMenuOpen(false); }}
                className="flex-1 py-2 text-center text-xs font-bold text-white bg-emerald-600 rounded-xl"
              >
                Register
              </button>
            </div>
          )}

          {currentUser && (
            <div className="pt-2 border-t border-slate-100 space-y-2">
              <div className="px-3.5 py-1 text-xs font-bold text-slate-800">
                Logged in as {currentUser.name} ({currentUser.role})
              </div>
              <button
                onClick={() => { onLogout(); setMobileMenuOpen(false); }}
                className="w-full text-left px-3.5 py-2 rounded-lg text-xs font-bold text-rose-600 hover:bg-rose-50"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
