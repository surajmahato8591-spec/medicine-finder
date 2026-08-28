import React, { useState } from 'react';
import { 
  Search, 
  MapPin, 
  SlidersHorizontal, 
  ArrowUpDown, 
  Phone, 
  Navigation, 
  ChevronRight, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  Clock, 
  ShieldCheck, 
  Eye, 
  Map, 
  List, 
  Columns, 
  Bookmark, 
  Share2,
  Filter,
  ShoppingCart
} from 'lucide-react';
import { Pharmacy, Medicine, SearchFilters, PharmacyMedicineInventory } from '../types';
import { calculateDistance } from '../data/mockData';
import { InteractiveMap } from './InteractiveMap';

interface SearchResultsViewProps {
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
  onEditSearch: () => void;
}

export const SearchResultsView: React.FC<SearchResultsViewProps> = ({
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
  onEditSearch,
}) => {
  const [viewMode, setViewMode] = useState<'split' | 'list' | 'map'>('split');
  const [showFilterDrawer, setShowFilterDrawer] = useState(false);

  // Compute distances & sort
  const enrichedPharmacies = pharmacies.map((pharmacy) => {
    const distance = calculateDistance(
      filters.location.lat,
      filters.location.lng,
      pharmacy.lat,
      pharmacy.lng
    );

    // Find stock for selected medicine
    const inventoryItem = selectedMedicine
      ? pharmacy.inventory.find((i) => i.medicineId === selectedMedicine.id)
      : pharmacy.inventory[0];

    return {
      ...pharmacy,
      calculatedDistance: distance,
      searchedInventory: inventoryItem,
    };
  });

  // Apply filters
  const filteredList = enrichedPharmacies.filter((p) => {
    // Radius filter
    if (p.calculatedDistance > filters.radiusKm) return false;

    // Open now filter
    if (filters.openNowOnly && !p.isOpenNow) return false;

    // 24x7 filter
    if (filters.is24x7Only && !p.is24x7) return false;

    // Stock filter
    if (filters.stockFilter === 'in_stock_only') {
      if (!p.searchedInventory || p.searchedInventory.inStockStatus !== 'In Stock') {
        return false;
      }
    } else if (filters.stockFilter === 'low_stock_ok') {
      if (
        !p.searchedInventory ||
        p.searchedInventory.inStockStatus === 'Out of Stock'
      ) {
        return false;
      }
    }

    return true;
  });

  // Sorting
  const sortedList = [...filteredList].sort((a, b) => {
    if (filters.sortBy === 'distance') {
      return a.calculatedDistance - b.calculatedDistance;
    }
    if (filters.sortBy === 'price_low_high') {
      const priceA = a.searchedInventory ? a.searchedInventory.price : 9999;
      const priceB = b.searchedInventory ? b.searchedInventory.price : 9999;
      return priceA - priceB;
    }
    if (filters.sortBy === 'rating') {
      return b.rating - a.rating;
    }
    return 0;
  });

  return (
    <section className="py-6 sm:py-8 bg-slate-50 min-h-[85vh]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-5">
        
        {/* Top Search Context Bar */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-slate-200/90 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap text-xs text-slate-500 font-medium">
              <span>Searched for:</span>
              <span className="font-bold text-slate-900 bg-emerald-50 text-emerald-800 px-2.5 py-0.5 rounded-md border border-emerald-200">
                {filters.query || 'All Available Medicines'}
              </span>
              <span>•</span>
              <span>Location:</span>
              <span className="font-bold text-slate-900 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-emerald-600 inline" />
                {filters.location.name}
              </span>
            </div>
            <p className="text-xs text-slate-500 font-normal">
              Found <strong className="text-emerald-700 font-bold">{sortedList.length} pharmacies</strong> matching your criteria within {filters.radiusKm} km.
            </p>
          </div>

          {/* Action buttons & View mode */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              id="edit-search-parameters-btn"
              onClick={onEditSearch}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors border border-slate-200"
            >
              Edit Search
            </button>

            {/* View mode toggle */}
            <div className="bg-slate-100 p-1 rounded-xl flex items-center gap-1 border border-slate-200">
              <button
                id="view-mode-split-btn"
                onClick={() => setViewMode('split')}
                title="Split View: List and Map"
                className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  viewMode === 'split' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Columns className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Split</span>
              </button>

              <button
                id="view-mode-list-btn"
                onClick={() => setViewMode('list')}
                title="List Only (Best for fast comparison)"
                className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  viewMode === 'list' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <List className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">List</span>
              </button>

              <button
                id="view-mode-map-btn"
                onClick={() => setViewMode('map')}
                title="Map Only (Best for spatial context)"
                className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  viewMode === 'map' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Map className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Map</span>
              </button>
            </div>
          </div>
        </div>

        {/* Filter & Sorting Ribbon */}
        <div className="bg-white rounded-2xl p-3 sm:p-4 shadow-sm border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
          
          {/* Quick Filters */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            <button
              onClick={() =>
                setFilters((prev) => ({
                  ...prev,
                  stockFilter: prev.stockFilter === 'in_stock_only' ? 'all' : 'in_stock_only',
                }))
              }
              className={`px-3 py-1.5 rounded-xl font-bold transition-all shrink-0 flex items-center gap-1.5 border ${
                filters.stockFilter === 'in_stock_only'
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>In Stock Only</span>
            </button>

            <button
              onClick={() =>
                setFilters((prev) => ({
                  ...prev,
                  openNowOnly: !prev.openNowOnly,
                }))
              }
              className={`px-3 py-1.5 rounded-xl font-bold transition-all shrink-0 flex items-center gap-1.5 border ${
                filters.openNowOnly
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Open Now</span>
            </button>

            <button
              onClick={() =>
                setFilters((prev) => ({
                  ...prev,
                  is24x7Only: !prev.is24x7Only,
                }))
              }
              className={`px-3 py-1.5 rounded-xl font-bold transition-all shrink-0 flex items-center gap-1.5 border ${
                filters.is24x7Only
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <span>24/7 Service</span>
            </button>

            {/* Radius Quick Pills */}
            <div className="flex items-center gap-1 pl-2 border-l border-slate-200 shrink-0">
              <span className="text-slate-400 font-semibold text-[11px]">Radius:</span>
              {[1, 2, 5, 10, 20].map((r) => (
                <button
                  key={r}
                  onClick={() => setFilters((prev) => ({ ...prev, radiusKm: r }))}
                  className={`px-2 py-1 rounded-lg text-xs font-bold transition-colors ${
                    filters.radiusKm === r
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  {r}km
                </button>
              ))}
            </div>
          </div>

          {/* Sort By Dropdown */}
          <div className="flex items-center gap-2 shrink-0 justify-end">
            <span className="text-slate-500 font-semibold flex items-center gap-1">
              <ArrowUpDown className="w-3.5 h-3.5" /> Sort by:
            </span>
            <select
              value={filters.sortBy}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  sortBy: e.target.value as any,
                }))
              }
              className="py-1.5 px-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 cursor-pointer"
            >
              <option value="distance">Nearest Distance</option>
              <option value="price_low_high">Lowest Price (₹)</option>
              <option value="rating">Highest Rating ⭐</option>
            </select>
          </div>
        </div>

        {/* Dynamic Layout: Split View / List Only / Map Only */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* List Column */}
          {(viewMode === 'split' || viewMode === 'list') && (
            <div className={`${viewMode === 'split' ? 'lg:col-span-6 xl:col-span-5' : 'lg:col-span-12'} space-y-3`}>
              {sortedList.length > 0 ? (
                sortedList.map((pharmacy) => {
                  const isSelected = selectedPharmacy?.id === pharmacy.id;
                  const inv = pharmacy.searchedInventory;
                  const isStocked = inv?.inStockStatus === 'In Stock';
                  const isLowStock = inv?.inStockStatus === 'Low Stock';
                  const isSaved = savedPharmacyIds.includes(pharmacy.id);

                  return (
                    <div
                      key={pharmacy.id}
                      id={`pharmacy-card-${pharmacy.id}`}
                      onClick={() => onSelectPharmacy(pharmacy)}
                      className={`bg-white rounded-2xl p-4 sm:p-5 border transition-all cursor-pointer group hover:shadow-md ${
                        isSelected
                          ? 'border-emerald-500 ring-2 ring-emerald-500/20 bg-emerald-50/20'
                          : 'border-slate-200/90 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        
                        {/* Pharmacy Brand Icon & Details */}
                        <div className="flex items-start gap-3.5">
                          <div 
                            style={{ backgroundColor: pharmacy.colorTag }}
                            className="w-11 h-11 rounded-2xl text-white flex items-center justify-center font-bold text-base shadow-sm shrink-0 mt-0.5 group-hover:scale-105 transition-transform"
                          >
                            +
                          </div>

                          <div className="space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="text-sm sm:text-base font-extrabold text-slate-900 group-hover:text-emerald-700 transition-colors">
                                {pharmacy.name}
                              </h3>
                              <span className="text-[11px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                                ⭐ {pharmacy.rating}
                              </span>
                            </div>

                            <p className="text-xs text-slate-500 font-medium">
                              <strong className="text-slate-700">{pharmacy.calculatedDistance} km away</strong> • {pharmacy.area}
                            </p>

                            <div className="flex items-center gap-2 pt-0.5 flex-wrap">
                              <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-100/60 px-2 py-0.5 rounded-full flex items-center gap-1">
                                <CheckCircle2 className="w-2.5 h-2.5" /> Direct Pickup
                              </span>
                              {pharmacy.is24x7 && (
                                <span className="text-[10px] font-semibold text-indigo-700 bg-indigo-100/60 px-2 py-0.5 rounded-full">
                                  24/7 Open
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Price & Stock Pill on Right */}
                        <div className="text-right space-y-1 shrink-0">
                          <span
                            className={`inline-block text-[11px] font-extrabold px-2.5 py-0.5 rounded-full ${
                              isStocked
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                : isLowStock
                                ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {inv ? inv.inStockStatus : 'Open'}
                          </span>

                          <div className="text-sm font-extrabold text-slate-900">
                            ₹{inv ? inv.price.toFixed(2) : '15.00'}
                          </div>
                          <span className="text-[10px] text-slate-400 block">
                            {selectedMedicine ? selectedMedicine.packSize : '10 Tablets'}
                          </span>
                        </div>
                      </div>

                      {/* Bottom Action Ribbon */}
                      <div className="mt-3.5 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <a
                            href={`tel:${pharmacy.phone}`}
                            onClick={(e) => e.stopPropagation()}
                            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors"
                          >
                            <Phone className="w-3 h-3 text-emerald-600" />
                            <span>Call</span>
                          </a>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onOpenDirections(pharmacy);
                            }}
                            className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold flex items-center gap-1.5 transition-colors border border-emerald-200"
                          >
                            <Navigation className="w-3 h-3" />
                            <span>Directions</span>
                          </button>

                          {selectedMedicine && inv && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onOpenOrder(pharmacy, selectedMedicine, inv);
                              }}
                              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all"
                            >
                              <ShoppingCart className="w-3 h-3" />
                              <span>Reserve for Pickup</span>
                            </button>
                          )}
                        </div>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleBookmark(pharmacy.id);
                          }}
                          className={`p-1.5 rounded-xl transition-colors ${
                            isSaved ? 'text-emerald-600 bg-emerald-50' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
                          }`}
                          title="Save pharmacy"
                        >
                          <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-emerald-600' : ''}`} />
                        </button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="bg-white rounded-2xl p-8 text-center border border-slate-200 space-y-3">
                  <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
                    <AlertCircle className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900">No pharmacies found within {filters.radiusKm} km</h3>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    Try increasing your search radius to 10 km or 20 km, or loosen the "In Stock Only" and "Open Now" filters.
                  </p>
                  <button
                    onClick={() => setFilters((prev) => ({ ...prev, radiusKm: 10, stockFilter: 'all', openNowOnly: false }))}
                    className="px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl shadow-xs"
                  >
                    Expand Search to 10 km
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Map Column */}
          {(viewMode === 'split' || viewMode === 'map') && (
            <div className={`${viewMode === 'split' ? 'lg:col-span-6 xl:col-span-7 sticky top-24' : 'lg:col-span-12'} h-[480px] sm:h-[540px] lg:h-[620px]`}>
              <InteractiveMap
                pharmacies={sortedList}
                selectedPharmacy={selectedPharmacy}
                onSelectPharmacy={onSelectPharmacy}
                searchedMedicine={selectedMedicine}
                filters={filters}
                onOpenDirections={onOpenDirections}
                onOpenCall={(phone) => (window.location.href = `tel:${phone}`)}
              />
            </div>
          )}

        </div>

        {/* Floating Mobile Map/List Toggle Button */}
        <div className="lg:hidden fixed bottom-5 left-1/2 transform -translate-x-1/2 z-30">
          <button
            onClick={() => setViewMode(viewMode === 'map' ? 'list' : 'map')}
            className="px-5 py-2.5 bg-slate-900/95 backdrop-blur-md hover:bg-slate-900 text-white rounded-full font-extrabold text-xs shadow-2xl flex items-center gap-2 border border-slate-700/80 transition-transform active:scale-95"
          >
            {viewMode === 'map' ? (
              <>
                <List className="w-4 h-4 text-emerald-400" />
                <span>Show List View ({sortedList.length})</span>
              </>
            ) : (
              <>
                <Map className="w-4 h-4 text-emerald-400" />
                <span>Show Interactive Map</span>
              </>
            )}
          </button>
        </div>

      </div>
    </section>
  );
};
