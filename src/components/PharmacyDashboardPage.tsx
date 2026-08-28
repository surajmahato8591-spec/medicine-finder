import React, { useState } from 'react';
import { 
  Store, 
  Plus, 
  RefreshCw, 
  CheckCircle2, 
  Package, 
  Calendar, 
  AlertCircle,
  Pill,
  Sparkles,
  TrendingUp,
  Search,
  Check,
  Clock,
  Phone,
  ArrowRight,
  ShieldCheck,
  BellRing,
  Edit3,
  MapPin,
  FileText,
  Truck,
  Building2,
  X,
  Lock
} from 'lucide-react';
import { Pharmacy, Medicine, PharmacyMedicineInventory, OrderRequest, UserProfile } from '../types';

interface PharmacyDashboardPageProps {
  currentUser?: UserProfile;
  pharmacies: Pharmacy[];
  medicines: Medicine[];
  orders: OrderRequest[];
  onAddMedicine: (newMed: Medicine, initialPharmacyId: string, inventory: Omit<PharmacyMedicineInventory, 'medicineId' | 'pharmacyId'>) => void;
  onUpdateStock: (pharmacyId: string, medicineId: string, updates: Partial<PharmacyMedicineInventory>) => void;
  onUpdateOrderStatus: (orderId: string, newStatus: OrderRequest['status']) => void;
  onUpdatePharmacyProfile?: (pharmacyId: string, updates: Partial<Pharmacy>) => void;
  onShowToast: (msg: string) => void;
}

