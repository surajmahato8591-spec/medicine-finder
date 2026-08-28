import React, { useState } from 'react';
import { 
  MapPin, 
  Navigation, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  Clock, 
  Truck, 
  ShieldCheck, 
  Phone, 
  Bookmark, 
  Pill, 
  ArrowRight,
  SlidersHorizontal,
  PlusCircle,
  BellRing,
  RotateCcw,
  Layers,
  Search,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { Pharmacy, Medicine, SearchFilters, PharmacyMedicineInventory } from '../types';
import { calculateDistance } from '../data/mockData';
import { InteractiveMap } from './InteractiveMap';

interface SearchResultsPageProps {
  filters: SearchFilters;
  setFilters: React.Dispatch<React.SetStateAction<SearchFilters>>;
  pharmacies: Pharmacy[];
  medicines: Medicine[];
  selectedMedicine: Medicine | null;
  selectedPharmacy: Pharmacy | null;
  onSelectPharmacy: (pharmacy: Pharmacy) => void;
  onSelectMedicine: (medicine: Medicine) => void;
  onOpenDirections: (pharmacy: Pharmacy) => void;
  onOpenOrder: (pharmacy: Pharmacy, medicine: Medicine, inventory: PharmacyMedicineInventory) => void;
  onToggleBookmark: (pharmacyId: string) => void;
  savedPharmacyIds: string[];
  onOpenAiPharmacist: () => void;
  onNotifyMe: (medicineName: string, pharmacyName: string) => void;
  onChangeSearch: () => void;
  onNewSearch: () => void;
}

export const SearchResultsPage: React.FC<SearchResultsPageProps> = ({
  filters,
  setFilters,
  pharmacies,
  medicines,
  selectedMedicine,
  selectedPharmacy,
  onSelectPharmacy,
  onSelectMedicine,
  onOpenDirections,
  onOpenOrder,
  onToggleBookmark,
  savedPharmacyIds,
  onOpenAiPharmacist,
  onNotifyMe,
  onChangeSearch,
  onNewSearch,
}) => {
  const [viewMode, setViewMode] = useState<'split' | 'list' | 'map'>('split');

  const originLat = filters?.location?.lat ?? 19.2952;
  const originLng = filters?.location?.lng ?? 72.8544;

  // Enrich pharmacies with calculated distance and searched medicine inventory
  const enrichedPharmacies = pharmacies.map((pharmacy) => {
    const distance = calculateDistance(
      originLat,
      originLng,
      pharmacy.lat,
      pharmacy.lng
    );

    const inventoryItem = selectedMedicine
      ? pharmacy.inventory.find((i) => i.medicineId === selectedMedicine.id)
      : (filters.query
          ? pharmacy.inventory.find((i) => {
              const med = medicines.find((m) => m.id === i.medicineId);
              return med && (
                med.name.toLowerCase().includes(filters.query.toLowerCase()) ||
                med.genericName.toLowerCase().includes(filters.query.toLowerCase())
              );
            })
          : pharmacy.inventory[0]) || pharmacy.inventory[0];

    return {
      ...pharmacy,
      calculatedDistance: distance,
      searchedInventory: inventoryItem,
    };
  });

  // Apply filters
  const filteredList = enrichedPharmacies.filter((p) => {
    if (p.calculatedDistance > filters.radiusKm) return false;
    if (filters.openNowOnly && !p.isOpenNow) return false;
    if (filters.is24x7Only && !p.is24x7) return false;

    if (filters.stockFilter === 'in_stock_only') {
      if (!p.searchedInventory || p.searchedInventory.inStockStatus !== 'In Stock') return false;
    } else if (filters.stockFilter === 'low_stock_ok') {
      if (!p.searchedInventory || p.searchedInventory.inStockStatus === 'Out of Stock') return false;
    }

    return true;
  });

  // Sort list
  const sortedList = [...filteredList].sort((a, b) => {
    if (filters.sortBy === 'distance') return a.calculatedDistance - b.calculatedDistance;
    if (filters.sortBy === 'price_low_high') {
      const priceA = a.searchedInventory ? a.searchedInventory.price : 9999;
      const priceB = b.searchedInventory ? b.searchedInventory.price : 9999;
      return priceA - priceB;
    }
    if (filters.sortBy === 'rating') return b.rating - a.rating;
    return 0;
  });

  const inStockCount = sortedList.filter((p) => p.searchedInventory?.inStockStatus === 'In Stock').length;
  const lowStockCount = sortedList.filter((p) => p.searchedInventory?.inStockStatus === 'Low Stock').length;
  const outOfStockCount = sortedList.filter((p) => !p.searchedInventory || p.searchedInventory.inStockStatus === 'Out of Stock').length;

  const displayMedicineName = selectedMedicine?.name || filters.query || 'Medicine Availability';
  const locationLabel = filters.location?.name ? filters.location.name.split(',')[0] : 'Mira Bhayandar';

  return (
    <div className="py-6 sm:py-8 bg-slate-50 min-h-[88vh]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* ==================================================
            SEARCH RESULTS HEADER (EXACT SPECIFICATION)
            ================================================== */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-slate-700/60 relative overflow-hidden">
          <div className="absolute right-0 top-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            
            {/* Left Info: Medicine Availability, Name, Location • Radius */}
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-400/30">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>Medicine Availability</span>
              </div>
              
              <div className="space-y-1">
                <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white flex items-center gap-3">
                  <span>{displayMedicineName}</span>
                </h1>
                
                <p className="text-emerald-200/90 text-sm sm:text-base font-medium flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{locationLabel}</span>
                  <span className="text-slate-400">•</span>
                  <span className="bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-lg text-xs font-bold border border-emerald-400/20">
                    Within {filters.radiusKm} km
                  </span>
                </p>
              </div>

              {selectedMedicine && (
                <p className="text-xs text-slate-300/90 pt-1 flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-white">Composition:</span> {selectedMedicine.genericName} ({selectedMedicine.dosage})
                  <span className="text-slate-500">|</span>
                  <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                    selectedMedicine.requiresPrescription 
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-400/30' 
                      : 'bg-teal-500/20 text-teal-300 border border-teal-400/30'
                  }`}>
                    {selectedMedicine.requiresPrescription ? 'Prescription Required (Rx)' : 'Over The Counter (OTC)'}
                  </span>
                </p>
              )}
            </div>

            {/* Right Actions: [Change Search] & [New Search] */}
            <div className="flex items-center gap-3 shrink-0 flex-wrap">
              {/* Change Search Button - Returns to /search with current values */}
              <button
                id="results-change-search-btn"
                onClick={onChangeSearch}
                className="px-4.5 py-2.5 bg-white hover:bg-slate-100 text-slate-900 font-extrabold text-xs sm:text-sm rounded-xl shadow-lg transition-all flex items-center gap-2 cursor-pointer active:scale-95"
                title="Modify medicine name, location or search radius"
              >
                <SlidersHorizontal className="w-4 h-4 text-emerald-600" />
                <span>Change Search</span>
              </button>

              {/* New Search Button - Clears search and opens fresh /search */}
              <button
                id="results-new-search-btn"
                onClick={onNewSearch}
                className="px-4.5 py-2.5 bg-emerald-600/90 hover:bg-emerald-500 text-white font-extrabold text-xs sm:text-sm rounded-xl border border-emerald-400/40 shadow-lg transition-all flex items-center gap-2 cursor-pointer active:scale-95"
                title="Start a fresh search with empty inputs"
              >
                <PlusCircle className="w-4 h-4 text-emerald-200" />
                <span>New Search</span>
              </button>
            </div>

          </div>

          {/* Clinical Alternatives Quick Banner */}
          <div className="mt-5 pt-4 border-t border-slate-700/80 flex flex-wrap items-center justify-between gap-3 text-xs">
            <span className="text-slate-300 flex items-center gap-1.5 font-medium">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>{sortedList.length} local licensed pharmacies checked in real-time</span>
            </span>
            <button
              onClick={onOpenAiPharmacist}
              className="text-emerald-300 hover:text-emerald-200 font-bold flex items-center gap-1.5 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Ask AI Pharmacist About Generic Substitutes & Dosage</span>
            </button>
          </div>
        </div>

        {/* Results Filter & Toolbar */}
        <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          
          {/* Quick counts */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold text-slate-800">
              Showing {sortedList.length} Pharmacies:
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 font-bold text-xs border border-emerald-200 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{inStockCount} In Stock</span>
            </span>
            {lowStockCount > 0 && (
              <span className="px-2.5 py-1 rounded-lg bg-amber-50 text-amber-700 font-bold text-xs border border-amber-200 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{lowStockCount} Low Stock</span>
              </span>
            )}
            {outOfStockCount > 0 && (
              <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 font-bold text-xs">
                {outOfStockCount} Out of Stock
              </span>
            )}
          </div>

          {/* Filters & Mode Switcher */}
          <div className="flex items-center gap-2.5 flex-wrap">
            {/* In stock filter */}
            <button
              onClick={() => setFilters((p) => ({
                ...p,
                stockFilter: p.stockFilter === 'in_stock_only' ? 'all' : 'in_stock_only'
              }))}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 ${
                filters.stockFilter === 'in_stock_only'
                  ? 'bg-emerald-600 text-white border-emerald-700 shadow-xs'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>In Stock Only</span>
            </button>

            {/* Open Now filter */}
            <button
              onClick={() => setFilters((p) => ({ ...p, openNowOnly: !p.openNowOnly }))}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 ${
                filters.openNowOnly
                  ? 'bg-emerald-600 text-white border-emerald-700 shadow-xs'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Open Now</span>
            </button>

            {/* Sort Dropdown */}
            <select
              value={filters.sortBy}
              onChange={(e) => setFilters((p) => ({ ...p, sortBy: e.target.value as any }))}
              className="py-1.5 px-3 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 shadow-xs cursor-pointer"
            >
              <option value="distance">Nearest First</option>
              <option value="price_low_high">Lowest Price</option>
              <option value="rating">Highest Rated</option>
            </select>

            {/* View Mode Switcher */}
            <div className="hidden lg:flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold">
              <button
                onClick={() => setViewMode('split')}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  viewMode === 'split' ? 'bg-white text-slate-900 shadow-xs font-extrabold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Split View
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  viewMode === 'list' ? 'bg-white text-slate-900 shadow-xs font-extrabold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                List Only
              </button>
              <button
                onClick={() => setViewMode('map')}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  viewMode === 'map' ? 'bg-white text-slate-900 shadow-xs font-extrabold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Map Only
              </button>
            </div>
          </div>

        </div>

        {/* Results Layout Grid: Cards + Map */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Pharmacy Cards Column */}
          {(viewMode === 'split' || viewMode === 'list') && (
            <div className={`${viewMode === 'split' ? 'lg:col-span-6' : 'lg:col-span-12'} space-y-4`}>
              {sortedList.length > 0 ? (
                sortedList.map((pharmacy) => {
                  const inv = pharmacy.searchedInventory;
                  const isSaved = savedPharmacyIds.includes(pharmacy.id);
                  const isSelected = selectedPharmacy?.id === pharmacy.id;

                  return (
                    <div
                      key={pharmacy.id}
                      onClick={() => onSelectPharmacy(pharmacy)}
                      className={`bg-white rounded-3xl p-5 border transition-all cursor-pointer relative group ${
                        isSelected
                          ? 'border-emerald-500 ring-2 ring-emerald-500/20 shadow-md'
                          : 'border-slate-200 hover:border-emerald-300 hover:shadow-lg'
                      }`}
                    >
                      {/* Top Pharmacy Row */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-base font-extrabold text-slate-900 group-hover:text-emerald-700 transition-colors">
                              {pharmacy.name}
                            </h3>
                            {pharmacy.isVerified && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-100/90 px-2 py-0.5 rounded-full border border-emerald-300">
                                <ShieldCheck className="w-3 h-3" />
                                <span>Verified Chemist</span>
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-500 flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span>{pharmacy.address}</span>
                          </p>
                        </div>

                        {/* Bookmark Button */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleBookmark(pharmacy.id);
                          }}
                          className={`p-2 rounded-xl transition-colors shrink-0 ${
                            isSaved
                              ? 'bg-emerald-50 text-emerald-600'
                              : 'text-slate-400 hover:bg-slate-100 hover:text-slate-600'
                          }`}
                          title={isSaved ? 'Remove from saved' : 'Save pharmacy'}
                        >
                          <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-emerald-600' : ''}`} />
                        </button>
                      </div>

                      {/* Stock & Pricing Highlight Box */}
                      <div className="mt-3.5 p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between gap-3 flex-wrap">
                        <div className="flex items-center gap-2.5">
                          {inv?.inStockStatus === 'In Stock' && (
                            <span className="px-3 py-1 rounded-xl bg-emerald-100 text-emerald-800 font-extrabold text-xs flex items-center gap-1 border border-emerald-200">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>In Stock ({inv.stockQuantity} units)</span>
                            </span>
                          )}
                          {inv?.inStockStatus === 'Low Stock' && (
                            <span className="px-3 py-1 rounded-xl bg-amber-100 text-amber-800 font-extrabold text-xs flex items-center gap-1 border border-amber-200">
                              <AlertCircle className="w-3.5 h-3.5" />
                              <span>Low Stock ({inv.stockQuantity} left)</span>
                            </span>
                          )}
                          {(!inv || inv.inStockStatus === 'Out of Stock') && (
                            <span className="px-3 py-1 rounded-xl bg-rose-100 text-rose-800 font-extrabold text-xs flex items-center gap-1 border border-rose-200">
                              <AlertCircle className="w-3.5 h-3.5" />
                              <span>Out of Stock</span>
                            </span>
                          )}
                          <span className="text-[11px] text-slate-500">
                            Updated {inv?.lastUpdated || 'Today'}
                          </span>
                        </div>

                        <div className="text-right">
                          <span className="text-xs text-slate-400 block font-medium">Counter Price</span>
                          <span className="text-base font-black text-slate-900">
                            ₹{inv ? inv.price.toFixed(2) : '15.00'}
                          </span>
                        </div>
                      </div>

                      {/* Meta badges: Open status, distance, delivery */}
                      <div className="mt-3 flex items-center gap-2 flex-wrap text-xs text-slate-600">
                        <span className="font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded-md">
                          {pharmacy.calculatedDistance} km away
                        </span>
                        <span className="text-slate-300">•</span>
                        <span className="flex items-center gap-1 text-emerald-700 font-semibold">
                          <Clock className="w-3 h-3" />
                          <span>{pharmacy.isOpenNow ? 'Open Now' : 'Closed'}</span>
                        </span>
                        {pharmacy.is24x7 && (
                          <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 font-bold text-[10px]">
                            24/7 Store
                          </span>
                        )}
                        <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-bold text-[10px] flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>Pickup Ready</span>
                        </span>
                      </div>

                      {/* Action Buttons */}
                      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2 flex-wrap">
                        <div className="flex items-center gap-2">
                          <a
                            href={`tel:${pharmacy.phone}`}
                            onClick={(e) => e.stopPropagation()}
                            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors"
                          >
                            <Phone className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Call</span>
                          </a>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onOpenDirections(pharmacy);
                            }}
                            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors"
                          >
                            <Navigation className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Directions</span>
                          </button>
                        </div>

                        {inv?.inStockStatus === 'Out of Stock' ? (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onNotifyMe(selectedMedicine?.name || filters.query, pharmacy.name);
                            }}
                            className="px-4 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold text-xs rounded-xl border border-amber-300 flex items-center gap-1.5 transition-colors"
                          >
                            <BellRing className="w-3.5 h-3.5" />
                            <span>Notify Me When In Stock</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (selectedMedicine && inv) {
                                onOpenOrder(pharmacy, selectedMedicine, inv);
                              } else {
                                onSelectPharmacy(pharmacy);
                              }
                            }}
                            className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
                          >
                            <span>Reserve for Pickup</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="bg-white rounded-3xl p-8 border border-slate-200 text-center space-y-4">
                  <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto font-bold">
                    <AlertCircle className="w-7 h-7" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-base font-extrabold text-slate-900">
                      No pharmacies found matching filters
                    </h3>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto">
                      No stock reported within {filters.radiusKm} km of {locationLabel}. Try expanding your search radius or changing the medicine.
                    </p>
                  </div>
                  <div className="pt-2 flex items-center justify-center gap-3 flex-wrap">
                    <button
                      onClick={() => setFilters((p) => ({ ...p, radiusKm: 20 }))}
                      className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition-colors"
                    >
                      Expand Radius to 20 km
                    </button>
                    <button
                      onClick={onChangeSearch}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors"
                    >
                      Change Medicine Name
                    </button>
                    <button
                      onClick={onOpenAiPharmacist}
                      className="px-4 py-2 bg-teal-50 hover:bg-teal-100 text-teal-800 rounded-xl text-xs font-bold border border-teal-200 transition-colors flex items-center gap-1.5"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                      <span>Find Generic Substitutes</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Interactive Map Column */}
          {(viewMode === 'split' || viewMode === 'map') && (
            <div className={`${viewMode === 'split' ? 'lg:col-span-6' : 'lg:col-span-12'} sticky top-24`}>
              <div className="bg-white rounded-3xl p-4 border border-slate-200 shadow-md space-y-3">
                <div className="flex items-center justify-between px-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span className="text-xs font-extrabold text-slate-800">Live Spatial Pharmacy Map</span>
                  </div>
                  <span className="text-[11px] text-slate-400">Click pins for details</span>
                </div>

                <div className="h-[600px] rounded-2xl overflow-hidden border border-slate-200">
                  <InteractiveMap
                    pharmacies={sortedList}
                    filters={filters}
                    selectedPharmacy={selectedPharmacy}
                    onSelectPharmacy={onSelectPharmacy}
                    onOpenDirections={onOpenDirections}
                  />
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Safety Disclaimer */}
        <div className="bg-slate-100/90 rounded-2xl p-4 border border-slate-200/80 text-center text-xs text-slate-500 space-y-1">
          <p className="font-semibold text-slate-700">
            MediFinder Healthcare Safety & Stock Availability Disclaimer
          </p>
          <p className="text-[11px] max-w-3xl mx-auto leading-relaxed">
            Medicine stock data is updated regularly by participating licensed pharmacies. In urgent cases, we recommend placing a reservation or calling the pharmacy to confirm immediate availability before traveling.
          </p>
        </div>

      </div>
    </div>
  );
};
