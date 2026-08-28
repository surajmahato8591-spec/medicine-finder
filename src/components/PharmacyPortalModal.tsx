import React, { useState } from 'react';
import { 
  X, 
  Store, 
  Plus, 
  RefreshCw, 
  CheckCircle2, 
  Package, 
  Calendar, 
  AlertCircle,
  Pill,
  Sparkles
} from 'lucide-react';
import { Pharmacy, Medicine, PharmacyMedicineInventory } from '../types';

interface PharmacyPortalModalProps {
  pharmacies: Pharmacy[];
  medicines: Medicine[];
  onClose: () => void;
  onAddMedicine: (newMed: Medicine, initialPharmacyId: string, inventory: Omit<PharmacyMedicineInventory, 'medicineId' | 'pharmacyId'>) => void;
  onUpdateStock: (pharmacyId: string, medicineId: string, updates: Partial<PharmacyMedicineInventory>) => void;
}

export const PharmacyPortalModal: React.FC<PharmacyPortalModalProps> = ({
  pharmacies,
  medicines,
  onClose,
  onAddMedicine,
  onUpdateStock,
}) => {
  const [activeTab, setActiveTab] = useState<'add' | 'update'>('add');
  const [selectedPharmacyId, setSelectedPharmacyId] = useState(pharmacies[0]?.id || '');
  const [successMsg, setSuccessMsg] = useState('');

  // Add Medicine Form Fields
  const [medName, setMedName] = useState('');
  const [genericName, setGenericName] = useState('');
  const [category, setCategory] = useState<Medicine['category']>('Pain Relief');
  const [formType, setFormType] = useState<Medicine['form']>('Tablet');
  const [dosage, setDosage] = useState('650mg');
  const [packSize, setPackSize] = useState('10 Tablets');
  const [price, setPrice] = useState('15.00');
  const [stockQuantity, setStockQuantity] = useState('50');
  const [expiryDate, setExpiryDate] = useState('12/2027');

  // Update Stock Form Fields
  const [selectedMedIdToUpdate, setSelectedMedIdToUpdate] = useState(medicines[0]?.id || '');
  const [updateStockQty, setUpdateStockQty] = useState('45');
  const [updateStatus, setUpdateStatus] = useState<PharmacyMedicineInventory['inStockStatus']>('In Stock');
  const [updatePrice, setUpdatePrice] = useState('15.00');

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
      description: `${medName} is used for medical treatment as directed.`,
      uses: ['General Healthcare', 'Prescribed Treatment'],
      sideEffects: ['None noted with standard therapeutic dose'],
      requiresPrescription: category === 'Antibiotics' || category === 'Cardiac' || category === 'Diabetes',
    };

    const parsedQty = parseInt(stockQuantity, 10) || 0;
    const initialInventory: Omit<PharmacyMedicineInventory, 'medicineId' | 'pharmacyId'> = {
      inStockStatus: parsedQty > 10 ? 'In Stock' : parsedQty > 0 ? 'Low Stock' : 'Out of Stock',
      stockQuantity: parsedQty,
      price: parseFloat(price) || 15.0,
      lastUpdated: 'Just now',
      expiryDate,
    };

    onAddMedicine(newMedicine, selectedPharmacyId, initialInventory);
    setSuccessMsg(`"${medName}" added successfully to pharmacy stock!`);
    setMedName('');
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const handleUpdateStockSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const qty = parseInt(updateStockQty, 10) || 0;
    const computedStatus: PharmacyMedicineInventory['inStockStatus'] =
      qty > 10 ? 'In Stock' : qty > 0 ? 'Low Stock' : 'Out of Stock';

    onUpdateStock(selectedPharmacyId, selectedMedIdToUpdate, {
      stockQuantity: qty,
      inStockStatus: computedStatus,
      price: parseFloat(updatePrice) || 15.0,
      lastUpdated: 'Just now',
    });

    setSuccessMsg('Stock levels updated successfully!');
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const targetPharmacy = pharmacies.find((p) => p.id === selectedPharmacyId) || pharmacies[0];

  return (
    <div className="fixed inset-0 z-[10000] overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
      <div 
        id="pharmacy-portal-modal-container"
        className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden animate-in zoom-in-95 duration-150 relative max-h-[92vh] flex flex-col"
      >
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 bg-gradient-to-r from-emerald-50 via-teal-50/50 to-white flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold text-xl shadow-md">
              <Store className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-slate-900">Add / Update Medicine Stock</h3>
              <p className="text-xs text-slate-500">Pharmacy Owner & Chemist Portal</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Pharmacy Selector */}
        <div className="px-6 pt-4 pb-2 bg-slate-50 border-b border-slate-100 flex items-center justify-between gap-3 text-xs">
          <span className="font-bold text-slate-600">Active Pharmacy:</span>
          <select
            value={selectedPharmacyId}
            onChange={(e) => setSelectedPharmacyId(e.target.value)}
            className="py-1.5 px-3 bg-white border border-slate-200 rounded-xl font-bold text-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          >
            {pharmacies.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.area})
              </option>
            ))}
          </select>
        </div>

        {/* Tab Headers */}
        <div className="flex border-b border-slate-200 px-6 pt-2 bg-white">
          <button
            onClick={() => setActiveTab('add')}
            className={`pb-2.5 px-4 text-xs font-bold border-b-2 transition-all ${
              activeTab === 'add'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Add Medicine
          </button>
          <button
            onClick={() => setActiveTab('update')}
            className={`pb-2.5 px-4 text-xs font-bold border-b-2 transition-all ${
              activeTab === 'update'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Update Stock Quantity
          </button>
        </div>

        {/* Success Alert */}
        {successMsg && (
          <div className="m-4 p-3 bg-emerald-100 text-emerald-900 text-xs font-bold rounded-xl flex items-center gap-2 border border-emerald-300">
            <CheckCircle2 className="w-4 h-4 text-emerald-700" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {activeTab === 'add' ? (
            <form onSubmit={handleAddMedicineSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Medicine Name</label>
                <input
                  type="text"
                  required
                  value={medName}
                  onChange={(e) => setMedName(e.target.value)}
                  placeholder="e.g. Paracetamol 650mg, Dolo 650"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Medicine Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                  >
                    <option value="Pain Relief">Pain Relief</option>
                    <option value="Antibiotics">Antibiotics</option>
                    <option value="Fever & Cold">Fever & Cold</option>
                    <option value="Diabetes">Diabetes</option>
                    <option value="Cardiac">Cardiac</option>
                    <option value="Vitamins & Supplements">Vitamins & Supplements</option>
                    <option value="Allergy">Allergy</option>
                    <option value="Gastrointestinal">Gastrointestinal</option>
                    <option value="First Aid">First Aid</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Price (per unit/strip)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-slate-400 font-bold">₹</span>
                    <input
                      type="number"
                      step="0.5"
                      required
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="15.00"
                      className="w-full pl-7 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Stock Quantity</label>
                  <input
                    type="number"
                    required
                    value={stockQuantity}
                    onChange={(e) => setStockQuantity(e.target.value)}
                    placeholder="50"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Expiry Date</label>
                  <input
                    type="text"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    placeholder="MM/YYYY or DD/MM/YYYY"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-all mt-2"
              >
                Add Medicine to Inventory
              </button>
            </form>
          ) : (
            <form onSubmit={handleUpdateStockSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Select Medicine in Stock</label>
                <select
                  value={selectedMedIdToUpdate}
                  onChange={(e) => {
                    setSelectedMedIdToUpdate(e.target.value);
                    const curr = targetPharmacy.inventory.find((i) => i.medicineId === e.target.value);
                    if (curr) {
                      setUpdateStockQty(curr.stockQuantity.toString());
                      setUpdatePrice(curr.price.toString());
                    }
                  }}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                >
                  {targetPharmacy.inventory.map((inv) => {
                    const med = medicines.find((m) => m.id === inv.medicineId);
                    return (
                      <option key={inv.medicineId} value={inv.medicineId}>
                        {med?.name || inv.medicineId} (Current: {inv.stockQuantity} strips • ₹{inv.price})
                      </option>
                    );
                  })}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Updated Stock Quantity</label>
                  <input
                    type="number"
                    value={updateStockQty}
                    onChange={(e) => setUpdateStockQty(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Price (₹)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={updatePrice}
                    onChange={(e) => setUpdatePrice(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-all mt-2"
              >
                Save Stock Changes
              </button>
            </form>
          )}

          <div className="p-3.5 bg-emerald-50/60 rounded-2xl border border-emerald-200/80 text-[11px] text-emerald-900 leading-relaxed">
            <strong>Note:</strong> Keep your stock updated regularly. Accurate inventories help patients during urgent medical emergencies and reduce unnecessary physical visits.
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold rounded-xl"
          >
            Close Portal
          </button>
        </div>
      </div>
    </div>
  );
};
