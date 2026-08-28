import React, { useState } from 'react';
import { 
  X, 
  Phone, 
  Navigation, 
  Share2, 
  Bookmark, 
  ShieldCheck, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  Star, 
  Search, 
  ShoppingCart, 
  Plus, 
  Pill,
  Sparkles,
  Info
} from 'lucide-react';
import { Pharmacy, Medicine, PharmacyMedicineInventory } from '../types';

interface PharmacyDetailsModalProps {
  pharmacy: Pharmacy | null;
  onClose: () => void;
  searchedMedicine: Medicine | null;
  allMedicines: Medicine[];
  onOpenDirections: (pharmacy: Pharmacy) => void;
  onOpenOrder: (pharmacy: Pharmacy, medicine: Medicine, inventory: PharmacyMedicineInventory) => void;
  onToggleBookmark: (pharmacyId: string) => void;
  isSaved: boolean;
  onSelectMedicine: (medicine: Medicine) => void;
}

export const PharmacyDetailsModal: React.FC<PharmacyDetailsModalProps> = ({
  pharmacy,
  onClose,
  searchedMedicine,
  allMedicines,
  onOpenDirections,
  onOpenOrder,
  onToggleBookmark,
  isSaved,
  onSelectMedicine,
}) => {
  if (!pharmacy) return null;

  const [activeTab, setActiveTab] = useState<'overview' | 'inventory'>('overview');
  const [inventorySearch, setInventorySearch] = useState('');
  const [copiedShare, setCopiedShare] = useState(false);

  const searchedInv = searchedMedicine
    ? pharmacy.inventory.find((i) => i.medicineId === searchedMedicine.id)
    : pharmacy.inventory[0];

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: pharmacy.name,
        text: `Check out ${pharmacy.name} on MediFinder. Address: ${pharmacy.address}. Phone: ${pharmacy.phone}`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(`${pharmacy.name} - ${pharmacy.address}, Phone: ${pharmacy.phone}`);
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2000);
    }
  };

  // Filter pharmacy's full inventory
  const displayedInventory = pharmacy.inventory
    .map((inv) => {
      const med = allMedicines.find((m) => m.id === inv.medicineId);
      return { ...inv, medicine: med };
    })
    .filter((item) => {
      if (!item.medicine) return false;
      if (!inventorySearch) return true;
      return (
        item.medicine.name.toLowerCase().includes(inventorySearch.toLowerCase()) ||
        item.medicine.genericName.toLowerCase().includes(inventorySearch.toLowerCase()) ||
        item.medicine.category.toLowerCase().includes(inventorySearch.toLowerCase())
      );
    });

  return (
    <div className="fixed inset-0 z-[10000] overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
      <div 
        id="pharmacy-details-modal-container"
        className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-150 relative max-h-[92vh] flex flex-col"
      >
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 bg-gradient-to-r from-emerald-50/50 via-teal-50/30 to-white flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div 
              style={{ backgroundColor: pharmacy.colorTag }}
              className="w-14 h-14 rounded-2xl text-white flex items-center justify-center font-bold text-2xl shadow-md shrink-0 ring-4 ring-white"
            >
              +
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">{pharmacy.name}</h2>
                <span className="text-xs font-extrabold bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  {searchedInv?.inStockStatus || 'Open'}
                </span>
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-600 mt-1">
                <span className="flex items-center text-amber-500 font-bold">
                  ★ {pharmacy.rating}
                </span>
                <span className="text-slate-400">({pharmacy.reviewCount} reviews)</span>
                <span>•</span>
                <span className="font-semibold text-emerald-700">{pharmacy.isOpenNow ? 'Open Now' : 'Closed'}</span>
              </div>

              <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 inline" />
                <span>{pharmacy.address}</span>
              </p>
            </div>
          </div>

          <button
            id="close-pharmacy-modal-btn"
            onClick={onClose}
            className="p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Buttons Ribbon */}
        <div className="p-4 bg-slate-50 border-b border-slate-200/80 grid grid-cols-3 sm:grid-cols-4 gap-2">
          <a
            href={`tel:${pharmacy.phone}`}
            className="py-2.5 px-3 bg-white hover:bg-slate-100 text-slate-800 text-xs font-bold rounded-xl border border-slate-200 shadow-xs flex items-center justify-center gap-1.5 transition-colors"
          >
            <Phone className="w-3.5 h-3.5 text-emerald-600" />
            <span>Call</span>
          </a>

          <button
            onClick={() => onOpenDirections(pharmacy)}
            className="py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs flex items-center justify-center gap-1.5 transition-colors"
          >
            <Navigation className="w-3.5 h-3.5" />
            <span>Directions</span>
          </button>

          <button
            onClick={handleShare}
            className="py-2.5 px-3 bg-white hover:bg-slate-100 text-slate-800 text-xs font-bold rounded-xl border border-slate-200 shadow-xs flex items-center justify-center gap-1.5 transition-colors"
          >
            <Share2 className="w-3.5 h-3.5 text-teal-600" />
            <span>{copiedShare ? 'Copied!' : 'Share'}</span>
          </button>

          <button
            onClick={() => onToggleBookmark(pharmacy.id)}
            className={`py-2.5 px-3 text-xs font-bold rounded-xl border shadow-xs flex items-center justify-center gap-1.5 transition-colors col-span-3 sm:col-span-1 ${
              isSaved
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
            }`}
          >
            <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-emerald-600' : ''}`} />
            <span>{isSaved ? 'Saved' : 'Save'}</span>
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 px-6 pt-2 bg-white">
          <button
            onClick={() => setActiveTab('overview')}
            className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-all ${
              activeTab === 'overview'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Pharmacy Overview
          </button>
          <button
            onClick={() => setActiveTab('inventory')}
            className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'inventory'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>All Available Medicines</span>
            <span className="text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.2 rounded-full">
              {pharmacy.inventory.length}
            </span>
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {activeTab === 'overview' ? (
            <>
              {/* About Pharmacy Card */}
              <div className="space-y-2">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">About Pharmacy</h4>
                <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80">
                  {pharmacy.tagline || 'We are committed to provide genuine medicines and best healthcare services to our customers.'}
                </p>
              </div>

              {/* Service Badges */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-emerald-50/80 border border-emerald-200/80 text-emerald-800">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span className="text-xs font-bold">Genuine Medicines</span>
                </div>
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-teal-50/80 border border-teal-200/80 text-teal-800">
                  <CheckCircle2 className="w-4 h-4 text-teal-600" />
                  <span className="text-xs font-bold">Quality Assured</span>
                </div>
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-sky-50/80 border border-sky-200/80 text-sky-800">
                  <MapPin className="w-4 h-4 text-sky-600" />
                  <span className="text-xs font-bold">Counter Pickup Ready</span>
                </div>
              </div>

              {/* Operating Info */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400" /> Operating Hours:
                  </span>
                  <span className="font-bold text-slate-800">{pharmacy.openHours}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-400" /> Phone Contact:
                  </span>
                  <span className="font-bold text-slate-800">{pharmacy.phone}</span>
                </div>
              </div>

              {/* Searched Medicine Card */}
              {searchedMedicine && searchedInv && (
                <div className="space-y-2">
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                    Active Searched Medicine
                  </h4>
                  <div className="bg-white p-4 rounded-2xl border-2 border-emerald-500/40 shadow-sm flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                        <Pill className="w-5 h-5" />
                      </div>
                      <div>
                        <h5 className="text-sm font-extrabold text-slate-900">{searchedMedicine.name}</h5>
                        <p className="text-[11px] text-slate-500">{searchedMedicine.form} • Updated {searchedInv.lastUpdated}</p>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-sm font-black text-slate-900">₹{searchedInv.price.toFixed(2)}</div>
                      <button
                        onClick={() => onOpenOrder(pharmacy, searchedMedicine, searchedInv)}
                        className="mt-1 px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-xs flex items-center gap-1"
                      >
                        <ShoppingCart className="w-3 h-3" />
                        <span>Reserve</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            /* Full Pharmacy Inventory List */
            <div className="space-y-4">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                <input
                  type="text"
                  value={inventorySearch}
                  onChange={(e) => setInventorySearch(e.target.value)}
                  placeholder="Search medicines in this pharmacy..."
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden">
                {displayedInventory.map((item) => {
                  if (!item.medicine) return null;
                  return (
                    <div key={item.medicineId} className="p-3.5 hover:bg-slate-50 flex items-center justify-between gap-3">
                      <div>
                        <button
                          onClick={() => {
                            if (item.medicine) onSelectMedicine(item.medicine);
                          }}
                          className="text-xs font-bold text-slate-900 hover:text-emerald-700 text-left block"
                        >
                          {item.medicine.name}
                        </button>
                        <p className="text-[11px] text-slate-500">{item.medicine.category} • {item.medicine.form} • Exp: {item.expiryDate || '12/2027'}</p>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            item.inStockStatus === 'In Stock' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {item.inStockStatus}
                          </span>
                          <p className="text-xs font-black text-slate-900 mt-0.5">₹{item.price.toFixed(2)}</p>
                        </div>

                        <button
                          onClick={() => {
                            if (item.medicine) onOpenOrder(pharmacy, item.medicine, item);
                          }}
                          className="p-2 bg-emerald-50 hover:bg-emerald-600 hover:text-white text-emerald-700 rounded-lg transition-colors"
                          title="Reserve medicine"
                        >
                          <ShoppingCart className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            Call pharmacy before visiting for emergency reservations.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold rounded-xl"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
