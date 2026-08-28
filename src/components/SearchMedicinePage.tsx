import React, { useState, useRef, useEffect } from 'react';
import { 
  Search, 
  MapPin, 
  Navigation, 
  ChevronDown, 
  Sparkles, 
  Clock, 
  ShieldCheck, 
  Pill, 
  ArrowRight,
  Filter,
  Zap,
  CheckCircle2
} from 'lucide-react';
import { SearchFilters, Medicine, Pharmacy } from '../types';
import { POPULAR_LOCATIONS } from '../data/mockData';

interface SearchMedicinePageProps {
  filters: SearchFilters;
  setFilters: React.Dispatch<React.SetStateAction<SearchFilters>>;
  medicines: Medicine[];
  pharmacies?: Pharmacy[];
  selectedMedicine: Medicine | null;
  onSelectMedicine: (medicine: Medicine) => void;
  onExecuteSearch: () => void;
  onOpenAiPharmacist: () => void;
}

const CATEGORIES = [
  'All',
  'Pain Relief',
  'Antibiotics',
  'Fever & Cold',
  'Diabetes',
  'Cardiac',
  'Vitamins & Supplements',
  'Allergy',
  'Gastrointestinal',
];

const POPULAR_TAGS = [
  'Paracetamol 650mg',
  'Amoxicillin 500mg',
  'Ibuprofen 400mg',
  'Azithromycin 500mg',
  'Cetirizine 10mg',
  'Pantoprazole 40mg',
  'Metformin 500mg',
  'Vitamin C + Zinc',
  'Dolo 650',
  'Augmentin 625 Duo',
];

