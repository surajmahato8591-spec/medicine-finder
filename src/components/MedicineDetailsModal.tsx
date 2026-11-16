import React, { useState } from 'react';
import { 
  X, 
  Pill, 
  MapPin, 
  ShoppingCart, 
  ShieldCheck, 
  AlertCircle, 
  CheckCircle2, 
  FileText, 
  Info,
  ChevronRight,
  Truck,
  Sparkles,
  Bot,
  ShieldAlert,
  Loader2,
  TrendingDown
} from 'lucide-react';
import { Medicine, Pharmacy, SearchFilters, PharmacyMedicineInventory } from '../types';
import { calculateDistance } from '../data/mockData';
import { apiService, GenericSubstitutesResponse } from '../services/api';

interface MedicineDetailsModalProps {
  medicine: Medicine | null;
  pharmacies: Pharmacy[];
  filters: SearchFilters;
  onClose: () => void;
  onSelectPharmacy: (pharmacy: Pharmacy) => void;
  onOpenOrder: (pharmacy: Pharmacy, medicine: Medicine, inventory: PharmacyMedicineInventory) => void;
  onOpenAiPharmacist?: (medicine: Medicine, tab?: 'chat' | 'interactions') => void;
}

export const MedicineDetailsModal: React.FC<MedicineDetailsModalProps> = ({
  medicine,
  pharmacies,
  filters,
  onClose,
  onSelectPharmacy,
  onOpenOrder,
  onOpenAiPharmacist,
}) => {
  const [substitutesData, setSubstitutesData] = useState<GenericSubstitutesResponse | null>(null);
  const [isLoadingSubstitutes, setIsLoadingSubstitutes] = useState(false);

  if (!medicine) return null;

  // Find all pharmacies carrying this medicine
  const availablePharmacies = pharmacies
    .map((pharmacy) => {
      const inv = pharmacy.inventory.find((i) => i.medicineId === medicine.id);
      const distance = calculateDistance(
        filters.location.lat,
        filters.location.lng,
        pharmacy.lat,
        pharmacy.lng
      );
      return {
        pharmacy,
        inventory: inv,
        distance,
      };
    })
    .filter((item) => item.inventory !== undefined)
    .sort((a, b) => a.distance - b.distance);

  const handleFetchSubstitutes = async () => {
    if (isLoadingSubstitutes || substitutesData) return;
    setIsLoadingSubstitutes(true);
    try {
      const res = await apiService.getGenericSubstitutes(medicine.name, medicine.defaultPrice);
      setSubstitutesData(res);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingSubstitutes(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[10000] overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
      <div 
        id="medicine-details-modal-container"
        className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-150 relative max-h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 bg-gradient-to-r from-emerald-50/70 to-teal-50/40 flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center font-bold text-2xl shadow-md shrink-0 ring-4 ring-white">
              <Pill className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">{medicine.name}</h2>
                <span className="text-xs font-extrabold bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  {medicine.category}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                {medicine.genericName} • {medicine.form}
              </p>
              <div className="flex items-center gap-3 text-xs text-slate-700 font-bold mt-1.5 flex-wrap">
                <span>₹{medicine.defaultPrice.toFixed(2)} / {medicine.packSize}</span>
                {medicine.requiresPrescription && (
                  <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                    Rx Required
                  </span>
                )}
              </div>
            </div>
          </div>

          <button
            id="close-medicine-modal-btn"
            onClick={onClose}
            className="p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* AI Clinical Assistant Actions */}
          <div className="bg-gradient-to-r from-emerald-50 via-teal-50/60 to-cyan-50 border border-emerald-200/80 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center">
                  <Bot className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                    <span>AI Clinical Intelligence</span>
                    <span className="bg-emerald-200/80 text-emerald-800 text-[10px] font-extrabold px-1.5 py-0.2 rounded">Gemini 4</span>
                  </h4>
                  <p className="text-[11px] text-emerald-800">Verify dosage, discover cheaper generic brands & check interactions</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => {
                  if (onOpenAiPharmacist) {
                    onClose();
                    onOpenAiPharmacist(medicine, 'chat');
                  }
                }}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Ask AI Pharmacist</span>
              </button>

              <button
                type="button"
                onClick={handleFetchSubstitutes}
                disabled={isLoadingSubstitutes}
                className="px-3 py-1.5 bg-white hover:bg-emerald-50 text-emerald-800 border border-emerald-300 rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                {isLoadingSubstitutes ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-600" />
                ) : (
                  <TrendingDown className="w-3.5 h-3.5 text-emerald-600" />
                )}
                <span>Check Generic Substitutes</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (onOpenAiPharmacist) {
                    onClose();
                    onOpenAiPharmacist(medicine, 'interactions');
                  }
                }}
                className="px-3 py-1.5 bg-white hover:bg-amber-50 text-amber-800 border border-amber-300 rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
                <span>Check Drug Interactions</span>
              </button>
            </div>

            {/* AI Substitutes Results if expanded */}
            {substitutesData && (
              <div className="pt-3 border-t border-emerald-200/60 space-y-2 animate-in fade-in duration-200">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-slate-800">
                    Generic Bioequivalents & Price Comparison:
                  </span>
                  <span className="text-[11px] font-black text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                    {substitutesData.estimatedSavings}
                  </span>
                </div>

                <p className="text-[11px] text-slate-600 leading-relaxed italic bg-white/70 p-2.5 rounded-xl border border-emerald-100">
                  "{substitutesData.pharmacistVerdict}"
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  {substitutesData.substitutes.map((sub, i) => (
                    <div key={i} className="bg-white p-2.5 rounded-xl border border-emerald-100 text-xs space-y-1 shadow-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-slate-900">{sub.name}</span>
                        <span className="font-black text-emerald-700">₹{sub.approxPriceInr}</span>
                      </div>
                      <p className="text-[10px] text-slate-500">{sub.manufacturer}</p>
                      <span className="inline-block text-[9px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded font-medium">
                        {sub.bioequivalentRating}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Medicine Description */}
          <div className="space-y-1.5">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Description & Uses</h4>
            <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80">
              {medicine.description}
            </p>
          </div>

          {/* Key Uses Chips */}
          <div className="space-y-1.5">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Primary Uses</h4>
            <div className="flex flex-wrap gap-1.5">
              {medicine.uses.map((use) => (
                <span key={use} className="px-2.5 py-1 bg-emerald-50 text-emerald-800 text-xs font-semibold rounded-lg border border-emerald-200">
                  ✓ {use}
                </span>
              ))}
            </div>
          </div>

          {/* Available At Pharmacies List */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                Available At ({availablePharmacies.length} Pharmacies Nearby)
              </h4>
              <span className="text-[11px] text-slate-500">Sorted by distance</span>
            </div>

            <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
              {availablePharmacies.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-500">
                  No nearby pharmacies currently have this specific medicine in verified stock.
                </div>
              ) : (
                availablePharmacies.map(({ pharmacy, inventory, distance }) => {
                  if (!inventory) return null;
                  const isStocked = inventory.inStockStatus === 'In Stock';
                  const isLowStock = inventory.inStockStatus === 'Low Stock';

                  return (
                    <div 
                      key={pharmacy.id}
                      className="p-3.5 hover:bg-slate-50/80 flex items-center justify-between gap-3 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div 
                          style={{ backgroundColor: pharmacy.colorTag }}
                          className="w-9 h-9 rounded-xl text-white flex items-center justify-center font-bold text-sm shrink-0"
                        >
                          +
                        </div>
                        <div>
                          <button
                            onClick={() => {
                              onClose();
                              onSelectPharmacy(pharmacy);
                            }}
                            className="text-xs font-bold text-slate-900 hover:text-emerald-700 text-left block cursor-pointer"
                          >
                            {pharmacy.name}
                          </button>
                          <p className="text-[11px] text-slate-500">
                            {distance} km away • {pharmacy.area}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <div className="text-right">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            isStocked ? 'bg-emerald-100 text-emerald-800' : isLowStock ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-600'
                          }`}>
                            {inventory.inStockStatus}
                          </span>
                          <p className="text-xs font-black text-slate-900 mt-0.5">₹{inventory.price.toFixed(2)}</p>
                        </div>

                        <button
                          onClick={() => {
                            onClose();
                            onOpenOrder(pharmacy, medicine, inventory);
                          }}
                          className="p-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs transition-colors cursor-pointer"
                          title="Reserve or Order"
                        >
                          <ShoppingCart className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            Dosage and administration must follow registered medical practitioner guidance.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold rounded-xl cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
