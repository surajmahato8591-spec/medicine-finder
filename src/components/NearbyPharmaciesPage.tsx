import React, { useState } from 'react';
import { 
  MapPin, 
  Navigation, 
  Phone, 
  Clock, 
  ShieldCheck, 
  Bookmark, 
  Star, 
  Layers, 
  ChevronDown, 
  Filter, 
  SlidersHorizontal,
  ArrowRight,
  Sparkles,
  Search,
  CheckCircle2
} from 'lucide-react';
import { Pharmacy, SearchFilters } from '../types';
import { calculateDistance, POPULAR_LOCATIONS } from '../data/mockData';
import { InteractiveMap } from './InteractiveMap';

interface NearbyPharmaciesPageProps {
  pharmacies: Pharmacy[];
  filters: SearchFilters;
  setFilters: React.Dispatch<React.SetStateAction<SearchFilters>>;
  selectedPharmacy: Pharmacy | null;
  onSelectPharmacy: (pharmacy: Pharmacy) => void;
  onOpenDirections: (pharmacy: Pharmacy) => void;
  onToggleBookmark: (pharmacyId: string) => void;
  savedPharmacyIds: string[];
  onOpenSearchForPharmacy: (pharmacy: Pharmacy) => void;
}

export const NearbyPharmaciesPage: React.FC<NearbyPharmaciesPageProps> = ({
  pharmacies,
  filters,
  setFilters,
  selectedPharmacy,
  onSelectPharmacy,
  onOpenDirections,
  onToggleBookmark,
  savedPharmacyIds,
  onOpenSearchForPharmacy,
}) => {
  const [locationName, setLocationName] = useState(filters.location.name);
  const [radius, setRadius] = useState(filters.radiusKm);
  const [onlyOpenNow, setOnlyOpenNow] = useState(false);
  const [only24x7, setOnly24x7] = useState(false);
  const [onlyVerified, setOnlyVerified] = useState(false);
  const [sortBy, setSortBy] = useState<'distance' | 'rating'>('distance');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'split' | 'list' | 'map'>('split');
  const [isLocating, setIsLocating] = useState(false);
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const newLoc = {
          name: 'Current GPS Location',
          lat: latitude,
          lng: longitude,
        };
        setLocationName(newLoc.name);
        setFilters((prev) => ({ ...prev, location: newLoc }));
        setIsLocating(false);
      },
      () => {
        setIsLocating(false);
        const fallback = POPULAR_LOCATIONS[0];
        setLocationName(fallback.name);
        setFilters((prev) => ({ ...prev, location: fallback }));
      },
      { timeout: 8000 }
    );
  };

  // Enriched pharmacies with calculated distance
  const enriched = pharmacies.map((p) => {
    const dist = calculateDistance(
      filters.location.lat,
      filters.location.lng,
      p.lat,
      p.lng
    );
    return {
      ...p,
      calculatedDistance: dist,
    };
  });

  // Filtered pharmacies
  const filtered = enriched.filter((p) => {
    if (searchTerm.trim() && !p.name.toLowerCase().includes(searchTerm.toLowerCase()) && !p.area.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    if (p.calculatedDistance > radius) return false;
    if (onlyOpenNow && !p.isOpenNow) return false;
    if (only24x7 && !p.is24x7) return false;
    if (onlyVerified && !p.isVerified) return false;
    return true;
  });

  // Sort
  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'distance') return a.calculatedDistance - b.calculatedDistance;
    if (sortBy === 'rating') return b.rating - a.rating;
    return 0;
  });

  return (
    <div className="py-6 sm:py-8 bg-slate-50 min-h-[88vh]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* Page Header */}
        <div className="bg-gradient-to-r from-emerald-800 via-teal-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
          <div className="relative z-10 max-w-3xl space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-400/30">
              <MapPin className="w-3.5 h-3.5" />
              <span>Spatial Pharmacy Directory</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white">
              Pharmacies & Chemists Near You
            </h1>
            <p className="text-emerald-100/80 text-xs sm:text-sm leading-relaxed">
              Explore verified local pharmacies in your neighborhood with real-time operational hours, contact details, turn-by-turn routing, and live inventory lookup.
            </p>
          </div>
        </div>

        {/* Location & Filter Control Bar */}
        <div className="bg-white rounded-3xl p-5 shadow-md border border-slate-200/90 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3.5">
            
            {/* Search by pharmacy name */}
            <div className="sm:col-span-4 relative">
              <label className="block text-xs font-extrabold text-slate-700 mb-1.5">
                Search by Pharmacy Name or Area
              </label>
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="e.g. Apollo, HealthCare, Bhayandar"
                  className="w-full pl-9.5 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 font-semibold text-slate-900"
                />
              </div>
            </div>

            {/* Location selector */}
            <div className="sm:col-span-5 relative">
              <label className="block text-xs font-extrabold text-slate-700 mb-1.5">
                Current Center Location
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={locationName}
                  onChange={(e) => {
                    setLocationName(e.target.value);
                    setShowLocationDropdown(true);
                  }}
                  onFocus={() => setShowLocationDropdown(true)}
                  className="w-full pl-9.5 pr-9 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 font-semibold text-slate-900"
                />
                <button
                  type="button"
                  onClick={handleUseCurrentLocation}
                  title="Use GPS"
                  className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-emerald-600 hover:text-emerald-700"
                >
                  <Navigation className={`w-4 h-4 ${isLocating ? 'animate-spin text-emerald-500' : ''}`} />
                </button>
              </div>

              {/* Location Suggestions Dropdown */}
              {showLocationDropdown && (
                <div className="absolute left-0 right-0 mt-1.5 bg-white rounded-2xl shadow-2xl border border-slate-200 p-2 z-50 max-h-52 overflow-y-auto">
                  <button
                    type="button"
                    onClick={() => {
                      handleUseCurrentLocation();
                      setShowLocationDropdown(false);
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 flex items-center gap-2 text-xs font-bold text-emerald-800 mb-1"
                  >
                    <Navigation className="w-3.5 h-3.5" />
                    <span>Use My Current GPS Location</span>
                  </button>
                  {POPULAR_LOCATIONS.map((loc) => (
                    <button
                      key={loc.name}
                      type="button"
                      onClick={() => {
                        setLocationName(loc.name);
                        setFilters((prev) => ({ ...prev, location: loc }));
                        setShowLocationDropdown(false);
                      }}
                      className="w-full text-left px-3 py-1.5 rounded-lg hover:bg-slate-100 text-xs text-slate-800 flex items-center gap-2 font-medium"
                    >
                      <MapPin className="w-3 h-3 text-slate-400" />
                      <span>{loc.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Radius select */}
            <div className="sm:col-span-3">
              <label className="block text-xs font-extrabold text-slate-700 mb-1.5">
                Distance Radius
              </label>
              <div className="relative">
                <select
                  value={radius}
                  onChange={(e) => {
                    const r = Number(e.target.value);
                    setRadius(r);
                    setFilters((prev) => ({ ...prev, radiusKm: r }));
                  }}
                  className="w-full pl-3 pr-8 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 font-semibold text-slate-800 appearance-none cursor-pointer"
                >
                  <option value={1}>Within 1 km</option>
                  <option value={2}>Within 2 km</option>
                  <option value={5}>Within 5 km</option>
                  <option value={10}>Within 10 km</option>
                  <option value={20}>Within 20 km</option>
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
              </div>
            </div>

          </div>

          {/* Filter Chips & View Mode Switcher */}
          <div className="pt-2 border-t border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-slate-500 mr-1">Quick Filters:</span>
              <button
                type="button"
                onClick={() => setOnlyOpenNow(!onlyOpenNow)}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                  onlyOpenNow ? 'bg-emerald-600 text-white shadow-xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Open Now
              </button>
              <button
                type="button"
                onClick={() => setOnly24x7(!only24x7)}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                  only24x7 ? 'bg-indigo-600 text-white shadow-xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                24/7 Pharmacy
              </button>
              <button
                type="button"
                onClick={() => setOnlyVerified(!onlyVerified)}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                  onlyVerified ? 'bg-emerald-700 text-white shadow-xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Verified Only
              </button>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="py-1.5 px-3 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none shadow-xs cursor-pointer"
              >
                <option value="distance">Nearest Distance</option>
                <option value="rating">Highest Rated</option>
              </select>

              <div className="flex items-center bg-white p-1 rounded-xl border border-slate-200 shadow-xs text-xs font-bold">
                <button
                  onClick={() => setViewMode('split')}
                  className={`px-2.5 py-1 rounded-lg transition-all ${
                    viewMode === 'split' ? 'bg-emerald-600 text-white' : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  Split View
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-2.5 py-1 rounded-lg transition-all ${
                    viewMode === 'list' ? 'bg-emerald-600 text-white' : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  List
                </button>
                <button
                  onClick={() => setViewMode('map')}
                  className={`px-2.5 py-1 rounded-lg transition-all ${
                    viewMode === 'map' ? 'bg-emerald-600 text-white' : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  Map
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Results Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Pharmacy Cards List */}
          {(viewMode === 'split' || viewMode === 'list') && (
            <div className={`${viewMode === 'split' ? 'lg:col-span-6' : 'lg:col-span-12'} space-y-4`}>
              <div className="flex items-center justify-between">
                <h2 className="text-base font-extrabold text-slate-900">
                  {sorted.length} Pharmacies within {radius} km
                </h2>
                <span className="text-xs text-slate-500 font-medium">
                  Sorted by {sortBy === 'distance' ? 'distance' : 'rating'}
                </span>
              </div>

              {sorted.map((pharmacy) => {
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
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-base font-extrabold text-slate-900 group-hover:text-emerald-700 transition-colors">
                            {pharmacy.name}
                          </h3>
                          {pharmacy.isVerified && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-300">
                              <ShieldCheck className="w-3 h-3" />
                              <span>Verified</span>
                            </span>
                          )}
                        </div>
                        {pharmacy.tagline && (
                          <p className="text-xs text-slate-600 font-medium italic">
                            "{pharmacy.tagline}"
                          </p>
                        )}
                        <p className="text-xs text-slate-500 flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{pharmacy.address}, {pharmacy.area}</span>
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleBookmark(pharmacy.id);
                        }}
                        className={`p-2 rounded-xl transition-colors shrink-0 ${
                          isSaved ? 'bg-emerald-50 text-emerald-600' : 'text-slate-400 hover:bg-slate-100'
                        }`}
                      >
                        <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-emerald-600' : ''}`} />
                      </button>
                    </div>

                    {/* Meta stats bar */}
                    <div className="mt-3.5 p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between gap-2 flex-wrap text-xs">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1 font-extrabold text-slate-800">
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          <span>{pharmacy.rating}</span>
                          <span className="text-slate-400 font-normal">({pharmacy.reviewCount} reviews)</span>
                        </div>
                        <span className="text-slate-300">•</span>
                        <span className="font-bold text-emerald-700">
                          {pharmacy.isOpenNow ? 'Open Now' : 'Closed'}
                        </span>
                        <span className="text-slate-400 text-[11px]">({pharmacy.openHours})</span>
                      </div>

                      <div className="font-extrabold text-slate-900 bg-emerald-50 text-emerald-800 px-2.5 py-0.5 rounded-lg border border-emerald-200">
                        {pharmacy.calculatedDistance} km away
                      </div>
                    </div>

                    {/* Services Chips */}
                    <div className="mt-3 flex items-center gap-1.5 flex-wrap text-[11px] font-semibold text-slate-600">
                      {pharmacy.is24x7 && (
                        <span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 font-bold">24/7 Available</span>
                      )}
                      <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Direct Counter Pickup</span>
                      </span>
                      {pharmacy.hasWheelchairAccess && (
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700">Wheelchair Accessible</span>
                      )}
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                        {pharmacy.inventory.length} Medicines Catalogued
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2">
                        <a
                          href={`tel:${pharmacy.phone}`}
                          onClick={(e) => e.stopPropagation()}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors"
                        >
                          <Phone className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Call Chemist</span>
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
                          <span>Get Route</span>
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenSearchForPharmacy(pharmacy);
                        }}
                        className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
                      >
                        <span>Check Stock Availability</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>

                  </div>
                );
              })}
            </div>
          )}

          {/* Interactive Map */}
          {(viewMode === 'split' || viewMode === 'map') && (
            <div className={`${viewMode === 'split' ? 'lg:col-span-6' : 'lg:col-span-12'} sticky top-24`}>
              <div className="bg-white rounded-3xl p-4 border border-slate-200 shadow-md space-y-3">
                <div className="flex items-center justify-between px-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span className="text-xs font-extrabold text-slate-800">Spatial Chemist Radar</span>
                  </div>
                  <span className="text-[11px] text-slate-400">Click pins for directions</span>
                </div>

                <div className="h-[620px] rounded-2xl overflow-hidden border border-slate-200">
                  <InteractiveMap
                    pharmacies={sorted}
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

      </div>
    </div>
  );
};