export const SearchMedicinePage: React.FC<SearchMedicinePageProps> = ({
  filters,
  setFilters,
  medicines,
  pharmacies = [],
  selectedMedicine,
  onSelectMedicine,
  onExecuteSearch,
  onOpenAiPharmacist,
}) => {
  const [medicineQuery, setMedicineQuery] = useState(filters?.query || '');
  const [locationName, setLocationName] = useState(filters?.location?.name || 'Mira Bhayandar, Maharashtra');
  const [radius, setRadius] = useState(filters?.radiusKm || 5);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [showMedicineSuggestions, setShowMedicineSuggestions] = useState(false);
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [isLocating, setIsLocating] = useState(false);

  const medicineInputRef = useRef<HTMLInputElement>(null);
  const medicineDropdownRef = useRef<HTMLDivElement>(null);
  const locationDropdownRef = useRef<HTMLDivElement>(null);

  // Sync inputs with filters prop when opening page
  useEffect(() => {
    setMedicineQuery(filters?.query || '');
  }, [filters?.query]);

  useEffect(() => {
    if (filters?.location?.name) {
      setLocationName(filters.location.name);
    }
  }, [filters?.location?.name]);

  useEffect(() => {
    if (filters?.radiusKm) {
      setRadius(filters.radiusKm);
    }
  }, [filters?.radiusKm]);

  // Click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        medicineDropdownRef.current &&
        !medicineDropdownRef.current.contains(e.target as Node) &&
        medicineInputRef.current &&
        !medicineInputRef.current.contains(e.target as Node)
      ) {
        setShowMedicineSuggestions(false);
      }
      if (
        locationDropdownRef.current &&
        !locationDropdownRef.current.contains(e.target as Node)
      ) {
        setShowLocationDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleUseCurrentLocation = () => {
    setIsLocating(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setIsLocating(false);
          const newLoc = {
            name: 'My Current Location (GPS)',
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setLocationName(newLoc.name);
          setFilters((prev) => ({ ...prev, location: newLoc }));
        },
        (error) => {
          setIsLocating(false);
          console.warn('Geolocation error fallback:', error);
          const fallback = POPULAR_LOCATIONS[0];
          setLocationName(fallback.name);
          setFilters((prev) => ({ ...prev, location: fallback }));
        },
        { enableHighAccuracy: true, timeout: 6000 }
      );
    } else {
      setIsLocating(false);
      const fallback = POPULAR_LOCATIONS[0];
      setLocationName(fallback.name);
      setFilters((prev) => ({ ...prev, location: fallback }));
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowMedicineSuggestions(false);
    setShowLocationDropdown(false);

    const queryToUse = medicineQuery.trim() || 'Paracetamol 650mg';

    const matched = medicines.find(
      (m) =>
        m.name.toLowerCase().includes(queryToUse.toLowerCase()) ||
        m.genericName.toLowerCase().includes(queryToUse.toLowerCase())
    );

    if (matched) {
      onSelectMedicine(matched);
    }

    setFilters((prev) => ({
      ...prev,
      query: queryToUse,
      radiusKm: radius,
      category: selectedCategory === 'All' ? undefined : selectedCategory,
    }));

    // DIRECTLY open /search/results
    onExecuteSearch();
  };

  const handleSelectTag = (tag: string) => {
    setMedicineQuery(tag);
    setShowMedicineSuggestions(false);
    
    const med = medicines.find(
      (m) => m.name.toLowerCase().includes(tag.toLowerCase()) || m.genericName.toLowerCase().includes(tag.toLowerCase())
    );
    if (med) onSelectMedicine(med);

    setFilters((prev) => ({ 
      ...prev, 
      query: tag,
      radiusKm: radius,
    }));
    
    onExecuteSearch();
  };

  const filteredSuggestions = medicines.filter(
    (m) =>
      !medicineQuery.trim() ||
      m.name.toLowerCase().includes(medicineQuery.toLowerCase()) ||
      m.genericName.toLowerCase().includes(medicineQuery.toLowerCase()) ||
      m.category.toLowerCase().includes(medicineQuery.toLowerCase())
  );

  return (
    <div className="py-8 sm:py-12 bg-slate-50 min-h-[85vh]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Page Header */}
        <div className="bg-gradient-to-r from-emerald-800 via-teal-900 to-slate-900 rounded-3xl p-6 sm:p-10 text-white shadow-xl relative overflow-hidden">
          <div className="absolute right-0 top-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="relative z-10 space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-400/30">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Real-Time Local Pharmacy Search</span>
            </div>
            
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
              Search Prescribed Medicines & Stock
            </h1>
            
            <p className="text-emerald-100/80 text-xs sm:text-sm leading-relaxed">
              Enter your prescribed medicine, preferred location, and search radius. We check real-time stock across licensed pharmacy counters instantly.
            </p>
          </div>

          <div className="mt-5 pt-4 border-t border-emerald-700/60 flex flex-wrap items-center justify-between gap-3 text-xs">
            <span className="text-emerald-200/90 flex items-center gap-1.5 font-medium">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>100% Verified Local Chemist Stores</span>
            </span>
            <button
              onClick={onOpenAiPharmacist}
              className="px-3.5 py-1.5 rounded-xl bg-emerald-600/90 hover:bg-emerald-500 text-white font-bold flex items-center gap-1.5 transition-all shadow-xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Ask AI Pharmacist About Substitutes</span>
            </button>
          </div>
        </div>

        {/* Dedicated Search Form Engine */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-200/50 border border-slate-200/90 space-y-6">
          <form onSubmit={handleSearchSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              
              {/* Field 1: Medicine Input */}
              <div className="md:col-span-6 relative">
                <label className="block text-xs font-extrabold text-slate-800 mb-1.5">
                  Medicine Name / Brand / Generic Composition
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Search className="w-4 h-4" />
                  </div>
                  <input
                    ref={medicineInputRef}
                    type="text"
                    value={medicineQuery}
                    onChange={(e) => {
                      setMedicineQuery(e.target.value);
                      setShowMedicineSuggestions(true);
                    }}
                    onFocus={() => setShowMedicineSuggestions(true)}
                    placeholder="e.g. Paracetamol 650mg, Dolo 650, Amoxicillin"
                    className="w-full pl-9.5 pr-3 py-3 text-sm bg-slate-50 hover:bg-slate-100/80 focus:bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-semibold text-slate-900 placeholder:text-slate-400 placeholder:font-normal"
                    autoFocus
                  />
                </div>

                {/* Suggestions Dropdown */}
                {showMedicineSuggestions && (
                  <div
                    ref={medicineDropdownRef}
                    className="absolute left-0 right-0 mt-1.5 bg-white rounded-2xl shadow-2xl border border-slate-200 p-2 z-50 max-h-64 overflow-y-auto"
                  >
                    <div className="px-3 py-1 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                      Matching Catalogue Medicines
                    </div>
                    {filteredSuggestions.length > 0 ? (
                      filteredSuggestions.slice(0, 10).map((med) => (
                        <button
                          key={med.id}
                          type="button"
                          onClick={() => {
                            setMedicineQuery(med.name);
                            onSelectMedicine(med);
                            setShowMedicineSuggestions(false);
                          }}
                          className="w-full text-left px-3 py-2 rounded-xl hover:bg-emerald-50 flex items-center justify-between group transition-colors"
                        >
                          <div>
                            <span className="text-xs font-bold text-slate-900 group-hover:text-emerald-700">{med.name}</span>
                            <span className="text-[11px] text-slate-400 block">{med.genericName} • {med.dosage}</span>
                          </div>
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-md">
                            {med.category}
                          </span>
                        </button>
                      ))
                    ) : (
                      <div className="p-3 text-xs text-slate-500 text-center">
                        Press Enter to search for "{medicineQuery}"
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Field 2: Location */}
              <div className="md:col-span-3 relative">
                <label className="block text-xs font-extrabold text-slate-800 mb-1.5">
                  Your Location
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={locationName}
                    onChange={(e) => {
                      setLocationName(e.target.value);
                      setShowLocationDropdown(true);
                    }}
                    onFocus={() => setShowLocationDropdown(true)}
                    placeholder="Enter city or area"
                    className="w-full pl-8.5 pr-8 py-3 text-sm bg-slate-50 hover:bg-slate-100/80 focus:bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-semibold text-slate-900"
                  />
                  <button
                    type="button"
                    onClick={handleUseCurrentLocation}
                    title="Use my current GPS location"
                    className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-emerald-600 hover:text-emerald-700"
                  >
                    <Navigation className={`w-4 h-4 ${isLocating ? 'animate-spin text-emerald-500' : ''}`} />
                  </button>
                </div>

                {/* Location Suggestions Dropdown */}
                {showLocationDropdown && (
                  <div
                    ref={locationDropdownRef}
                    className="absolute left-0 right-0 mt-1.5 bg-white rounded-2xl shadow-2xl border border-slate-200 p-2 z-50 max-h-56 overflow-y-auto"
                  >
                    <button
                      type="button"
                      onClick={() => {
                        handleUseCurrentLocation();
                        setShowLocationDropdown(false);
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 flex items-center gap-2 text-xs font-bold text-emerald-800 mb-1 transition-colors"
                    >
                      <Navigation className="w-3.5 h-3.5" />
                      <span>Use My Current GPS Location</span>
                    </button>
                    <div className="px-3 py-1 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                      Popular Neighborhood Areas
                    </div>
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

              {/* Field 3: Radius */}
              <div className="md:col-span-3">
                <label className="block text-xs font-extrabold text-slate-800 mb-1.5">
                  Search Radius
                </label>
                <div className="relative">
                  <select
                    value={radius}
                    onChange={(e) => setRadius(Number(e.target.value))}
                    className="w-full pl-3 pr-8 py-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-semibold text-slate-800 appearance-none cursor-pointer"
                  >
                    <option value={1}>Within 1 km</option>
                    <option value={2}>Within 2 km</option>
                    <option value={5}>Within 5 km</option>
                    <option value={10}>Within 10 km</option>
                    <option value={20}>Within 20 km</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </div>
              </div>

            </div>

            {/* Category Filter Tabs */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-600">
                Filter by Clinical Category:
              </label>
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3.5 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all ${
                      selectedCategory === cat
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Popular Tags */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <span className="block text-xs font-bold text-slate-600">
                Common Searches (1-Click Results):
              </span>
              <div className="flex items-center gap-1.5 flex-wrap text-xs">
                {POPULAR_TAGS.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => handleSelectTag(tag)}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300 text-slate-700 rounded-xl text-xs font-semibold border border-slate-200/70 transition-colors"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Submit Action */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                id="search-page-submit-btn"
                type="submit"
                className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold text-sm rounded-xl shadow-lg shadow-emerald-600/20 hover:shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
              >
                <Search className="w-4.5 h-4.5" />
                <span>Search Availability & View Results</span>
                <ArrowRight className="w-4.5 h-4.5 ml-1" />
              </button>
            </div>
          </form>
        </div>

        {/* Quick Help Box */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900">One Search = Live Stock</h4>
              <p className="text-[11px] text-slate-500 mt-0.5">Directly opens verified results without duplicate prompts.</p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900">Reserve at Counter</h4>
              <p className="text-[11px] text-slate-500 mt-0.5">Hold critical medicines for pickup before leaving home.</p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center shrink-0">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900">Change Anytime</h4>
              <p className="text-[11px] text-slate-500 mt-0.5">Modify query or radius anytime from the results page.</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