export const PharmacyDashboardPage: React.FC<PharmacyDashboardPageProps> = ({
  currentUser,
  pharmacies,
  medicines,
  orders,
  onAddMedicine,
  onUpdateStock,
  onUpdateOrderStatus,
  onUpdatePharmacyProfile,
  onShowToast,
}) => {
  // Fetch current pharmacy strictly based on currentUser.managedPharmacyId
  const managedPharmaId = currentUser?.managedPharmacyId || currentUser?.savedPharmacyIds?.[0];
  const currentPharmacy = pharmacies.find((p) => p.id === managedPharmaId) 
    || pharmacies.find((p) => p.email === currentUser?.email)
    || pharmacies[0];

  const [activeTab, setActiveTab] = useState<'inventory' | 'add' | 'update_stock' | 'orders' | 'profile'>('inventory');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter orders ONLY for current pharmacy ID
  const pharmacyOrders = orders.filter((ord) => 
    ord.pharmacyId === currentPharmacy?.id || 
    (ord.pharmacyName && currentPharmacy?.name && ord.pharmacyName.toLowerCase() === currentPharmacy.name.toLowerCase())
  );

  // Quick Stock Update modal / state
  const [stockUpdateMedicineId, setStockUpdateMedicineId] = useState<string | null>(null);
  const [stockUpdateQty, setStockUpdateQty] = useState<number>(0);
  const [stockUpdatePrice, setStockUpdatePrice] = useState<number>(15);

  // Add Medicine Form Fields
  const [medName, setMedName] = useState('');
  const [genericName, setGenericName] = useState('');
  const [category, setCategory] = useState<Medicine['category']>('Pain Relief');
  const [formType, setFormType] = useState<Medicine['form']>('Tablet');
  const [dosage, setDosage] = useState('650mg');
  const [packSize, setPackSize] = useState('10 Tablets');
  const [price, setPrice] = useState('15.00');
  const [stockQuantity, setStockQuantity] = useState('20');
  const [expiryDate, setExpiryDate] = useState('12/2027');

  // Inventory stats
  const inStockCount = currentPharmacy?.inventory.filter((i) => i.inStockStatus === 'In Stock').length || 0;
  const lowStockCount = currentPharmacy?.inventory.filter((i) => i.inStockStatus === 'Low Stock').length || 0;
  const outOfStockCount = currentPharmacy?.inventory.filter((i) => i.inStockStatus === 'Out of Stock').length || 0;

  // Filtered inventory list
  const filteredInventory = currentPharmacy ? currentPharmacy.inventory.map((inv) => {
    const med = medicines.find((m) => m.id === inv.medicineId) || {
      id: inv.medicineId,
      name: 'Custom Formulation',
      genericName: 'Standard Composition',
      category: 'Pain Relief' as const,
      form: 'Tablet' as const,
      dosage: '500mg',
      packSize: '10 Tablets',
      defaultPrice: inv.price,
      description: '',
      uses: [],
      sideEffects: [],
      requiresPrescription: false,
    };
    return { inv, med };
  }).filter(({ med }) => 
    med.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    med.genericName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    med.category.toLowerCase().includes(searchQuery.toLowerCase())
  ) : [];

  const handleAddMedicineSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!medName.trim()) return;

    const newMedId = `med-custom-${Date.now()}`;
    const newMedicine: Medicine = {
      id: newMedId,
      name: medName.trim(),
      genericName: genericName.trim() || medName.trim(),
      category,
      form: formType,
      dosage,
      packSize,
      defaultPrice: parseFloat(price) || 15.0,
      description: `${medName} is available at ${currentPharmacy.name}.`,
      uses: ['General Healthcare', 'Prescribed Treatment'],
      sideEffects: ['None noted with standard therapeutic dose'],
      requiresPrescription: category === 'Antibiotics' || category === 'Cardiac' || category === 'Diabetes',
    };

    const parsedQty = parseInt(stockQuantity, 10) || 0;
    // Quantity rules: > 10 In Stock, 1-10 Low Stock, 0 Out of Stock
    const status: PharmacyMedicineInventory['inStockStatus'] =
      parsedQty > 10 ? 'In Stock' : parsedQty > 0 ? 'Low Stock' : 'Out of Stock';

    const initialInventory: Omit<PharmacyMedicineInventory, 'medicineId' | 'pharmacyId'> = {
      inStockStatus: status,
      stockQuantity: parsedQty,
      price: parseFloat(price) || 15.0,
      lastUpdated: 'Just now',
      expiryDate,
    };

    onAddMedicine(newMedicine, currentPharmacy.id, initialInventory);
    onShowToast(`"${medName}" added with quantity ${parsedQty} (${status}) to ${currentPharmacy.name}!`);
    setMedName('');
    setGenericName('');
    setActiveTab('inventory');
  };

  const handleAdjustQuantity = (medId: string, currentQty: number, delta: number, currentPrice: number) => {
    const newQty = Math.max(0, currentQty + delta);
    // Quantity rules: > 10 In Stock, 1-10 Low Stock, 0 Out of Stock
    const newStatus: PharmacyMedicineInventory['inStockStatus'] =
      newQty > 10 ? 'In Stock' : newQty > 0 ? 'Low Stock' : 'Out of Stock';

    onUpdateStock(currentPharmacy.id, medId, {
      stockQuantity: newQty,
      inStockStatus: newStatus,
      price: currentPrice,
      lastUpdated: 'Just now',
    });

    const med = medicines.find((m) => m.id === medId);
    if (newQty === 0) {
      onShowToast(`Stock for ${med?.name || 'Medicine'} set to 0 (✕ Out of Stock).`);
    } else if (currentQty === 0 && newQty > 0) {
      onShowToast(`Restocked ${med?.name || 'Medicine'} to ${newQty} units (In Stock).`);
    }
  };

  const handleDirectStockUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!stockUpdateMedicineId) return;

    const qty = Math.max(0, Number(stockUpdateQty) || 0);
    const newStatus: PharmacyMedicineInventory['inStockStatus'] =
      qty > 10 ? 'In Stock' : qty > 0 ? 'Low Stock' : 'Out of Stock';

    onUpdateStock(currentPharmacy.id, stockUpdateMedicineId, {
      stockQuantity: qty,
      inStockStatus: newStatus,
      price: Number(stockUpdatePrice) || 15,
      lastUpdated: 'Just now',
    });

    const med = medicines.find((m) => m.id === stockUpdateMedicineId);
    onShowToast(`Updated ${med?.name || 'Medicine'} stock to ${qty} units (${newStatus})`);
    setStockUpdateMedicineId(null);
  };

  return (
    <div className="py-6 sm:py-8 bg-slate-50 min-h-[88vh]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* Portal Header */}
        <div className="bg-gradient-to-r from-emerald-800 via-teal-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-400/30">
              <Store className="w-3.5 h-3.5" />
              <span>Welcome, Pharmacy Owner</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
              <span>{currentPharmacy.name}</span>
              {currentPharmacy.isVerified ? (
                <span className="text-xs font-extrabold bg-emerald-500/30 text-emerald-300 border border-emerald-400/40 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  ✓ Verified Pharmacy
                </span>
              ) : (
                <span className="text-xs font-extrabold bg-amber-500/30 text-amber-300 border border-amber-400/40 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <AlertCircle className="w-3 h-3 text-amber-400" />
                  Verification Pending
                </span>
              )}
            </h1>
            <p className="text-emerald-100/80 text-xs sm:text-sm">
              Update counter stock levels, publish medicines, and fulfill patient reservations in real-time.
            </p>
          </div>

          {/* Read-Only Managed Pharmacy Display Component */}
          <div className="bg-white/10 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/20 flex items-center gap-3.5 text-white shrink-0 shadow-inner">
            <div className="p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-400/30 text-emerald-300">
              <Lock className="w-4 h-4 text-emerald-300" />
            </div>
            <div>
              <div className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-300 flex items-center gap-1.5">
                <span>Managed Pharmacy Context</span>
                <span className="font-mono bg-emerald-950/90 text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-500/30 text-[9px] font-bold">
                  {currentPharmacy.id}
                </span>
              </div>
              <div className="text-sm font-extrabold text-white truncate max-w-[220px]">
                {currentPharmacy.name}
              </div>
              <div className="text-[10px] font-bold text-emerald-200/90 flex items-center gap-1 mt-0.5">
                {currentPharmacy.isVerified ? (
                  <span className="text-emerald-300 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Status: Verified
                  </span>
                ) : (
                  <span className="text-amber-300 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3 text-amber-400" /> Status: Pending Verification
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Prominent Pending Verification Notice Banner */}
        {!currentPharmacy.isVerified && (
          <div className="bg-amber-50 rounded-2xl p-4 sm:p-5 border border-amber-300 shadow-sm flex items-start gap-3.5 text-amber-950">
            <ShieldCheck className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-1 text-xs">
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-sm text-amber-900">
                  Your pharmacy verification is pending.
                </h3>
                <span className="bg-amber-200 text-amber-900 font-bold px-2 py-0.5 rounded text-[10px]">
                  Drug License: {currentPharmacy.licenseNumber || 'MH-RA-2024-88912'}
                </span>
              </div>
              <p className="text-amber-800 leading-relaxed">
                Our system administrator will verify your Drug License number before granting the green <strong>"✓ Verified Pharmacy"</strong> trust badge on patient medicine search results. You can still manage your inventory and stock levels now.
              </p>
            </div>
          </div>
        )}

        {/* 4 Required Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl p-4.5 border border-slate-200 shadow-xs flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold shrink-0">
              <Package className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-400 block">Total Medicines</span>
              <span className="text-xl font-extrabold text-slate-900">{currentPharmacy?.inventory.length || 0}</span>
              <span className="text-[10px] text-slate-600 font-bold block">In Pharmacy Catalogue</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4.5 border border-slate-200 shadow-xs flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold shrink-0">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-400 block">In Stock (&gt;10 units)</span>
              <span className="text-xl font-extrabold text-emerald-700">{inStockCount}</span>
              <span className="text-[10px] text-emerald-700 font-bold block">Available for Pickup</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4.5 border border-slate-200 shadow-xs flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold shrink-0">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-400 block">Low Stock (1-10 units)</span>
              <span className="text-xl font-extrabold text-amber-700">{lowStockCount}</span>
              <span className="text-[10px] text-amber-700 font-bold block">Reorder Recommended</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4.5 border border-slate-200 shadow-xs flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold shrink-0">
              <BellRing className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-400 block">✕ Out of Stock (0 units)</span>
              <span className="text-xl font-extrabold text-rose-700">{outOfStockCount}</span>
              <span className="text-[10px] text-rose-700 font-bold block">Patients Waiting</span>
            </div>
          </div>
        </div>

        {/* 4 Required Action Buttons & Navigation Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
          <div className="flex items-center gap-2 overflow-x-auto">
            <button
              id="pharma-tab-inventory"
              onClick={() => setActiveTab('inventory')}
              className={`px-4 py-2.5 rounded-xl font-extrabold text-xs flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === 'inventory'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-200/70'
              }`}
            >
              <Package className="w-4 h-4" />
              <span>Medicine Inventory ({currentPharmacy?.inventory.length || 0})</span>
            </button>

            <button
              id="pharma-tab-add"
              onClick={() => setActiveTab('add')}
              className={`px-4 py-2.5 rounded-xl font-extrabold text-xs flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === 'add'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-200/70'
              }`}
            >
              <Plus className="w-4 h-4" />
              <span>[ Add Medicine ]</span>
            </button>

            <button
              id="pharma-tab-orders"
              onClick={() => setActiveTab('orders')}
              className={`px-4 py-2.5 rounded-xl font-extrabold text-xs flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === 'orders'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-200/70'
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>[ View Requests ] ({pharmacyOrders.length})</span>
            </button>

            <button
              id="pharma-tab-profile"
              onClick={() => setActiveTab('profile')}
              className={`px-4 py-2.5 rounded-xl font-extrabold text-xs flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === 'profile'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-200/70'
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>[ Pharmacy Profile ]</span>
            </button>
          </div>
        </div>

        {/* Tab 1: Live Stock Inventory Table & Quick Adjuster */}
        {activeTab === 'inventory' && (
          <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-md border border-slate-200/90 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-extrabold text-slate-900">
                  Medicine Inventory & Real-Time Stock Controls
                </h2>
                <p className="text-xs text-slate-500">
                  Quantity &gt; 10 = <span className="text-emerald-700 font-bold">In Stock</span>, 1–10 = <span className="text-amber-700 font-bold">Low Stock</span>, 0 = <span className="text-rose-700 font-bold">✕ Out of Stock</span>. Changes immediately sync to patient searches.
                </p>
              </div>

              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search in store stock..."
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 font-semibold"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 font-extrabold uppercase text-[10px]">
                    <th className="py-3 px-3">Medicine & Strength</th>
                    <th className="py-3 px-3">Category</th>
                    <th className="py-3 px-3">Counter Price (₹)</th>
                    <th className="py-3 px-3">Stock Units</th>
                    <th className="py-3 px-3">Real-Time Status</th>
                    <th className="py-3 px-3 text-right">Quick Stock Controls</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {filteredInventory.map(({ inv, med }) => (
                    <tr key={inv.medicineId} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-3">
                        <div className="font-extrabold text-slate-900">{med.name}</div>
                        <div className="text-[11px] text-slate-400 font-mono">{med.genericName} • {med.dosage}</div>
                      </td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-700 font-bold rounded text-[10px]">
                          {med.category}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-extrabold text-slate-900">
                        ₹{inv.price.toFixed(2)}
                      </td>
                      <td className="py-3 px-3 font-extrabold text-slate-900 text-sm">
                        {inv.stockQuantity} units
                      </td>
                      <td className="py-3 px-3">
                        {inv.stockQuantity > 10 ? (
                          <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-extrabold text-[10px] border border-emerald-200">
                            In Stock
                          </span>
                        ) : inv.stockQuantity > 0 ? (
                          <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 font-extrabold text-[10px] border border-amber-200">
                            Low Stock ({inv.stockQuantity})
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 font-extrabold text-[10px] border border-rose-200">
                            ✕ Out of Stock
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          {/* Decrease button */}
                          <button
                            type="button"
                            id={`decrease-stock-${inv.medicineId}`}
                            onClick={() => handleAdjustQuantity(inv.medicineId, inv.stockQuantity, -1, inv.price)}
                            className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 font-extrabold text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
                            title="Decrease 1 unit"
                          >
                            -
                          </button>

                          {/* Increase button */}
                          <button
                            type="button"
                            id={`increase-stock-${inv.medicineId}`}
                            onClick={() => handleAdjustQuantity(inv.medicineId, inv.stockQuantity, 1, inv.price)}
                            className="w-7 h-7 rounded-lg bg-emerald-100 hover:bg-emerald-200 font-extrabold text-emerald-800 flex items-center justify-center transition-colors cursor-pointer"
                            title="Increase 1 unit"
                          >
                            +
                          </button>

                          {/* Quick Set to 0 Out of Stock button */}
                          <button
                            type="button"
                            id={`set-out-of-stock-${inv.medicineId}`}
                            onClick={() => handleAdjustQuantity(inv.medicineId, 0, 0, inv.price)}
                            className="px-2 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 font-extrabold text-[10px] transition-colors border border-rose-200 cursor-pointer"
                            title="Set to 0 (Out of Stock)"
                          >
                            Set 0
                          </button>

                          {/* Quick Set to 20 In Stock button */}
                          <button
                            type="button"
                            id={`restock-20-${inv.medicineId}`}
                            onClick={() => handleAdjustQuantity(inv.medicineId, 20, 0, inv.price)}
                            className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[10px] transition-colors shadow-xs cursor-pointer"
                            title="Set to 20 units"
                          >
                            Set 20 (In Stock)
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 2: Add New Medicine */}
        {activeTab === 'add' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-md border border-slate-200/90 max-w-2xl space-y-4">
            <div>
              <h2 className="text-base font-extrabold text-slate-900">
                Add New Medicine to {currentPharmacy.name}
              </h2>
              <p className="text-xs text-slate-500">
                Enter details to add this medication to your store inventory and publish it to local search radar.
              </p>
            </div>

            <form onSubmit={handleAddMedicineSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Medicine Brand Name *</label>
                <input
                  id="add-med-name"
                  type="text"
                  required
                  value={medName}
                  onChange={(e) => setMedName(e.target.value)}
                  placeholder="e.g. Paracetamol 650mg, Dolo 650, Augmentin 625"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 font-semibold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Generic Chemical Composition</label>
                <input
                  id="add-med-generic"
                  type="text"
                  value={genericName}
                  onChange={(e) => setGenericName(e.target.value)}
                  placeholder="e.g. Paracetamol / Acetaminophen"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Therapeutic Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
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
                  <label className="block font-bold text-slate-700 mb-1">Dosage / Strength</label>
                  <input
                    type="text"
                    value={dosage}
                    onChange={(e) => setDosage(e.target.value)}
                    placeholder="e.g. 650mg"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Pack Size</label>
                  <input
                    type="text"
                    value={packSize}
                    onChange={(e) => setPackSize(e.target.value)}
                    placeholder="e.g. 10 Tablets"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Price per Pack (₹)</label>
                  <input
                    id="add-med-price"
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Initial Stock Units</label>
                  <input
                    id="add-med-stock"
                    type="number"
                    value={stockQuantity}
                    onChange={(e) => setStockQuantity(e.target.value)}
                    placeholder="e.g. 20"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                  />
                </div>
              </div>

              <div className="pt-3">
                <button
                  id="add-medicine-submit-btn"
                  type="submit"
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Publish to {currentPharmacy.name} Inventory</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Tab 3: Customer Reservations & Orders */}
        {activeTab === 'orders' && (
          <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-md border border-slate-200/90 space-y-4">
            <div>
              <h2 className="text-base font-extrabold text-slate-900">
                Incoming Customer Medicine Reservations for {currentPharmacy.name}
              </h2>
              <p className="text-xs text-slate-500">
                Patients who have reserved medicines for direct store pickup at your counter.
              </p>
            </div>

            <div className="space-y-3">
              {pharmacyOrders.length === 0 ? (
                <div className="text-center py-10 bg-slate-50 border border-dashed border-slate-200 rounded-2xl p-6">
                  <Clock className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-xs font-bold text-slate-600">No active reservations for {currentPharmacy.name}</p>
                  <p className="text-[11px] text-slate-400 mt-1">When patients reserve medicines at your counter, they will appear here in real-time.</p>
                </div>
              ) : (
                pharmacyOrders.map((ord) => (
                  <div
                    key={ord.id}
                    className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-slate-900 text-sm">#{ord.id}</span>
                        <span className="font-bold text-slate-600">for {ord.customerName}</span>
                        <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                          Counter Pickup
                        </span>
                      </div>
                      <p className="text-slate-600 font-medium">
                        <strong>{ord.medicineName}</strong> • {ord.quantity} pack(s) • Counter Total: <strong className="text-slate-900">₹{ord.totalAmount.toFixed(2)}</strong>
                      </p>
                      <p className="text-[11px] text-slate-400 flex items-center gap-2">
                        <span>Phone: {ord.customerPhone}</span>
                        <span>•</span>
                        <span>Reserved {ord.timestamp}</span>
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[11px] font-bold text-slate-500">Status:</span>
                      <select
                        value={ord.status}
                        onChange={(e) => {
                          onUpdateOrderStatus(ord.id, e.target.value as any);
                          onShowToast(`Reservation #${ord.id} updated to ${e.target.value}`);
                        }}
                        className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl font-bold text-xs focus:ring-2 focus:ring-emerald-500/20 cursor-pointer"
                      >
                        <option value="Reserved for Pickup">Reserved for Pickup</option>
                        <option value="Ready for Pickup">Ready for Pickup</option>
                        <option value="Completed">Completed / Collected</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Tab 4: Pharmacy Profile */}
        {activeTab === 'profile' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-md border border-slate-200/90 max-w-2xl space-y-5">
            <div>
              <h2 className="text-base font-extrabold text-slate-900">
                Chemist Shop Profile & Compliance
              </h2>
              <p className="text-xs text-slate-500">
                Official store details, operating hours, and FDA regulatory license number.
              </p>
            </div>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Pharmacy Name</label>
                  <input
                    type="text"
                    disabled
                    value={currentPharmacy.name}
                    className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-xl font-bold text-slate-800 cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Owner / Pharmacist</label>
                  <input
                    type="text"
                    disabled
                    value={currentPharmacy.ownerName || 'Rajesh Sharma'}
                    className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-xl font-bold text-slate-800 cursor-not-allowed"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Drug License Number</label>
                <div className="relative">
                  <FileText className="w-4 h-4 text-emerald-600 absolute left-3 top-2.5 pointer-events-none" />
                  <input
                    type="text"
                    disabled
                    value={currentPharmacy.licenseNumber || 'MH-RA-2024-88912'}
                    className="w-full pl-9 pr-3 py-2 bg-slate-100 border border-slate-200 rounded-xl font-mono font-bold text-slate-900 cursor-not-allowed"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Store Address</label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                  <input
                    type="text"
                    disabled
                    value={`${currentPharmacy.address}, ${currentPharmacy.area}`}
                    className="w-full pl-9 pr-3 py-2 bg-slate-100 border border-slate-200 rounded-xl font-medium text-slate-700 cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="text"
                    disabled
                    value={currentPharmacy.phone}
                    className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-xl font-medium text-slate-700 cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Operating Hours</label>
                  <input
                    type="text"
                    disabled
                    value={currentPharmacy.openHours}
                    className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-xl font-medium text-slate-700 cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center justify-between text-xs text-emerald-950 font-bold">
                <span>Direct Counter Reservation & Pickup</span>
                <span className="text-emerald-700">✓ Active</span>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
