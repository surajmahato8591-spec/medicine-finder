import React, { useState } from 'react';
import { 
  User, 
  Search, 
  Bookmark, 
  ShoppingBag, 
  Bell, 
  Clock, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  AlertCircle, 
  Phone, 
  Navigation, 
  ArrowRight, 
  Settings, 
  LogOut,
  Calendar,
  Sparkles,
  Pill,
  ChevronRight,
  ShieldCheck,
  Store
} from 'lucide-react';
import { UserProfile, Pharmacy, MedicineReminder, Medicine, OrderRequest } from '../types';

interface UserDashboardProps {
  user: UserProfile;
  pharmacies: Pharmacy[];
  onSearchQuery: (query: string) => void;
  onSelectPharmacy: (pharmacy: Pharmacy) => void;
  onOpenDirections: (pharmacy: Pharmacy) => void;
  onAddReminder: (reminder: Omit<MedicineReminder, 'id'>) => void;
  onToggleReminder: (id: string) => void;
  onDeleteReminder: (id: string) => void;
  onToggleBookmark: (pharmacyId: string) => void;
  onOpenOrderModal: () => void;
}

export const UserDashboard: React.FC<UserDashboardProps> = ({
  user,
  pharmacies,
  onSearchQuery,
  onSelectPharmacy,
  onOpenDirections,
  onAddReminder,
  onToggleReminder,
  onDeleteReminder,
  onToggleBookmark,
  onOpenOrderModal,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'reminders' | 'bookmarks' | 'orders' | 'alerts'>('overview');
  const [showAddReminderModal, setShowAddReminderModal] = useState(false);

  // New reminder form state
  const [newMedName, setNewMedName] = useState('');
  const [newDosage, setNewDosage] = useState('1 Tablet');
  const [newTime, setNewTime] = useState('08:00 AM');
  const [newFrequency, setNewFrequency] = useState<'Once Daily' | 'Twice Daily' | 'Thrice Daily' | 'As Needed'>('Twice Daily');
  const [newInstructions, setNewInstructions] = useState<'Before Food' | 'After Food' | 'With Water'>('After Food');

  const handleCreateReminder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMedName.trim()) return;
    onAddReminder({
      medicineName: newMedName.trim(),
      dosage: newDosage,
      time: newTime,
      frequency: newFrequency,
      instructions: newInstructions,
      isActive: true,
      startDate: new Date().toISOString().split('T')[0],
    });
    setNewMedName('');
    setShowAddReminderModal(false);
  };

  const bookmarkedPharmacies = pharmacies.filter((p) =>
    user.savedPharmacyIds.includes(p.id)
  );

  return (
    <div className="py-6 sm:py-10 bg-slate-50 min-h-[85vh]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Dashboard Container */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Sidebar Menu */}
          <div className="lg:col-span-3 space-y-4">
            {/* User Profile Card */}
            <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-sm text-center">
              <div className="relative inline-block">
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-20 h-20 rounded-full object-cover mx-auto ring-4 ring-emerald-100 shadow-md"
                />
                <span className="absolute bottom-0 right-0 w-5 h-5 bg-emerald-500 rounded-full ring-2 ring-white flex items-center justify-center text-white text-[10px]">
                  ✓
                </span>
              </div>
              <h2 className="text-base font-extrabold text-slate-900 mt-3">{user.name}</h2>
              <p className="text-xs text-slate-500">{user.email}</p>
              <p className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full inline-block mt-2 border border-emerald-200">
                Verified Patient Profile
              </p>
            </div>

            {/* Sidebar Navigation Links */}
            <div className="bg-white rounded-3xl p-3 border border-slate-200/90 shadow-sm space-y-1 text-xs font-bold text-slate-700">
              <button
                onClick={() => setActiveTab('overview')}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all ${
                  activeTab === 'overview'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'hover:bg-slate-100 text-slate-700'
                }`}
              >
                <Search className="w-4 h-4" />
                <span>Dashboard Overview</span>
              </button>

              <button
                onClick={() => setActiveTab('reminders')}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all ${
                  activeTab === 'reminders'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'hover:bg-slate-100 text-slate-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Clock className="w-4 h-4" />
                  <span>Medicine Reminders</span>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full ${activeTab === 'reminders' ? 'bg-emerald-700 text-white' : 'bg-slate-100 text-slate-700'}`}>
                  {user.reminders.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('bookmarks')}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all ${
                  activeTab === 'bookmarks'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'hover:bg-slate-100 text-slate-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Bookmark className="w-4 h-4" />
                  <span>Saved Pharmacies</span>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full ${activeTab === 'bookmarks' ? 'bg-emerald-700 text-white' : 'bg-slate-100 text-slate-700'}`}>
                  {user.savedPharmacyIds.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('orders')}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all ${
                  activeTab === 'orders'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'hover:bg-slate-100 text-slate-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <ShoppingBag className="w-4 h-4" />
                  <span>My Orders / Requests</span>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full ${activeTab === 'orders' ? 'bg-emerald-700 text-white' : 'bg-slate-100 text-slate-700'}`}>
                  {user.orders.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('alerts')}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all ${
                  activeTab === 'alerts'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'hover:bg-slate-100 text-slate-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Bell className="w-4 h-4" />
                  <span>Restock Alerts</span>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full ${activeTab === 'alerts' ? 'bg-emerald-700 text-white' : 'bg-slate-100 text-slate-700'}`}>
                  {user.stockAlerts ? user.stockAlerts.length : 2}
                </span>
              </button>
            </div>

            {/* Quick Store Pickup Reservation Banner */}
            <div className="bg-gradient-to-br from-emerald-600 to-teal-700 text-white rounded-3xl p-5 shadow-lg space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center">
                <Store className="w-5 h-5 text-emerald-200" />
              </div>
              <div>
                <h4 className="text-sm font-bold">Need Medicine Saved for You?</h4>
                <p className="text-xs text-emerald-100 mt-1 leading-relaxed">
                  Reserve medicine for direct counter pickup at certified pharmacies near you.
                </p>
              </div>
              <button
                onClick={onOpenOrderModal}
                className="w-full py-2 bg-white text-emerald-800 text-xs font-extrabold rounded-xl shadow-xs hover:bg-emerald-50 transition-colors"
              >
                Reserve for Pickup
              </button>
            </div>
          </div>

          {/* Right Main Content Area */}
          <div className="lg:col-span-9 space-y-6">
            
            {/* Top Greeting */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/90 shadow-sm">
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 flex items-center gap-2">
                  <span>Hello, {user.name.split(' ')[0]}!</span>
                  <span className="text-2xl animate-wave">👋</span>
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  Stay healthy, stay safe. Manage your medicine stock checks and daily reminders.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowAddReminderModal(true)}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>New Reminder</span>
                </button>
              </div>
            </div>

            {/* 4 Metric Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
              
              <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                  <Search className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xl font-extrabold text-slate-900">{user.searchesThisMonth}</div>
                  <div className="text-[11px] text-slate-500 font-medium leading-tight">Searches This Month</div>
                </div>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center shrink-0">
                  <Bookmark className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xl font-extrabold text-slate-900">{user.savedPharmacyIds.length}</div>
                  <div className="text-[11px] text-slate-500 font-medium leading-tight">Bookmarked Stores</div>
                </div>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center shrink-0">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xl font-extrabold text-slate-900">{user.orders.length}</div>
                  <div className="text-[11px] text-slate-500 font-medium leading-tight">Orders / Requests</div>
                </div>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                  <Bell className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xl font-extrabold text-slate-900">{user.lowStockAlerts}</div>
                  <div className="text-[11px] text-slate-500 font-medium leading-tight">Low Stock Alerts</div>
                </div>
              </div>
            </div>

            {/* TAB CONTENT: Overview */}
            {activeTab === 'overview' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Recent Searches Card */}
                <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                      <Search className="w-4 h-4 text-emerald-600" />
                      <span>Recent Searches</span>
                    </h3>
                    <span className="text-[11px] text-slate-400">1-tap re-search</span>
                  </div>

                  <div className="divide-y divide-slate-100">
                    {user.recentSearches.map((item, idx) => (
                      <div
                        key={idx}
                        onClick={() => onSearchQuery(item.query)}
                        className="py-3 flex items-center justify-between cursor-pointer hover:bg-slate-50 px-2 rounded-xl transition-colors group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                            <Search className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-800 group-hover:text-emerald-700">{item.query}</p>
                            <p className="text-[10px] text-slate-400">{item.location}</p>
                          </div>
                        </div>
                        <span className="text-[10px] font-semibold text-slate-400">{item.timestamp}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Active Reminders Card */}
                <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                      <Clock className="w-4 h-4 text-emerald-600" />
                      <span>Upcoming Medicine Doses</span>
                    </h3>
                    <button
                      onClick={() => setActiveTab('reminders')}
                      className="text-[11px] font-bold text-emerald-600 hover:text-emerald-700"
                    >
                      View All ({user.reminders.length})
                    </button>
                  </div>

                  <div className="space-y-2.5">
                    {user.reminders.slice(0, 3).map((rem) => (
                      <div
                        key={rem.id}
                        className={`p-3 rounded-2xl border flex items-center justify-between gap-3 ${
                          rem.isActive ? 'bg-emerald-50/40 border-emerald-200/80' : 'bg-slate-50 border-slate-200 opacity-60'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
                            <Pill className="w-4 h-4" />
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-slate-800">{rem.medicineName}</h4>
                            <p className="text-[11px] text-slate-500">{rem.dosage} • {rem.time} ({rem.instructions})</p>
                          </div>
                        </div>

                        <button
                          onClick={() => onToggleReminder(rem.id)}
                          className={`w-8 h-5 rounded-full transition-colors relative ${
                            rem.isActive ? 'bg-emerald-600' : 'bg-slate-300'
                          }`}
                        >
                          <span
                            className={`block w-4 h-4 rounded-full bg-white transition-transform ${
                              rem.isActive ? 'translate-x-3.5' : 'translate-x-0.5'
                            }`}
                          />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            )}

            {/* TAB CONTENT: Reminders Manager */}
            {activeTab === 'reminders' && (
              <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-extrabold text-slate-900">Medicine Reminders & Timers</h3>
                    <p className="text-xs text-slate-500">Configure notifications to never miss your prescribed medicine dosage.</p>
                  </div>
                  <button
                    onClick={() => setShowAddReminderModal(true)}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Reminder</span>
                  </button>
                </div>

                <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden">
                  {user.reminders.map((rem) => (
                    <div key={rem.id} className="p-4 hover:bg-slate-50/80 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3.5">
                        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-sm ${
                          rem.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-400'
                        }`}>
                          <Clock className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-bold text-slate-900">{rem.medicineName}</h4>
                            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                              {rem.frequency}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5">
                            {rem.dosage} • Time: <strong>{rem.time}</strong> • Take: <strong>{rem.instructions}</strong>
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => onToggleReminder(rem.id)}
                          className={`w-10 h-6 rounded-full transition-colors relative ${
                            rem.isActive ? 'bg-emerald-600' : 'bg-slate-300'
                          }`}
                        >
                          <span
                            className={`block w-5 h-5 rounded-full bg-white transition-transform ${
                              rem.isActive ? 'translate-x-4.5' : 'translate-x-0.5'
                            }`}
                          />
                        </button>

                        <button
                          onClick={() => onDeleteReminder(rem.id)}
                          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                          title="Delete reminder"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB CONTENT: Bookmarks */}
            {activeTab === 'bookmarks' && (
              <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm space-y-6">
                <div>
                  <h3 className="text-lg font-extrabold text-slate-900">Saved & Bookmarked Pharmacies</h3>
                  <p className="text-xs text-slate-500">Quick access to your preferred chemists and contact numbers.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {bookmarkedPharmacies.map((pharmacy) => (
                    <div
                      key={pharmacy.id}
                      className="bg-slate-50/80 p-4 rounded-2xl border border-slate-200 hover:border-emerald-300 transition-all space-y-3"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div 
                            style={{ backgroundColor: pharmacy.colorTag }}
                            className="w-10 h-10 rounded-xl text-white flex items-center justify-center font-bold text-sm"
                          >
                            +
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-slate-900">{pharmacy.name}</h4>
                            <p className="text-[11px] text-slate-500">{pharmacy.area}</p>
                          </div>
                        </div>

                        <button
                          onClick={() => onToggleBookmark(pharmacy.id)}
                          className="text-emerald-600 hover:text-emerald-700"
                        >
                          <Bookmark className="w-4 h-4 fill-emerald-600" />
                        </button>
                      </div>

                      <div className="flex items-center gap-2 pt-2 border-t border-slate-200/70">
                        <a
                          href={`tel:${pharmacy.phone}`}
                          className="flex-1 py-1.5 bg-white hover:bg-slate-100 text-slate-800 text-xs font-bold rounded-lg border border-slate-200 flex items-center justify-center gap-1"
                        >
                          <Phone className="w-3 h-3 text-emerald-600" /> Call
                        </a>
                        <button
                          onClick={() => onOpenDirections(pharmacy)}
                          className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg flex items-center justify-center gap-1"
                        >
                          <Navigation className="w-3 h-3" /> Route
                        </button>
                        <button
                          onClick={() => onSelectPharmacy(pharmacy)}
                          className="px-2.5 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold rounded-lg"
                        >
                          Details
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB CONTENT: Orders / Requests */}
            {activeTab === 'orders' && (
              <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-extrabold text-slate-900">Medicine Reservations & Requests</h3>
                    <p className="text-xs text-slate-500">Track order fulfillment and pickup readiness.</p>
                  </div>
                  <button
                    onClick={onOpenOrderModal}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs"
                  >
                    + Place New Request
                  </button>
                </div>

                <div className="space-y-3">
                  {user.orders.map((order) => (
                    <div key={order.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-extrabold text-slate-900">#{order.id}</span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            order.status === 'Completed'
                              ? 'bg-slate-100 text-slate-700'
                              : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          }`}>
                            {order.status}
                          </span>
                        </div>
                        <h4 className="text-sm font-extrabold text-slate-900 mt-1">{order.medicineName} ({order.quantity} x {order.packSize})</h4>
                        <p className="text-xs text-slate-500">Pharmacy: <strong>{order.pharmacyName}</strong> • Placed: {order.timestamp}</p>
                      </div>

                      <div className="text-right sm:border-l sm:border-slate-200 sm:pl-4">
                        <div className="text-base font-black text-slate-900">₹{order.totalAmount.toFixed(2)}</div>
                        <span className="text-[11px] text-slate-500">{order.type}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB CONTENT: Stock Alerts */}
            {activeTab === 'alerts' && (
              <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm space-y-6">
                <div>
                  <h3 className="text-lg font-extrabold text-slate-900">Medicine Restock Notifications ("Notify Me")</h3>
                  <p className="text-xs text-slate-500">
                    Active trackers that alert you when out-of-stock medicines become available at nearby pharmacies.
                  </p>
                </div>

                <div className="space-y-3">
                  {user.stockAlerts && user.stockAlerts.length > 0 ? (
                    user.stockAlerts.map((alert) => (
                      <div
                        key={alert.id}
                        className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                          alert.status === 'In Stock Now'
                            ? 'bg-emerald-50/60 border-emerald-300 ring-1 ring-emerald-400/30'
                            : 'bg-slate-50 border-slate-200'
                        }`}
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-extrabold text-slate-900">{alert.medicineName}</h4>
                            <span
                              className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${
                                alert.status === 'In Stock Now'
                                  ? 'bg-emerald-600 text-white'
                                  : 'bg-amber-100 text-amber-800 border border-amber-300'
                              }`}
                            >
                              {alert.status === 'In Stock Now' ? '✓ In Stock Now' : '⏳ Waiting for Restock'}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500">
                            Location monitored: <strong>{alert.location}</strong>
                            {alert.notifiedPharmacyName && (
                              <span> • Available at: <strong className="text-emerald-800">{alert.notifiedPharmacyName}</strong></span>
                            )}
                          </p>
                          <span className="text-[10px] text-slate-400 block">Requested: {alert.timestamp}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          {alert.status === 'In Stock Now' ? (
                            <button
                              onClick={() => onSearchQuery(alert.medicineName)}
                              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1"
                            >
                              <span>View & Reserve</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                          ) : (
                            <button
                              onClick={() => onSearchQuery(alert.medicineName)}
                              className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold rounded-xl"
                            >
                              Check Alternatives
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-8 text-center text-slate-400 text-xs bg-slate-50 rounded-2xl">
                      No active restock alerts. When a medicine is out of stock in search results, click "Notify Me" to get alerts here!
                    </div>
                  )}
                </div>
              </div>
            )}

          </div>

        </div>

      </div>

      {/* Add Reminder Modal */}
      {showAddReminderModal && (
        <div className="fixed inset-0 z-[10000] overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-md p-6 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Clock className="w-5 h-5 text-emerald-600" />
                <span>Add Medicine Reminder</span>
              </h3>
              <button
                onClick={() => setShowAddReminderModal(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateReminder} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Medicine Name</label>
                <input
                  type="text"
                  required
                  value={newMedName}
                  onChange={(e) => setNewMedName(e.target.value)}
                  placeholder="e.g. Paracetamol 650mg, Vitamin C"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Dosage</label>
                  <input
                    type="text"
                    value={newDosage}
                    onChange={(e) => setNewDosage(e.target.value)}
                    placeholder="e.g. 1 Tablet, 5ml"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Reminder Time</label>
                  <input
                    type="text"
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    placeholder="e.g. 08:00 AM"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Frequency</label>
                  <select
                    value={newFrequency}
                    onChange={(e) => setNewFrequency(e.target.value as any)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                  >
                    <option value="Once Daily">Once Daily</option>
                    <option value="Twice Daily">Twice Daily</option>
                    <option value="Thrice Daily">Thrice Daily</option>
                    <option value="As Needed">As Needed</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Instructions</label>
                  <select
                    value={newInstructions}
                    onChange={(e) => setNewInstructions(e.target.value as any)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                  >
                    <option value="After Food">After Food</option>
                    <option value="Before Food">Before Food</option>
                    <option value="With Water">With Water</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddReminderModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 text-white rounded-xl font-bold shadow-xs hover:bg-emerald-700"
                >
                  Save Reminder
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
