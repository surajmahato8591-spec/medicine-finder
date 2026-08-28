import React, { useState, useRef, useEffect } from 'react';
import { 
  Search, 
  MapPin, 
  Navigation, 
  ArrowRight, 
  ShieldCheck, 
  Clock, 
  CheckCircle2, 
  ChevronDown,
  AlertTriangle,
  Store,
  Building2,
  Navigation2,
  Check,
  UserCheck,
  Lock,
  Compass,
  Heart,
  Users
} from 'lucide-react';
import { SearchFilters, Medicine, Pharmacy, UserRole } from '../types';
import { POPULAR_LOCATIONS } from '../data/mockData';
import { AboutSection } from './AboutSection';

interface LandingPageProps {
  filters: SearchFilters;
  setFilters: React.Dispatch<React.SetStateAction<SearchFilters>>;
  onInitiateSearch: (queryOverride?: string) => void;
  medicines: Medicine[];
  pharmacies?: Pharmacy[];
  selectedMedicine?: Medicine | null;
  selectedPharmacy?: Pharmacy | null;
  onSelectPharmacy?: (pharmacy: Pharmacy) => void;
  onOpenDirections?: (pharmacy: Pharmacy) => void;
  onSelectMedicine: (medicine: Medicine) => void;
  onOpenAuth: (isRegister?: boolean, role?: UserRole, notice?: string | null) => void;
  onNavigate: (tab: 'home' | 'search' | 'search-results' | 'nearby-pharmacies' | 'dashboard' | 'pharmacy-dashboard' | 'admin-dashboard' | 'about' | 'how-it-works') => void;
  onOpenAiPharmacist?: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  filters,
  setFilters,
  onInitiateSearch,
  medicines,
  onSelectMedicine,
  onOpenAuth,
  onNavigate,
}) => {
  const [medicineQuery, setMedicineQuery] = useState(filters?.query || 'Paracetamol 650mg');
  const [locationName, setLocationName] = useState(filters?.location?.name || 'Mira Bhayandar, Maharashtra');
  const [radius, setRadius] = useState(filters?.radiusKm || 5);
  const [showMedicineSuggestions, setShowMedicineSuggestions] = useState(false);
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [isLocating, setIsLocating] = useState(false);

  const medicineInputRef = useRef<HTMLInputElement>(null);
  const medicineDropdownRef = useRef<HTMLDivElement>(null);
  const locationDropdownRef = useRef<HTMLDivElement>(null);

  // Sync internal search query state
  useEffect(() => {
    if (filters?.query) setMedicineQuery(filters.query);
  }, [filters?.query]);

  useEffect(() => {
    if (filters?.location?.name) {
      setLocationName(filters.location.name);
    }
  }, [filters?.location?.name]);

  // Click outside listener for suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        medicineDropdownRef.current &&
        !medicineDropdownRef.current.contains(event.target as Node) &&
        medicineInputRef.current &&
        !medicineInputRef.current.contains(event.target as Node)
      ) {
        setShowMedicineSuggestions(false);
      }
      if (
        locationDropdownRef.current &&
        !locationDropdownRef.current.contains(event.target as Node)
      ) {
        setShowLocationDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Filter medicine suggestions
  const filteredSuggestions = medicines.filter(
    (m) =>
      m.name.toLowerCase().includes(medicineQuery.toLowerCase()) ||
      m.genericName.toLowerCase().includes(medicineQuery.toLowerCase()) ||
      m.category.toLowerCase().includes(medicineQuery.toLowerCase())
  );

  const handleUseCurrentLocation = () => {
    setIsLocating(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setIsLocating(false);
          const userLoc = {
            name: 'My Current Location (GPS)',
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setLocationName(userLoc.name);
          setFilters((prev) => ({
            ...prev,
            location: userLoc,
          }));
        },
        (error) => {
          setIsLocating(false);
          console.warn('Geolocation error, using default:', error);
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

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = medicineQuery.trim() || 'Paracetamol 650mg';
    setFilters((prev) => ({
      ...prev,
      query: query,
      radiusKm: radius,
    }));
    if (query) {
      const matched = medicines.find(
        (m) =>
          m.name.toLowerCase().includes(query.toLowerCase()) ||
          m.genericName.toLowerCase().includes(query.toLowerCase())
      );
      if (matched) {
        onSelectMedicine(matched);
      }
    }
    onInitiateSearch(query);
  };

  const handleQuickTagClick = (tag: string) => {
    setMedicineQuery(tag);
    setFilters((prev) => ({
      ...prev,
      query: tag,
      radiusKm: radius,
    }));
    const matched = medicines.find(
      (m) => m.name.toLowerCase().includes(tag.toLowerCase()) || m.genericName.toLowerCase().includes(tag.toLowerCase())
    );
    if (matched) {
      onSelectMedicine(matched);
    }
    onInitiateSearch(tag);
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="bg-slate-50 text-slate-900 font-sans">
      
      {/* SECTION 1: HERO SECTION & QUICK SEARCH CARD */}
      <section className="relative overflow-hidden bg-gradient-to-b from-emerald-50/70 via-teal-50/30 to-white pt-10 pb-16 sm:pt-14 sm:pb-20 border-b border-slate-200/80">
        
        {/* Background ambient grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#0596690a_1px,transparent_1px),linear-gradient(to_bottom,#0596690a_1px,transparent_1px)] bg-[size:3rem_3rem] pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col-reverse lg:flex-row items-center gap-8 lg:gap-12">
            
            {/* Left Headline & Search Form */}
            <div className="w-full lg:w-7/12 space-y-6">
              
              {/* Trust Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100/90 border border-emerald-300 text-emerald-900 text-xs font-bold shadow-xs">
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
                </span>
                <span>Verified Chemist Network</span>
                <span className="text-emerald-500 font-normal">•</span>
                <span className="text-emerald-800 font-medium">Counter Pickup Ready</span>
              </div>

              {/* Requirement 1: Headline & Subtitle */}
              <div className="space-y-3">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-[1.15]">
                  Find Your <span className="text-emerald-600 underline decoration-emerald-300 decoration-wavy decoration-2">Medicine</span>.<br />
                  <span className="text-teal-700">Without Wasting Time.</span>
                </h1>
                <p className="text-slate-600 text-sm sm:text-base max-w-xl font-normal leading-relaxed">
                  Check medicine availability at nearby pharmacies before you visit, and quickly find where your required medicine is available.
                </p>
              </div>

              {/* Hero Action Buttons */}
              <div className="flex items-center gap-3 pt-1">
                <button
                  id="hero-primary-login-btn"
                  onClick={() => onOpenAuth(false, 'patient', "Please log in or register to search live medicine availability.")}
                  className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm rounded-xl shadow-md shadow-emerald-600/20 transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Lock className="w-4 h-4" />
                  <span>Login to Find Medicine</span>
                </button>
                <button
                  id="hero-secondary-how-it-works-btn"
                  onClick={() => scrollToSection('how-it-works-section')}
                  className="px-5 py-3 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-bold text-sm rounded-xl transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <Clock className="w-4 h-4 text-emerald-600" />
                  <span>How It Works</span>
                </button>
              </div>

              {/* Quick Search Form Card (Preserves query -> prompts login) */}
              <div id="quick-search-card" className="bg-white rounded-2xl p-5 shadow-xl shadow-slate-200/70 border border-slate-200 relative z-30 space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-2 text-xs font-extrabold uppercase text-slate-800 tracking-wider">
                    <Search className="w-4 h-4 text-emerald-600" />
                    <span>Quick Medicine Availability Search</span>
                  </div>
                  <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200">
                    Directory Search
                  </span>
                </div>

                <form onSubmit={handleFormSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                    
                    {/* Field 1: Medicine Name */}
                    <div className="sm:col-span-5 relative">
                      <label htmlFor="landing-medicine-input" className="block text-xs font-bold text-slate-700 mb-1">
                        Medicine Name
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                          <Search className="w-4 h-4" />
                        </div>
                        <input
                          id="landing-medicine-input"
                          ref={medicineInputRef}
                          type="text"
                          value={medicineQuery}
                          onChange={(e) => {
                            setMedicineQuery(e.target.value);
                            setShowMedicineSuggestions(true);
                          }}
                          onFocus={() => setShowMedicineSuggestions(true)}
                          placeholder="e.g. Paracetamol 650mg, Dolo 650"
                          className="w-full pl-9 pr-3 py-2.5 text-sm bg-slate-50 hover:bg-slate-100/80 focus:bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-medium text-slate-900"
                        />
                      </div>

                      {/* Medicine Suggestions Dropdown */}
                      {showMedicineSuggestions && (
                        <div 
                          ref={medicineDropdownRef}
                          className="absolute left-0 right-0 mt-1.5 bg-white rounded-xl shadow-2xl border border-slate-200 p-2 z-50 max-h-56 overflow-y-auto"
                        >
                          <div className="px-2 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                            Popular Medicines
                          </div>
                          {filteredSuggestions.map((med) => (
                            <button
                              key={med.id}
                              type="button"
                              onClick={() => {
                                setMedicineQuery(med.name);
                                setFilters((prev) => ({ ...prev, query: med.name }));
                                setShowMedicineSuggestions(false);
                                onSelectMedicine(med);
                                onInitiateSearch(med.name);
                              }}
                              className="w-full text-left px-3 py-2 rounded-lg hover:bg-emerald-50 flex items-center justify-between group transition-colors"
                            >
                              <div>
                                <span className="text-xs font-bold text-slate-800 group-hover:text-emerald-700">{med.name}</span>
                                <span className="text-[11px] text-slate-400 block">{med.genericName}</span>
                              </div>
                              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-100/80 px-2 py-0.5 rounded-full">
                                {med.category}
                              </span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Field 2: Your Location */}
                    <div className="sm:col-span-4 relative">
                      <label htmlFor="landing-location-input" className="block text-xs font-bold text-slate-700 mb-1">
                        Your Location
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                          <MapPin className="w-4 h-4" />
                        </div>
                        <input
                          id="landing-location-input"
                          type="text"
                          value={locationName}
                          onChange={(e) => {
                            setLocationName(e.target.value);
                            setShowLocationDropdown(true);
                          }}
                          onFocus={() => setShowLocationDropdown(true)}
                          placeholder="Area or locality"
                          className="w-full pl-9 pr-8 py-2.5 text-sm bg-slate-50 hover:bg-slate-100/80 focus:bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-medium text-slate-900"
                        />
                        <button
                          type="button"
                          onClick={handleUseCurrentLocation}
                          title="Use current GPS location"
                          className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-emerald-600 hover:text-emerald-700"
                        >
                          <Navigation className={`w-4 h-4 ${isLocating ? 'animate-spin' : ''}`} />
                        </button>
                      </div>

                      {/* Location Suggestions */}
                      {showLocationDropdown && (
                        <div 
                          ref={locationDropdownRef}
                          className="absolute left-0 right-0 mt-1.5 bg-white rounded-xl shadow-2xl border border-slate-200 p-2 z-50 max-h-56 overflow-y-auto"
                        >
                          <button
                            type="button"
                            onClick={() => {
                              handleUseCurrentLocation();
                              setShowLocationDropdown(false);
                            }}
                            className="w-full text-left px-3 py-2 rounded-lg bg-emerald-50 hover:bg-emerald-100 flex items-center gap-2 text-xs font-bold text-emerald-800 mb-1"
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
                              className="w-full text-left px-3 py-1.5 rounded-lg hover:bg-slate-100 text-xs text-slate-800 flex items-center gap-2"
                            >
                              <MapPin className="w-3 h-3 text-slate-400" />
                              <span>{loc.name}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Field 3: Radius */}
                    <div className="sm:col-span-3">
                      <label htmlFor="landing-radius-select" className="block text-xs font-bold text-slate-700 mb-1">
                        Search Radius
                      </label>
                      <div className="relative">
                        <select
                          id="landing-radius-select"
                          value={radius}
                          onChange={(e) => setRadius(Number(e.target.value))}
                          className="w-full pl-3 pr-8 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-medium text-slate-800 appearance-none cursor-pointer"
                        >
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

                  {/* Submit Button & Quick Tag Row */}
                  <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="flex items-center gap-1.5 flex-wrap text-xs text-slate-500">
                      <span className="font-semibold text-slate-700">Quick Searches:</span>
                      {['Paracetamol', 'Dolo 650', 'Augmentin', 'Cetirizine'].map((tag) => (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => handleQuickTagClick(tag)}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300 text-slate-600 rounded-lg text-[11px] font-medium border border-slate-200 transition-colors"
                        >
                          {tag}
                        </button>
                      ))}
                    </div>

                    <button
                      id="landing-search-submit-btn"
                      type="submit"
                      className="w-full sm:w-auto px-7 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm rounded-xl shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer"
                    >
                      <span>Find Medicine</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </form>
              </div>

            </div>

            {/* Right Side: STATIC DECORATIVE PHARMACY / MAP RADAR ILLUSTRATION (No real pharmacy data, no live stock) */}
            <div className="w-full lg:w-5/12 flex items-center justify-center">
              <div className="relative w-full max-w-sm sm:max-w-md mx-auto">
                
                <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/20 to-teal-500/30 rounded-3xl transform rotate-2 scale-105 filter blur-xl"></div>
                
                <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 rounded-3xl p-6 shadow-2xl text-white border border-emerald-400/30 overflow-hidden space-y-5">
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400">
                        <Store className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-white tracking-wide">Chemist Radar Directory</h4>
                        <p className="text-[10px] text-emerald-200/80">Hyperlocal Medicine Availability</p>
                      </div>
                    </div>

                    <div className="bg-emerald-500/20 border border-emerald-400/40 text-emerald-200 text-[11px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                      <span>Network Active</span>
                    </div>
                  </div>

                  {/* Static Decorative Map Canvas Graphic */}
                  <div className="rounded-2xl overflow-hidden h-64 border border-slate-700/80 shadow-inner relative isolate bg-slate-950 flex flex-col items-center justify-center p-4 text-center">
                    
                    {/* Decorative Radar Lines */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
                      <div className="w-48 h-48 rounded-full border border-emerald-400/60 animate-ping"></div>
                      <div className="absolute w-36 h-36 rounded-full border border-emerald-400"></div>
                      <div className="absolute w-24 h-24 rounded-full border border-emerald-400"></div>
                      <div className="absolute w-12 h-12 rounded-full border border-emerald-400"></div>
                    </div>

                    {/* Static Decorative Location Pins */}
                    <div className="absolute top-10 left-12 w-8 h-8 rounded-full bg-emerald-600/90 text-white flex items-center justify-center shadow-lg border border-white text-xs font-bold">
                      +
                    </div>
                    <div className="absolute bottom-12 right-12 w-8 h-8 rounded-full bg-teal-600/90 text-white flex items-center justify-center shadow-lg border border-white text-xs font-bold">
                      +
                    </div>
                    <div className="absolute top-14 right-16 w-8 h-8 rounded-full bg-sky-600/90 text-white flex items-center justify-center shadow-lg border border-white text-xs font-bold">
                      +
                    </div>

                    {/* Center Beacon */}
                    <div className="relative z-10 space-y-2 max-w-xs">
                      <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-400/50 flex items-center justify-center text-emerald-400 mx-auto shadow-lg">
                        <MapPin className="w-6 h-6 animate-bounce" />
                      </div>
                      <p className="text-xs font-extrabold text-white">Live Chemist Stock Network</p>
                      <p className="text-[11px] text-slate-300 leading-snug">
                        Log in to view live pharmacy locations, real-time stock levels, counter prices, and directions.
                      </p>
                    </div>

                  </div>

                  <div className="pt-2 flex items-center justify-between text-xs">
                    <button
                      onClick={() => onOpenAuth(false, 'patient', "Please log in or register to access nearby pharmacies and live maps.")}
                      className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Lock className="w-3.5 h-3.5" />
                      <span>Log In to Access Live Map & Stock</span>
                    </button>
                  </div>

                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* SECTION 2: KEY BENEFITS CARDS */}
      <section className="py-12 bg-white border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-8">
            <h2 className="text-xs font-extrabold uppercase tracking-wider text-emerald-700 mb-1">
              Why Patients Rely On Us
            </h2>
            <p className="text-2xl font-black text-slate-900 tracking-tight">
              Simple, Reliable Medicine Search Before You Travel
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Card 1 */}
            <div className="bg-slate-50/80 hover:bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-all group">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold mb-4 group-hover:scale-110 transition-transform">
                <Check className="w-5 h-5 stroke-[2.5]" />
              </div>
              <h3 className="text-base font-extrabold text-slate-900 mb-1.5 flex items-center gap-1.5">
                <span>Check Medicine Availability</span>
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Know whether your required medicine is currently in stock at local licensed chemist shops before stepping out.
              </p>
            </div>

            {/* Card 2 */}
            <div className="bg-slate-50/80 hover:bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-all group">
              <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center font-bold mb-4 group-hover:scale-110 transition-transform">
                <MapPin className="w-5 h-5 stroke-[2.5]" />
              </div>
              <h3 className="text-base font-extrabold text-slate-900 mb-1.5 flex items-center gap-1.5">
                <span>Find Nearby Pharmacies</span>
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Locate verified pharmacy counters within your chosen radius (2km to 20km) with distance and live open status.
              </p>
            </div>

            {/* Card 3 */}
            <div className="bg-slate-50/80 hover:bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-all group">
              <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center font-bold mb-4 group-hover:scale-110 transition-transform">
                <Clock className="w-5 h-5 stroke-[2.5]" />
              </div>
              <h3 className="text-base font-extrabold text-slate-900 mb-1.5 flex items-center gap-1.5">
                <span>Save Valuable Time</span>
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Avoid visiting multiple chemist stores unnecessarily during medical emergencies or tight daily schedules.
              </p>
            </div>

            {/* Card 4 */}
            <div className="bg-slate-50/80 hover:bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-all group">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold mb-4 group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-5 h-5 stroke-[2.5]" />
              </div>
              <h3 className="text-base font-extrabold text-slate-900 mb-1.5 flex items-center gap-1.5">
                <span>Verified Information</span>
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                View verified phone numbers, operating hours, exact addresses, and counter prices updated directly by store owners.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* SECTION 3: HOW IT WORKS */}
      <section id="how-it-works-section" className="py-16 bg-slate-50 border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
            <span className="text-xs font-extrabold text-emerald-700 uppercase tracking-widest bg-emerald-100/80 px-3 py-1 rounded-full border border-emerald-300">
              Simple 4-Step Process
            </span>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">How MediFinder Works</h2>
            <p className="text-sm text-slate-600">Find your required medicines and navigate to stocked pharmacies in minutes.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
            
            {/* Step 1 */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs relative z-10 space-y-3">
              <span className="text-3xl font-black text-emerald-600/30">01</span>
              <h3 className="text-base font-extrabold text-slate-900">Search Medicine</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Enter your prescribed brand name (e.g. Crocin, Dolo 650) or active generic chemical salt composition.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs relative z-10 space-y-3">
              <span className="text-3xl font-black text-emerald-600/30">02</span>
              <h3 className="text-base font-extrabold text-slate-900">Choose Location</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Detect your current GPS coordinates or enter your specific locality and select your desired search radius.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs relative z-10 space-y-3">
              <span className="text-3xl font-black text-emerald-600/30">03</span>
              <h3 className="text-base font-extrabold text-slate-900">Find Nearby Pharmacy</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Compare stocked chemist shops on our interactive map with real-time stock status (In Stock, Low Stock).
              </p>
            </div>

            {/* Step 4 */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs relative z-10 space-y-3">
              <span className="text-3xl font-black text-emerald-600/30">04</span>
              <h3 className="text-base font-extrabold text-slate-900">Visit & Collect</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Call the store directly, open turn-by-turn map directions, or place a 2-hour counter pickup reservation.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* SECTION 4: WHAT MEDIFINDER OFFERS (Informational Overview) */}
      <section className="py-16 bg-white border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
            <span className="text-xs font-extrabold uppercase text-emerald-700 tracking-wider">Platform Capabilities</span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              What MediFinder Provides
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              Connecting patients and neighborhood chemist shops through real-time stock transparency.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Feature 1 */}
            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                <Building2 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-extrabold text-slate-900">Verified Local Chemist Network</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Access official drug license registered retail chemist shops across your locality with verified operating hours and phone contact numbers.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center font-bold">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-extrabold text-slate-900">Real-Time Counter Stock Status</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Pharmacy managers update their inventory daily, ensuring you know exactly which store has your prescribed dose in stock before you leave home.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center font-bold">
                <Store className="w-5 h-5" />
              </div>
              <h3 className="text-base font-extrabold text-slate-900">Counter Pickup Reservation</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Submit a free 2-hour counter reservation request so the chemist sets aside your required medicine while you travel to the store.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* SECTION 5: WHY MEDIFINDER */}
      <section className="py-16 bg-slate-900 text-white border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
            <span className="text-xs font-extrabold text-emerald-400 uppercase tracking-widest">
              Core Patient Benefits
            </span>
            <h2 className="text-3xl font-black text-white tracking-tight">Why Use MediFinder?</h2>
            <p className="text-sm text-slate-400">
              Eliminating the frustration of unguided pharmacy hopping with real-time stock transparency.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Point 1 */}
            <div className="bg-slate-800/80 rounded-2xl p-6 border border-slate-700 space-y-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                <Clock className="w-5 h-5" />
              </div>
              <h3 className="text-base font-extrabold text-white">Less Time Searching</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Check stock across all surrounding stores instantly before leaving home or your doctor's clinic.
              </p>
            </div>

            {/* Point 2 */}
            <div className="bg-slate-800/80 rounded-2xl p-6 border border-slate-700 space-y-2.5">
              <div className="w-9 h-9 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center font-bold">
                <MapPin className="w-5 h-5" />
              </div>
              <h3 className="text-base font-extrabold text-white">Nearby Availability</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Filter stores within 2km, 5km, 10km, or 20km to locate stocked medicines nearest to your position.
              </p>
            </div>

            {/* Point 3 */}
            <div className="bg-slate-800/80 rounded-2xl p-6 border border-slate-700 space-y-2.5">
              <div className="w-9 h-9 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold">
                <Search className="w-5 h-5" />
              </div>
              <h3 className="text-base font-extrabold text-white">Simple Search</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Search easily by commercial brand names (e.g. Crocin) or active generic compositions (e.g. Paracetamol).
              </p>
            </div>

            {/* Point 4 */}
            <div className="bg-slate-800/80 rounded-2xl p-6 border border-slate-700 space-y-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-extrabold text-white">Clear Stock Status</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Distinguish at a glance between In Stock, Low Stock, and Out of Stock statuses with updated timestamps.
              </p>
            </div>

            {/* Point 5 */}
            <div className="bg-slate-800/80 rounded-2xl p-6 border border-slate-700 space-y-2.5">
              <div className="w-9 h-9 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold">
                <Navigation2 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-extrabold text-white">Easy Directions</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                One-click access to turn-by-turn map navigation routing directly to the pharmacy entrance.
              </p>
            </div>

            {/* Point 6 */}
            <div className="bg-slate-800/80 rounded-2xl p-6 border border-slate-700 space-y-2.5">
              <div className="w-9 h-9 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center font-bold">
                <Store className="w-5 h-5" />
              </div>
              <h3 className="text-base font-extrabold text-white">Pickup Reservation</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Reserve your medicine at the counter for up to 2 hours to hold stock while you travel to the store.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* SECTION 6: URGENT USE / EMERGENCY NOTICE */}
      <section className="py-10 bg-amber-500/10 border-b border-amber-500/20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-amber-50 rounded-2xl p-6 border border-amber-200/80 shadow-xs flex flex-col md:flex-row items-start md:items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-amber-500/20">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="space-y-1 flex-1">
              <h3 className="text-base font-extrabold text-slate-900">
                Don't waste critical time visiting pharmacy after pharmacy!
              </h3>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                Check medicine availability online first, call the store, and navigate directly to the nearest stocked pharmacy counter.
              </p>
              <p className="text-[11px] text-slate-500 pt-1">
                Note: MediFinder is an availability directory. We do not provide emergency medical diagnosis or treatment services.
              </p>
            </div>
            <button
              onClick={() => scrollToSection('quick-search-card')}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-extrabold rounded-xl shrink-0 shadow-xs cursor-pointer"
            >
              Search Now
            </button>
          </div>
        </div>
      </section>

      {/* SECTION 7: PHARMACY OWNER SECTION */}
      <section className="py-16 bg-white border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-emerald-900 via-teal-900 to-slate-900 rounded-3xl p-8 sm:p-12 text-white shadow-xl relative overflow-hidden">
            
            <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full filter blur-3xl pointer-events-none"></div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
              
              <div className="lg:col-span-8 space-y-4">
                <span className="text-xs font-extrabold text-emerald-300 uppercase tracking-widest bg-emerald-800/50 px-3 py-1 rounded-full border border-emerald-700">
                  Chemist & Pharmacy Partner Portal
                </span>
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight">
                  Are you a Pharmacy Owner?
                </h2>
                <p className="text-sm sm:text-base text-emerald-100/90 leading-relaxed max-w-2xl">
                  Keep your medicine stock updated and help nearby customers find available medicines instantly. Manage counter pickup requests and increase store footfall effortlessly.
                </p>

                <div className="flex items-center gap-4 text-xs font-bold text-emerald-200 pt-2 flex-wrap">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Free Chemist Registration</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Live Stock Inventory Portal</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Direct Patient Call Requests</span>
                  </span>
                </div>
              </div>

              <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col gap-3 justify-end">
                <button
                  id="landing-pharmacy-login-btn"
                  onClick={() => onOpenAuth(false, 'pharmacy_owner')}
                  className="px-6 py-3 bg-white hover:bg-emerald-50 text-emerald-900 font-extrabold text-sm rounded-xl shadow-md transition-all text-center cursor-pointer"
                >
                  Pharmacy Owner Login
                </button>
                <button
                  id="landing-pharmacy-register-btn"
                  onClick={() => onOpenAuth(true, 'pharmacy_owner')}
                  className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-sm rounded-xl shadow-md transition-all text-center cursor-pointer"
                >
                  Register Pharmacy
                </button>
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* SECTION 8: ABOUT MEDIFINDER */}
      <section id="about-section">
        <AboutSection />
      </section>

    </div>
  );
};
