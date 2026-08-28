import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Building2, 
  Pill, 
  Users, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Search, 
  Plus, 
  FileText, 
  TrendingUp, 
  Activity, 
  Leaf, 
  Clock, 
  MapPin, 
  Phone,
  BarChart3,
  BadgeCheck,
  RefreshCw,
  ShoppingBag,
  Store,
  User,
  ExternalLink,
  Mail,
  Check,
  X
} from 'lucide-react';
import { Pharmacy, Medicine, UserProfile, OrderRequest } from '../types';

interface AdminDashboardProps {
  pharmacies: Pharmacy[];
  medicines: Medicine[];
  orders: OrderRequest[];
  onTogglePharmacyVerification: (pharmacyId: string, status?: 'verified' | 'rejected') => void;
  onAddMasterMedicine: (newMed: Medicine) => void;
  onShowToast: (msg: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  pharmacies,
  medicines,
  orders,
  onTogglePharmacyVerification,
  onAddMasterMedicine,
  onShowToast,
}) => {
  const [activeTab, setActiveTab] = useState<'pharmacies' | 'users' | 'medicines' | 'reports' | 'requests'>('pharmacies');
  const [pharmacySearch, setPharmacySearch] = useState('');
  const [medicineSearch, setMedicineSearch] = useState('');
  const [userSearch, setUserSearch] = useState('');
  const [showAddMedicineModal, setShowAddMedicineModal] = useState(false);

  // New medicine form state
  const [newMedName, setNewMedName] = useState('');
  const [newMedGeneric, setNewMedGeneric] = useState('');
  const [newMedCategory, setNewMedCategory] = useState<Medicine['category']>('Pain Relief');
  const [newMedDosage, setNewMedDosage] = useState('650mg');
  const [newMedPackSize, setNewMedPackSize] = useState('10 Tablets');
  const [newMedPrice, setNewMedPrice] = useState(25);
  const [newMedRx, setNewMedRx] = useState(false);
  const [newMedDesc, setNewMedDesc] = useState('');

  // Sample registered users list for Users Tab
  const [registeredUsersList, setRegisteredUsersList] = useState([
    { id: 'usr-1', name: 'Suraj Mahato', email: 'user@medifinder.demo', phone: '+91 98765 43210', role: 'Patient / User', location: 'Mira Road East', joinDate: '15 Aug 2026', searches: 14 },
    { id: 'usr-2', name: 'Rajesh Sharma', email: 'pharmacy@medifinder.demo', phone: '+91 98765 43210', role: 'Pharmacy Owner', location: 'HealthCare Pharmacy (Mira Road)', joinDate: '24 Aug 2026', searches: 48 },
    { id: 'usr-3', name: 'Amit Deshmukh', email: 'lifecare@chemist.demo', phone: '+91 98222 33445', role: 'Pharmacy Owner', location: 'LifeCare Chemist (Bhayandar)', joinDate: '26 Aug 2026', searches: 22 },
    { id: 'usr-4', name: 'Pooja Verma', email: 'pooja.verma@gmail.com', phone: '+91 98111 22334', role: 'Patient / User', location: 'Bhayandar West', joinDate: '18 Aug 2026', searches: 9 },
    { id: 'usr-5', name: 'Vikram Joshi', email: 'vikram.medplus@gmail.com', phone: '+91 98901 23456', role: 'Pharmacy Owner', location: 'MedPlus Pharmacy', joinDate: '10 Aug 2026', searches: 65 },
    { id: 'usr-6', name: 'Suraj Mahato (Admin)', email: 'surajmahato8591@gmail.com', phone: '+91 98765 43210', role: 'Administrator', location: 'Central Headquarters', joinDate: '01 Jan 2026', searches: 210 },
  ]);

  const verifiedPharmacies = pharmacies.filter((p) => p.isVerified);
  const pendingPharmacies = pharmacies.filter((p) => !p.isVerified && p.verificationStatus !== 'rejected');
  const rejectedPharmacies = pharmacies.filter((p) => p.verificationStatus === 'rejected');
  const totalStockItems = pharmacies.reduce((acc, p) => acc + p.inventory.length, 0);

  const filteredPharmacies = pharmacies.filter((p) =>
    p.name.toLowerCase().includes(pharmacySearch.toLowerCase()) ||
    p.area.toLowerCase().includes(pharmacySearch.toLowerCase()) ||
    (p.licenseNumber && p.licenseNumber.toLowerCase().includes(pharmacySearch.toLowerCase())) ||
    (p.ownerName && p.ownerName.toLowerCase().includes(pharmacySearch.toLowerCase()))
  );

  const filteredMedicines = medicines.filter((m) =>
    m.name.toLowerCase().includes(medicineSearch.toLowerCase()) ||
    m.genericName.toLowerCase().includes(medicineSearch.toLowerCase()) ||
    m.category.toLowerCase().includes(medicineSearch.toLowerCase())
  );

  const filteredUsers = registeredUsersList.filter((u) =>
    u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.role.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.location.toLowerCase().includes(userSearch.toLowerCase())
  );

  const handleCreateMedicine = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMedName.trim() || !newMedGeneric.trim()) {
      alert('Please fill in required medicine name and generic formula');
      return;
    }

    const newMed: Medicine = {
      id: `med-${Date.now()}`,
      name: newMedName.trim(),
      genericName: newMedGeneric.trim(),
      category: newMedCategory,
      form: 'Tablet',
      dosage: newMedDosage.trim() || '500mg',
      packSize: newMedPackSize.trim(),
      defaultPrice: Number(newMedPrice) || 20,
      description: newMedDesc.trim() || 'Standard pharmaceutical grade formulation verified by Administrator.',
      uses: ['General therapeutic indication'],
      sideEffects: ['None noted with standard therapeutic dose'],
      requiresPrescription: newMedRx,
    };

    onAddMasterMedicine(newMed);
    setShowAddMedicineModal(false);
    setNewMedName('');
    setNewMedGeneric('');
    setNewMedDosage('650mg');
    onShowToast(`Added "${newMed.name}" to Master Catalogue`);
  };

  return (
    <div className="py-6 sm:py-8 bg-slate-50 min-h-[88vh]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* Admin Header Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-teal-950 to-emerald-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-400/30">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>System Administrator Control Hub</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              MediFinder Administration & Verifications
            </h1>
            <p className="text-emerald-100/80 text-xs sm:text-sm">
              Manage chemist compliance verifications, master medicine catalogue standards, registered users, and system-wide order telemetry.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="admin-add-medicine-btn"
              onClick={() => setShowAddMedicineModal(true)}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl shadow-md flex items-center gap-2 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Master Medicine</span>
            </button>
          </div>
        </div>

        {/* 5 Required Top Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
          {/* 1. Total Users */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-slate-400 block">Total Users</span>
              <span className="text-xl font-extrabold text-slate-900">{registeredUsersList.length + 142}</span>
              <span className="text-[10px] text-blue-700 font-bold block">Active Patients & Chemist</span>
            </div>
          </div>

          {/* 2. Total Pharmacies */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold shrink-0">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-slate-400 block">Total Pharmacies</span>
              <span className="text-xl font-extrabold text-slate-900">{pharmacies.length}</span>
              <span className="text-[10px] text-emerald-700 font-bold block">{verifiedPharmacies.length} Verified</span>
            </div>
          </div>

          {/* 3. Total Medicines */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold shrink-0">
              <Pill className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-slate-400 block">Total Medicines</span>
              <span className="text-xl font-extrabold text-slate-900">{medicines.length}</span>
              <span className="text-[10px] text-teal-700 font-bold block">{totalStockItems} inventory listings</span>
            </div>
          </div>

          {/* 4. Pending Verifications */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-slate-400 block">Pending Verifications</span>
              <span className="text-xl font-extrabold text-amber-600">{pendingPharmacies.length}</span>
              <span className="text-[10px] text-amber-700 font-bold block">Requires Review</span>
            </div>
          </div>

          {/* 5. Medicine Requests */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold shrink-0">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-slate-400 block">Medicine Requests</span>
              <span className="text-xl font-extrabold text-slate-900">{orders.length + 18}</span>
              <span className="text-[10px] text-indigo-700 font-bold block">100% Processed</span>
            </div>
          </div>
        </div>

        {/* Tab Navigation Menu */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
          <button
            id="admin-tab-pharmacies"
            onClick={() => setActiveTab('pharmacies')}
            className={`px-4 py-2.5 rounded-xl font-extrabold text-xs flex items-center gap-2 transition-all shrink-0 cursor-pointer ${
              activeTab === 'pharmacies'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-200/70'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Pharmacies & Verification ({pharmacies.length})</span>
            {pendingPharmacies.length > 0 && (
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${activeTab === 'pharmacies' ? 'bg-amber-400 text-slate-900' : 'bg-amber-500 text-white'}`}>
                {pendingPharmacies.length} Pending
              </span>
            )}
          </button>

          <button
            id="admin-tab-users"
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2.5 rounded-xl font-extrabold text-xs flex items-center gap-2 transition-all shrink-0 cursor-pointer ${
              activeTab === 'users'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-200/70'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Users & Accounts ({registeredUsersList.length})</span>
          </button>

          <button
            id="admin-tab-medicines"
            onClick={() => setActiveTab('medicines')}
            className={`px-4 py-2.5 rounded-xl font-extrabold text-xs flex items-center gap-2 transition-all shrink-0 cursor-pointer ${
              activeTab === 'medicines'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-200/70'
            }`}
          >
            <Pill className="w-4 h-4" />
            <span>Master Catalogue ({medicines.length})</span>
          </button>

          <button
            id="admin-tab-requests"
            onClick={() => setActiveTab('requests')}
            className={`px-4 py-2.5 rounded-xl font-extrabold text-xs flex items-center gap-2 transition-all shrink-0 cursor-pointer ${
              activeTab === 'requests'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-200/70'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Patient Requests & Orders ({orders.length})</span>
          </button>

          <button
            id="admin-tab-reports"
            onClick={() => setActiveTab('reports')}
            className={`px-4 py-2.5 rounded-xl font-extrabold text-xs flex items-center gap-2 transition-all shrink-0 cursor-pointer ${
              activeTab === 'reports'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-200/70'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Reports & Telemetry</span>
          </button>
        </div>

        {/* Tab 1: Pharmacies & Pending Verifications */}
        {activeTab === 'pharmacies' && (
          <div className="space-y-6">
            
            {/* Action Required: Pending Verifications Section */}
            {pendingPharmacies.length > 0 && (
              <div className="bg-amber-50/80 rounded-3xl p-5 sm:p-6 border border-amber-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold">
                      <AlertTriangle className="w-4 h-4" />
                    </div>
                    <div>
                      <h2 className="text-base font-extrabold text-amber-950">
                        Pending Pharmacy Verifications (Action Required)
                      </h2>
                      <p className="text-xs text-amber-800">
                        The following chemist stores have registered and are awaiting Drug License compliance verification.
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-extrabold text-amber-900 bg-amber-200/80 px-3 py-1 rounded-full">
                    {pendingPharmacies.length} Pending
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {pendingPharmacies.map((pharmacy) => (
                    <div
                      key={pharmacy.id}
                      id={`pending-pharma-${pharmacy.id}`}
                      className="bg-white rounded-2xl p-4.5 border border-amber-300 shadow-xs space-y-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-sm font-extrabold text-slate-900">{pharmacy.name}</h3>
                            <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full border border-amber-200">
                              Pending Review
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 font-medium mt-0.5">
                            {pharmacy.address}, {pharmacy.area}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-100 font-medium">
                        <div>
                          <span className="text-slate-400 text-[10px] block font-bold">Owner / Pharmacist</span>
                          <span className="text-slate-800 font-bold">{pharmacy.ownerName || 'Rajesh Sharma'}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 text-[10px] block font-bold">Drug License #</span>
                          <span className="font-mono font-bold text-slate-900">{pharmacy.licenseNumber || 'MH-RA-2024-88912'}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 text-[10px] block font-bold">Contact</span>
                          <span className="text-slate-700">{pharmacy.phone}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 text-[10px] block font-bold">Applied Date</span>
                          <span className="text-slate-700">{pharmacy.registrationDate || '24 Aug 2026'}</span>
                        </div>
                      </div>

                      {/* Action Buttons: Verify & Reject */}
                      <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-100">
                        <button
                          id={`reject-btn-${pharmacy.id}`}
                          onClick={() => {
                            onTogglePharmacyVerification(pharmacy.id, 'rejected');
                            onShowToast(`Rejected application for ${pharmacy.name}`);
                          }}
                          className="px-3.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold rounded-xl border border-rose-200 transition-colors flex items-center gap-1.5 cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                          <span>Reject</span>
                        </button>

                        <button
                          id={`verify-btn-${pharmacy.id}`}
                          onClick={() => {
                            onTogglePharmacyVerification(pharmacy.id, 'verified');
                            onShowToast(`✓ ${pharmacy.name} has been verified successfully! "✓ Verified Pharmacy" badge is now active.`);
                          }}
                          className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Verify & Grant Verified Badge</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* All Pharmacies Table */}
            <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-md border border-slate-200/90 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-base font-extrabold text-slate-900">
                    All Registered Chemist Stores & Status
                  </h2>
                  <p className="text-xs text-slate-500">
                    Manage compliance verifications, view drug license numbers, and toggle verified status.
                  </p>
                </div>

                <div className="relative w-full sm:w-72">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={pharmacySearch}
                    onChange={(e) => setPharmacySearch(e.target.value)}
                    placeholder="Search chemist, area, owner, or license..."
                    className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 font-semibold"
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-400 font-extrabold uppercase text-[10px]">
                      <th className="py-3 px-3">Pharmacy Name & Address</th>
                      <th className="py-3 px-3">Owner / Pharmacist</th>
                      <th className="py-3 px-3">Drug License #</th>
                      <th className="py-3 px-3">Hours & Services</th>
                      <th className="py-3 px-3">Verification Status</th>
                      <th className="py-3 px-3 text-right">Verification Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                    {filteredPharmacies.map((pharmacy) => (
                      <tr key={pharmacy.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-3">
                          <div className="font-extrabold text-slate-900 flex items-center gap-1.5">
                            <span>{pharmacy.name}</span>
                            {pharmacy.isVerified && (
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 inline shrink-0" />
                            )}
                          </div>
                          <div className="text-[11px] text-slate-400">{pharmacy.address}, {pharmacy.area}</div>
                        </td>
                        <td className="py-3 px-3 font-semibold text-slate-800">
                          {pharmacy.ownerName || 'Rajesh Sharma'}
                          <span className="text-[10px] text-slate-400 block">{pharmacy.phone}</span>
                        </td>
                        <td className="py-3 px-3">
                          <span className="font-mono font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
                            {pharmacy.licenseNumber || 'MH-RA-2024-88912'}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-[11px] text-slate-600">
                          <div>{pharmacy.openHours}</div>
                          <span className="text-[10px] text-emerald-700 font-bold">Counter Pickup Ready</span>
                        </td>
                        <td className="py-3 px-3">
                          {pharmacy.isVerified ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-300">
                              <BadgeCheck className="w-3.5 h-3.5 text-emerald-600" />
                              <span>✓ Verified Pharmacy</span>
                            </span>
                          ) : pharmacy.verificationStatus === 'rejected' ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-800 bg-rose-100 px-2.5 py-0.5 rounded-full border border-rose-300">
                              <XCircle className="w-3.5 h-3.5 text-rose-600" />
                              <span>Rejected</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full border border-amber-300">
                              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                              <span>Verification Pending</span>
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-right">
                          <button
                            type="button"
                            onClick={() => {
                              onTogglePharmacyVerification(pharmacy.id);
                              onShowToast(
                                pharmacy.isVerified
                                  ? `Verification revoked for ${pharmacy.name}`
                                  : `✓ Verified and approved ${pharmacy.name}`
                              );
                            }}
                            className={`px-3 py-1.5 rounded-xl font-extrabold text-[11px] transition-all cursor-pointer ${
                              pharmacy.isVerified
                                ? 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
                                : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-xs'
                            }`}
                          >
                            {pharmacy.isVerified ? 'Revoke Status' : 'Approve & Verify'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Users Management */}
        {activeTab === 'users' && (
          <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-md border border-slate-200/90 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-extrabold text-slate-900">
                  Registered Users & Roles Directory
                </h2>
                <p className="text-xs text-slate-500">
                  Manage patient accounts, chemist shop credentials, and administrator privileges.
                </p>
              </div>

              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  placeholder="Search user name, email, role, or location..."
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 font-semibold"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 font-extrabold uppercase text-[10px]">
                    <th className="py-3 px-3">User Details</th>
                    <th className="py-3 px-3">Contact & Email</th>
                    <th className="py-3 px-3">Role Type</th>
                    <th className="py-3 px-3">Location / Affiliation</th>
                    <th className="py-3 px-3">Searches / Activity</th>
                    <th className="py-3 px-3 text-right">Account Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {filteredUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-3 font-extrabold text-slate-900 flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
                          {u.name.charAt(0)}
                        </div>
                        <div>
                          <div>{u.name}</div>
                          <span className="text-[10px] text-slate-400 font-normal">Joined {u.joinDate}</span>
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-semibold text-slate-800">{u.email}</div>
                        <span className="text-[10px] text-slate-400">{u.phone}</span>
                      </td>
                      <td className="py-3 px-3">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                          u.role === 'Administrator'
                            ? 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                            : u.role === 'Pharmacy Owner'
                            ? 'bg-teal-100 text-teal-800 border border-teal-200'
                            : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        }`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-600">
                        {u.location}
                      </td>
                      <td className="py-3 px-3">
                        <span className="font-bold text-slate-900">{u.searches} actions</span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => onShowToast(`Sent account details & reset link to ${u.email}`)}
                          className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] rounded-lg transition-colors cursor-pointer"
                        >
                          Manage User
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: Master Medicine Catalogue */}
        {activeTab === 'medicines' && (
          <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-md border border-slate-200/90 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-extrabold text-slate-900">
                  Global Master Medicine Catalogue
                </h2>
                <p className="text-xs text-slate-500">
                  Standardized dosage, generic formulas, and therapeutic classes available for pharmacy inventory syncing.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <div className="relative w-full sm:w-64">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={medicineSearch}
                    onChange={(e) => setMedicineSearch(e.target.value)}
                    placeholder="Search medicines or generic formula..."
                    className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 font-semibold"
                  />
                </div>

                <button
                  onClick={() => setShowAddMedicineModal(true)}
                  className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl flex items-center gap-1.5 shrink-0 shadow-xs cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Medicine</span>
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 font-extrabold uppercase text-[10px]">
                    <th className="py-3 px-3">Medicine Brand Name</th>
                    <th className="py-3 px-3">Generic Formula</th>
                    <th className="py-3 px-3">Therapeutic Category</th>
                    <th className="py-3 px-3">Dosage & Strength</th>
                    <th className="py-3 px-3">Pack Size</th>
                    <th className="py-3 px-3">Rx Requirement</th>
                    <th className="py-3 px-3 text-right">Default Ref Price</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {filteredMedicines.map((med) => (
                    <tr key={med.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-3 font-extrabold text-slate-900">{med.name}</td>
                      <td className="py-3 px-3 text-slate-600 font-mono text-[11px]">{med.genericName}</td>
                      <td className="py-3 px-3">
                        <span className="bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded text-[10px] font-bold border border-emerald-200">
                          {med.category}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-800 font-bold">{med.dosage}</td>
                      <td className="py-3 px-3 text-slate-500">{med.packSize}</td>
                      <td className="py-3 px-3">
                        {med.requiresPrescription ? (
                          <span className="text-rose-700 bg-rose-50 px-2 py-0.5 rounded font-extrabold text-[10px] border border-rose-200">
                            Rx Required
                          </span>
                        ) : (
                          <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-bold text-[10px]">
                            OTC
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-right font-extrabold text-slate-900">
                        ₹{med.defaultPrice.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 4: Patient Requests & Orders */}
        {activeTab === 'requests' && (
          <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-md border border-slate-200/90 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-extrabold text-slate-900">
                  System Medicine Pickup Reservations
                </h2>
                <p className="text-xs text-slate-500">
                  Real-time log of customer store pickup reservations placed at network pharmacies.
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 font-extrabold uppercase text-[10px]">
                    <th className="py-3 px-3">Reservation ID & Time</th>
                    <th className="py-3 px-3">Customer Name</th>
                    <th className="py-3 px-3">Medicine Reserved</th>
                    <th className="py-3 px-3">Target Pharmacy</th>
                    <th className="py-3 px-3">Fulfillment</th>
                    <th className="py-3 px-3">Counter Amount</th>
                    <th className="py-3 px-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {orders.map((ord) => (
                    <tr key={ord.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-3">
                        <span className="font-mono font-bold text-slate-900">{ord.id}</span>
                        <div className="text-[10px] text-slate-400">{ord.timestamp}</div>
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-bold text-slate-900">{ord.customerName}</div>
                        <div className="text-[10px] text-slate-400">{ord.customerPhone}</div>
                      </td>
                      <td className="py-3 px-3">
                        <span className="font-extrabold text-emerald-800">{ord.medicineName}</span>
                        <span className="text-slate-500 text-[10px] block">Qty: {ord.quantity} ({ord.packSize})</span>
                      </td>
                      <td className="py-3 px-3 font-semibold text-slate-800">
                        {ord.pharmacyName}
                      </td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-800">
                          Store Pickup
                        </span>
                      </td>
                      <td className="py-3 px-3 font-extrabold text-slate-900">
                        ₹{ord.totalAmount.toFixed(2)}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <span className="px-2.5 py-0.5 rounded-full font-extrabold text-[10px] bg-emerald-100 text-emerald-800 border border-emerald-200">
                          {ord.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 5: Reports & Telemetry */}
        {activeTab === 'reports' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-md border border-slate-200/90 space-y-4">
              <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
                <span>Top Searched Medicines (Mira Bhayandar Region)</span>
              </h3>
              <div className="space-y-3 pt-2">
                {[
                  { name: 'Paracetamol 650mg (Dolo 650)', pct: 92, count: 480 },
                  { name: 'Amoxicillin 500mg (Novamox)', pct: 64, count: 289 },
                  { name: 'Azithromycin 500mg', pct: 52, count: 231 },
                  { name: 'Cetirizine 10mg (Okacet)', pct: 44, count: 198 },
                  { name: 'Metformin 500mg (Glycomet)', pct: 36, count: 145 },
                ].map((item) => (
                  <div key={item.name} className="space-y-1">
                    <div className="flex justify-between font-bold text-slate-700 text-[11px]">
                      <span>{item.name}</span>
                      <span className="text-slate-500">{item.count} searches</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${item.pct}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-md border border-slate-200/90 space-y-4">
              <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                <Leaf className="w-4 h-4 text-teal-600" />
                <span>Green IT & Carbon Savings Summary</span>
              </h3>
              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 space-y-2 text-xs text-emerald-950">
                <p className="font-bold">Estimated 520+ wasted physical trips prevented this month.</p>
                <p className="text-emerald-800 leading-relaxed">
                  By checking stock online before stepping out, patients saved ~64 kg CO₂ in scooter and auto-rickshaw emissions across Mira Road and Bhayandar.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <span className="text-xs text-slate-500 font-bold block">Avg Search-to-Stock Time</span>
                  <span className="text-lg font-extrabold text-slate-900">&lt; 1.2s</span>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <span className="text-xs text-slate-500 font-bold block">Chemist Compliance Rate</span>
                  <span className="text-lg font-extrabold text-emerald-700">98.4%</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal: Add New Master Medicine */}
        {showAddMedicineModal && (
          <div className="fixed inset-0 z-[10000] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-extrabold text-slate-900">Add Medicine to Master Catalogue</h3>
                <button
                  onClick={() => setShowAddMedicineModal(false)}
                  className="p-1 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateMedicine} className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Brand Name / Medicine Name</label>
                  <input
                    type="text"
                    required
                    value={newMedName}
                    onChange={(e) => setNewMedName(e.target.value)}
                    placeholder="e.g. Augmentin 625 Duo"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 font-semibold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Generic Formula</label>
                  <input
                    type="text"
                    required
                    value={newMedGeneric}
                    onChange={(e) => setNewMedGeneric(e.target.value)}
                    placeholder="e.g. Amoxicillin + Clavulanic Acid"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 font-semibold"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Category</label>
                    <select
                      value={newMedCategory}
                      onChange={(e) => setNewMedCategory(e.target.value as any)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                    >
                      <option value="Pain Relief">Pain Relief</option>
                      <option value="Antibiotics">Antibiotics</option>
                      <option value="Fever & Cold">Fever & Cold</option>
                      <option value="Diabetes">Diabetes</option>
                      <option value="Cardiac">Cardiac</option>
                      <option value="Vitamins & Supplements">Vitamins & Supplements</option>
                      <option value="Allergy">Allergy</option>
                      <option value="Gastrointestinal">Gastrointestinal</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Dosage & Strength</label>
                    <input
                      type="text"
                      value={newMedDosage}
                      onChange={(e) => setNewMedDosage(e.target.value)}
                      placeholder="e.g. 625mg"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Pack Size</label>
                    <input
                      type="text"
                      value={newMedPackSize}
                      onChange={(e) => setNewMedPackSize(e.target.value)}
                      placeholder="e.g. 10 Tablets / 100ml Syrup"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Reference Price (₹)</label>
                    <input
                      type="number"
                      value={newMedPrice}
                      onChange={(e) => setNewMedPrice(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="rx-req"
                    checked={newMedRx}
                    onChange={(e) => setNewMedRx(e.target.checked)}
                    className="w-4 h-4 text-emerald-600 rounded"
                  />
                  <label htmlFor="rx-req" className="font-bold text-slate-700 cursor-pointer">
                    Requires Doctor's Prescription (Rx Schedule H)
                  </label>
                </div>

                <div className="pt-3 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAddMedicineModal(false)}
                    className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl shadow-xs"
                  >
                    Save to Master Catalogue
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
