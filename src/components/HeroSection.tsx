import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Map as GoogleMap,
  AdvancedMarker,
  Pin,
  useMap,
  useMapsLibrary,
} from '@vis.gl/react-google-maps';
import {
  Search,
  MapPin,
  Navigation,
  ArrowRight,
  Clock,
  ShieldCheck,
  Zap,
  Sparkles,
  ChevronDown,
  Phone,
  Compass,
  Map as MapIcon,
  Maximize2,
  Loader2,
} from 'lucide-react';
import { SearchFilters, Medicine, Pharmacy } from '../types';
import { POPULAR_LOCATIONS, calculateDistance } from '../data/mockData';
import { hasGoogleMapsKey, checkGmpQuotaError } from '../utils/gmpQuota';

interface HeroSectionProps {
  filters: SearchFilters;
  setFilters: React.Dispatch<React.SetStateAction<SearchFilters>>;
  onSearch: () => void;
  medicines: Medicine[];
  pharmacies?: Pharmacy[];
  selectedMedicine?: Medicine | null;
  selectedPharmacy?: Pharmacy | null;
  onSelectPharmacy?: (pharmacy: Pharmacy) => void;
  onOpenDirections?: (pharmacy: Pharmacy) => void;
  onSelectMedicine: (medicine: Medicine) => void;
  onOpenAiPharmacist?: () => void;
}

const HeroMapCameraSync: React.FC<{ center: google.maps.LatLngLiteral }> = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    if (map) {
      map.panTo(center);
    }
  }, [map, center.lat, center.lng]);
  return null;
};

interface HeroMiniMapProps {
  originLat: number;
  originLng: number;
  originName: string;
  pharmacies: Pharmacy[];
  activeHeroPharmacy: Pharmacy | null;
  selectedMedicine?: Medicine | null;
  onSelectPin: (pharmacy: Pharmacy) => void;
}

const HeroMiniMapWithApi: React.FC<HeroMiniMapProps> = ({
  originLat,
  originLng,
  originName,
  pharmacies,
  activeHeroPharmacy,
  selectedMedicine,
  onSelectPin,
}) => {
  return (
    <GoogleMap
      id="hero-mini-map"
      mapId="DEMO_MAP_ID"
      defaultCenter={{ lat: originLat, lng: originLng }}
      defaultZoom={14}
      gestureHandling="greedy"
      disableDefaultUI={true}
      internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
      style={{ width: '100%', height: '100%' }}
    >
      <HeroMapCameraSync center={{ lat: originLat, lng: originLng }} />

      {/* User Origin Beacon */}
      <AdvancedMarker
        position={{ lat: originLat, lng: originLng }}
        title={`Search Origin: ${originName}`}
        zIndex={1000}
      >
        <div className="relative flex items-center justify-center">
          <div className="w-4 h-4 rounded-full bg-blue-600 ring-4 ring-white shadow-lg z-10" />
          <div className="absolute w-8 h-8 rounded-full bg-blue-500/40 animate-ping" />
        </div>
      </AdvancedMarker>

      {/* Live Pharmacy Pins */}
      {pharmacies.slice(0, 8).map((pharmacy) => {
        const isSelected = activeHeroPharmacy?.id === pharmacy.id;
        const inv =
          pharmacy.inventory.find((i) => i.medicineId === selectedMedicine?.id) ||
          pharmacy.inventory[0];
        const isStocked = inv?.inStockStatus === 'In Stock';
        const pinColor = isSelected ? '#0284c7' : isStocked ? '#059669' : '#d97706';
        const borderColor = isSelected ? '#0369a1' : isStocked ? '#047857' : '#b45309';

        return (
          <AdvancedMarker
            key={pharmacy.id}
            position={{ lat: pharmacy.lat, lng: pharmacy.lng }}
            title={pharmacy.name}
            zIndex={isSelected ? 999 : 10}
            onClick={() => onSelectPin(pharmacy)}
          >
            <Pin
              background={pinColor}
              borderColor={borderColor}
              glyphColor="#ffffff"
              glyphText="+"
              scale={isSelected ? 1.15 : 0.95}
            />
          </AdvancedMarker>
        );
      })}
    </GoogleMap>
  );
};

interface PlacesAutocompleteSuggestionsProps {
  query: string;
  userEdited: boolean;
  onSelectPlace: (loc: { name: string; lat: number; lng: number }) => void;
}

const PlacesAutocompleteSuggestions: React.FC<PlacesAutocompleteSuggestionsProps> = ({
  query,
  userEdited,
  onSelectPlace,
}) => {
  const placesLib = useMapsLibrary('places');
  const sessionTokenRef = useRef<google.maps.places.AutocompleteSessionToken | null>(null);
  const [suggestions, setSuggestions] = useState<google.maps.places.AutocompleteSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const resetSession = useCallback(() => {
    sessionTokenRef.current = null;
    setSuggestions([]);
  }, []);

  useEffect(() => {
    if (!placesLib || !userEdited) return;
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const { AutocompleteSessionToken, AutocompleteSuggestion } = placesLib;
        if (!sessionTokenRef.current) {
          sessionTokenRef.current = new AutocompleteSessionToken();
        }
        setIsLoading(true);
        const res = await AutocompleteSuggestion.fetchAutocompleteSuggestions({
          input: trimmed,
          sessionToken: sessionTokenRef.current,
          includedRegionCodes: ['in'],
        });
        setSuggestions(res.suggestions || []);
      } catch (err) {
        checkGmpQuotaError(err);
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [placesLib, query, userEdited]);

  const handleSelectSuggestion = async (
    suggestion: google.maps.places.AutocompleteSuggestion
  ) => {
    if (!suggestion.placePrediction) return;
    try {
      const place = suggestion.placePrediction.toPlace();
      await place.fetchFields({
        fields: ['displayName', 'formattedAddress', 'location', 'viewport'],
      });
      if (place.location) {
        onSelectPlace({
          name: place.formattedAddress || place.displayName || query,
          lat: place.location.lat(),
          lng: place.location.lng(),
        });
      }
    } catch (err) {
      checkGmpQuotaError(err);
    } finally {
      resetSession();
    }
  };

  if (!userEdited || (!isLoading && suggestions.length === 0)) {
    return null;
  }

  return (
    <div className="mb-1.5 pb-1.5 border-b border-slate-100">
      <div className="px-2 py-1 text-[11px] font-bold text-emerald-700 uppercase tracking-wider flex items-center justify-between">
        <span>Google Places Suggestions</span>
        {isLoading && <Loader2 className="w-3 h-3 animate-spin text-emerald-600" />}
      </div>
      {suggestions.map((suggestion, idx) => (
        <button
          key={suggestion.placePrediction?.placeId || idx}
          type="button"
          onClick={() => void handleSelectSuggestion(suggestion)}
          className="w-full text-left px-3 py-1.5 rounded-lg hover:bg-emerald-50 text-xs text-slate-800 flex items-start gap-2 transition-colors cursor-pointer"
        >
          <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
          <span className="line-clamp-2">{suggestion.placePrediction?.text.text}</span>
        </button>
      ))}
    </div>
  );
};

export const HeroSection: React.FC<HeroSectionProps> = ({
  filters,
  setFilters,
  onSearch,
  medicines,
  pharmacies = [],
  selectedMedicine,
  selectedPharmacy,
  onSelectPharmacy,
  onOpenDirections,
  onSelectMedicine,
  onOpenAiPharmacist,
}) => {
  const [medicineQuery, setMedicineQuery] = useState(filters?.query || 'Paracetamol 650mg');
  const [locationName, setLocationName] = useState(
    filters?.location?.name || 'Mira Bhayandar, Maharashtra'
  );
  const [locationUserEdited, setLocationUserEdited] = useState(false);
  const [radius, setRadius] = useState(filters?.radiusKm || 5);
  const [showMedicineSuggestions, setShowMedicineSuggestions] = useState(false);
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [activeHeroPharmacy, setActiveHeroPharmacy] = useState<Pharmacy | null>(
    selectedPharmacy || pharmacies[0] || null
  );

  const medicineInputRef = useRef<HTMLInputElement>(null);
  const medicineDropdownRef = useRef<HTMLDivElement>(null);
  const locationDropdownRef = useRef<HTMLDivElement>(null);

  // Sync internal state when filters change externally
  useEffect(() => {
    if (filters?.query) setMedicineQuery(filters.query);
  }, [filters?.query]);

  useEffect(() => {
    if (filters?.location?.name) {
      setLocationName(filters.location.name);
      setLocationUserEdited(false);
    }
  }, [filters?.location?.name]);

  useEffect(() => {
    if (selectedPharmacy) {
      setActiveHeroPharmacy(selectedPharmacy);
    } else if (pharmacies.length > 0 && !activeHeroPharmacy) {
      setActiveHeroPharmacy(pharmacies[0]);
    }
  }, [selectedPharmacy, pharmacies]);

  // Close dropdowns on click outside
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

  const originLat = filters?.location?.lat ?? 19.2952;
  const originLng = filters?.location?.lng ?? 72.8544;

  // Filter medicine suggestions based on typed query
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
          setLocationUserEdited(false);
          setFilters((prev) => ({
            ...prev,
            location: userLoc,
          }));
        },
        (error) => {
          setIsLocating(false);
          console.warn('Geolocation error, falling back to default:', error);
          const fallback = POPULAR_LOCATIONS[0];
          setLocationName(fallback.name);
          setLocationUserEdited(false);
          setFilters((prev) => ({ ...prev, location: fallback }));
        },
        { enableHighAccuracy: true, timeout: 6000 }
      );
    } else {
      setIsLocating(false);
      const fallback = POPULAR_LOCATIONS[0];
      setLocationName(fallback.name);
      setLocationUserEdited(false);
      setFilters((prev) => ({ ...prev, location: fallback }));
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = medicineQuery.trim();
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
    onSearch();
  };

  const handleQuickTagClick = (tag: string) => {
    setMedicineQuery(tag);
    setFilters((prev) => ({
      ...prev,
      query: tag,
      radiusKm: radius,
    }));
    const matched = medicines.find(
      (m) =>
        m.name.toLowerCase().includes(tag.toLowerCase()) ||
        m.genericName.toLowerCase().includes(tag.toLowerCase())
    );
    if (matched) {
      onSelectMedicine(matched);
    }
    onSearch();
  };

  const activeInv = activeHeroPharmacy
    ? selectedMedicine
      ? activeHeroPharmacy.inventory.find((i) => i.medicineId === selectedMedicine.id)
      : activeHeroPharmacy.inventory[0]
    : null;

  const activeDistance = activeHeroPharmacy
    ? calculateDistance(
        originLat,
        originLng,
        activeHeroPharmacy.lat,
        activeHeroPharmacy.lng
      )
    : '0.4';

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-emerald-50/70 via-slate-50 to-white pt-8 pb-12 sm:pt-12 sm:pb-16 border-b border-slate-200/80">
      {/* Decorative background grid subtle overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0596690a_1px,transparent_1px),linear-gradient(to_bottom,#0596690a_1px,transparent_1px)] bg-[size:3rem_3rem] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="hero-section-container w-full flex flex-col-reverse lg:flex-row flex-wrap items-center gap-y-8 lg:gap-y-0">
          {/* Left Column: Headline, Search Engine Card & Quick Badges */}
          <div className="w-full lg:w-1/2 space-y-6 lg:pr-6">
            {/* Live Trust Banner */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-100/80 border border-emerald-300 text-emerald-900 text-xs font-bold shadow-xs">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600" />
              </span>
              <span>Live Pharmacy Stock Tracker & Google Maps Radar</span>
              <span className="text-emerald-500 font-normal">|</span>
              <span className="text-emerald-800 font-medium">98.4% Stock Accuracy</span>
            </div>

            {/* Main Headline */}
            <div className="space-y-3">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-[1.15]">
                Find Any Medicine <br className="hidden sm:inline" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700">
                  Instantly In-Stock
                </span>{' '}
                Near You.
              </h1>
              <p className="text-slate-600 text-sm sm:text-base max-w-xl font-normal leading-relaxed">
                Search prescribed medicines, check real-time stock across local licensed pharmacies, compare prices, and get verified turn-by-turn Google Maps directions.
              </p>
            </div>

            {/* Quick Value Props Banner */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1">
              <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white/90 border border-slate-200/80 shadow-xs">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800">100% Verified</h4>
                  <p className="text-[11px] text-slate-500">Licensed Pharmacies</p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white/90 border border-slate-200/80 shadow-xs">
                <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center shrink-0">
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800">Real-Time Sync</h4>
                  <p className="text-[11px] text-slate-500">Live inventory feed</p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white/90 border border-slate-200/80 shadow-xs">
                <div className="w-8 h-8 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center shrink-0">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800">Save Time & Effort</h4>
                  <p className="text-[11px] text-slate-500">Avoid futile visits</p>
                </div>
              </div>
            </div>

            {/* Prominent Search Card */}
            <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-xl shadow-slate-200/60 border border-slate-200/90 relative z-30">
              <form onSubmit={handleFormSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                  {/* Field 1: Medicine Name */}
                  <div className="sm:col-span-5 relative">
                    <label
                      htmlFor="medicine-search-input"
                      className="block text-xs font-bold text-slate-700 mb-1.5"
                    >
                      Search Medicine
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Search className="w-4 h-4" />
                      </div>
                      <input
                        id="medicine-search-input"
                        ref={medicineInputRef}
                        type="text"
                        value={medicineQuery}
                        onChange={(e) => {
                          setMedicineQuery(e.target.value);
                          setShowMedicineSuggestions(true);
                        }}
                        onFocus={() => setShowMedicineSuggestions(true)}
                        placeholder="e.g. Crocin, Dolo 650, Paracetamol"
                        className="w-full pl-9.5 pr-3 py-2.5 text-sm bg-slate-50 hover:bg-slate-100/80 focus:bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium text-slate-900 placeholder:text-slate-400"
                      />
                    </div>

                    {/* Suggestions Dropdown */}
                    {showMedicineSuggestions && (
                      <div
                        id="medicine-autosuggest-dropdown"
                        ref={medicineDropdownRef}
                        className="absolute left-0 right-0 mt-1.5 bg-white rounded-xl shadow-2xl border border-slate-200 p-2 z-50 max-h-56 overflow-y-auto"
                      >
                        <div className="px-2 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                          Popular Medicines & Brands
                        </div>
                        {filteredSuggestions.length > 0 ? (
                          filteredSuggestions.map((med) => (
                            <button
                              key={med.id}
                              type="button"
                              onClick={() => {
                                setMedicineQuery(med.name);
                                setFilters((prev) => ({ ...prev, query: med.name }));
                                setShowMedicineSuggestions(false);
                                onSelectMedicine(med);
                                onSearch();
                              }}
                              className="w-full text-left px-3 py-2 rounded-lg hover:bg-emerald-50 flex items-center justify-between group transition-colors"
                            >
                              <div>
                                <span className="text-xs font-bold text-slate-800 group-hover:text-emerald-700">
                                  {med.name}
                                </span>
                                <span className="text-[11px] text-slate-400 block">
                                  {med.genericName} • {med.form}
                                </span>
                              </div>
                              <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-100/60 px-2 py-0.5 rounded-full">
                                {med.category}
                              </span>
                            </button>
                          ))
                        ) : (
                          <div className="p-3 text-xs text-slate-500 text-center">
                            No match found. You can still search for &ldquo;{medicineQuery}&rdquo;
                          </div>
                        )}
                        <div className="pt-1.5 mt-1 border-t border-slate-100 flex justify-end">
                          <button
                            type="button"
                            onClick={() => setShowMedicineSuggestions(false)}
                            className="text-[11px] text-slate-400 hover:text-slate-600 px-2 py-1 font-medium"
                          >
                            Close
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Field 2: Your Location (with Places AutocompleteSuggestion) */}
                  <div className="sm:col-span-4 relative" ref={locationDropdownRef}>
                    <label
                      htmlFor="location-search-input"
                      className="block text-xs font-bold text-slate-700 mb-1.5"
                    >
                      Your Location
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <MapPin className="w-4 h-4" />
                      </div>
                      <input
                        id="location-search-input"
                        type="text"
                        value={locationName}
                        onChange={(e) => {
                          setLocationName(e.target.value);
                          setLocationUserEdited(true);
                          setShowLocationDropdown(true);
                        }}
                        onFocus={() => setShowLocationDropdown(true)}
                        placeholder="Enter location or area"
                        className="w-full pl-9.5 pr-8 py-2.5 text-sm bg-slate-50 hover:bg-slate-100/80 focus:bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium text-slate-900 placeholder:text-slate-400"
                      />
                      <button
                        type="button"
                        onClick={handleUseCurrentLocation}
                        title="Use my current GPS location"
                        className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-emerald-600 hover:text-emerald-700"
                      >
                        <Navigation
                          className={`w-4 h-4 ${
                            isLocating ? 'animate-spin text-emerald-500' : ''
                          }`}
                        />
                      </button>
                    </div>

                    {/* Location Suggestions Dropdown */}
                    {showLocationDropdown && (
                      <div
                        id="location-autosuggest-dropdown"
                        className="absolute left-0 right-0 mt-1.5 bg-white rounded-xl shadow-2xl border border-slate-200 p-2 z-50 max-h-64 overflow-y-auto"
                      >
                        {hasGoogleMapsKey && (
                          <PlacesAutocompleteSuggestions
                            query={locationName}
                            userEdited={locationUserEdited}
                            onSelectPlace={(loc) => {
                              setLocationName(loc.name);
                              setLocationUserEdited(false);
                              setFilters((prev) => ({ ...prev, location: loc }));
                              setShowLocationDropdown(false);
                            }}
                          />
                        )}

                        <button
                          type="button"
                          onClick={() => {
                            handleUseCurrentLocation();
                            setShowLocationDropdown(false);
                          }}
                          className="w-full text-left px-3 py-2 rounded-lg bg-emerald-50/80 hover:bg-emerald-100/80 flex items-center gap-2 text-xs font-bold text-emerald-800 mb-1 transition-colors"
                        >
                          <Navigation className="w-3.5 h-3.5" />
                          <span>Use My Current GPS Location</span>
                        </button>
                        <div className="px-2 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                          Popular Areas
                        </div>
                        {POPULAR_LOCATIONS.map((loc) => (
                          <button
                            key={loc.name}
                            type="button"
                            onClick={() => {
                              setLocationName(loc.name);
                              setLocationUserEdited(false);
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

                  {/* Field 3: Search Radius */}
                  <div className="sm:col-span-3">
                    <label
                      htmlFor="radius-select"
                      className="block text-xs font-bold text-slate-700 mb-1.5"
                    >
                      Radius
                    </label>
                    <div className="relative">
                      <select
                        id="radius-select"
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

                {/* Bottom Row: Submit Button & Quick Links */}
                <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="flex items-center gap-1.5 flex-wrap text-xs text-slate-500">
                    <span className="font-semibold text-slate-700">Quick Searches:</span>
                    {['Paracetamol', 'Dolo 650', 'Augmentin', 'Cetirizine', 'Azithromycin'].map(
                      (tag) => (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => handleQuickTagClick(tag)}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300 text-slate-600 rounded-lg text-[11px] font-medium border border-slate-200/70 transition-colors"
                        >
                          {tag}
                        </button>
                      )
                    )}
                  </div>

                  <button
                    id="hero-search-submit-btn"
                    type="submit"
                    className="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold text-sm rounded-xl shadow-md shadow-emerald-600/20 hover:shadow-lg transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer"
                  >
                    <Search className="w-4 h-4" />
                    <span>Search Availability</span>
                    <ArrowRight className="w-4 h-4 ml-0.5" />
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Right Column: Real Google Maps Mini Map Preview with Live Pharmacy Data */}
          <div className="w-full lg:w-1/2 flex items-center justify-center lg:pl-6">
            <div className="relative w-full max-w-sm sm:max-w-md lg:max-w-lg mx-auto">
              {/* Background gradient decorative ring */}
              <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/10 to-teal-500/20 rounded-3xl transform rotate-2 scale-105 filter blur-xl" />

              {/* Main Card Container */}
              <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 rounded-3xl p-4 sm:p-5 shadow-2xl text-white border border-emerald-400/30 overflow-hidden">
                {/* Header bar */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400">
                      <MapIcon className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white tracking-wide">
                        Live Google Map Radar
                      </h4>
                      <p className="text-[10px] text-emerald-200/80">
                        {pharmacies.length} pharmacies nearby
                      </p>
                    </div>
                  </div>

                  <div className="bg-emerald-500/20 border border-emerald-400/40 text-emerald-200 text-[11px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>Live Stock Active</span>
                  </div>
                </div>

                {/* Real Interactive Google Mini Map Container */}
                <div className="rounded-2xl overflow-hidden h-48 sm:h-64 lg:h-72 border border-slate-700/80 shadow-inner relative isolate map-isolated-container bg-slate-900">
                  <div id="hero-interactive-mini-map" className="w-full h-full">
                    {hasGoogleMapsKey ? (
                      <HeroMiniMapWithApi
                        originLat={originLat}
                        originLng={originLng}
                        originName={locationName}
                        pharmacies={pharmacies}
                        activeHeroPharmacy={activeHeroPharmacy}
                        selectedMedicine={selectedMedicine}
                        onSelectPin={(pharmacy) => {
                          setActiveHeroPharmacy(pharmacy);
                          if (onSelectPharmacy) onSelectPharmacy(pharmacy);
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center text-slate-300 text-xs space-y-2">
                        <MapIcon className="w-7 h-7 text-emerald-400" />
                        <p className="font-semibold">
                          Google Maps preview requires a configured API key.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Floating map top tag */}
                  <div className="absolute top-2.5 left-2.5 z-10 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-lg text-[10px] font-bold text-slate-800 shadow-sm border border-slate-200 flex items-center gap-1.5">
                    <Compass className="w-3 h-3 text-emerald-600" />
                    <span>
                      {locationName.split(',')[0]} ({radius}km)
                    </span>
                  </div>

                  {/* Floating Full Map Button */}
                  <button
                    type="button"
                    onClick={onSearch}
                    title="Open Full Map"
                    className="absolute top-2.5 right-2.5 z-10 bg-white/90 hover:bg-white backdrop-blur-md p-1.5 rounded-lg text-slate-700 hover:text-emerald-700 shadow-sm border border-slate-200 transition-colors cursor-pointer"
                  >
                    <Maximize2 className="w-3.5 h-3.5" />
                  </button>

                  {/* Active Selected Pharmacy Card Overlay */}
                  {activeHeroPharmacy && (
                    <div className="absolute bottom-2.5 left-2.5 right-2.5 z-10 bg-white/95 backdrop-blur-md rounded-xl p-2.5 shadow-xl border border-slate-200 text-slate-900 animate-in fade-in duration-200">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                            <p className="text-xs font-bold text-slate-900 truncate leading-tight">
                              {activeHeroPharmacy.name}
                            </p>
                          </div>
                          <p className="text-[10px] text-slate-500 mt-0.5">
                            {activeDistance} km away • {activeHeroPharmacy.area}
                          </p>
                          <div className="mt-1 flex items-center gap-1.5">
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200">
                              {activeInv ? activeInv.inStockStatus : 'In Stock'}
                            </span>
                            <span className="text-[11px] font-extrabold text-slate-800">
                              ₹{activeInv ? activeInv.price.toFixed(2) : '15.00'}
                            </span>
                          </div>
                        </div>

                        <div className="flex flex-col gap-1 shrink-0">
                          {onOpenDirections && (
                            <button
                              type="button"
                              onClick={() => onOpenDirections(activeHeroPharmacy)}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-bold flex items-center gap-1 shadow-xs transition-colors cursor-pointer"
                            >
                              <Navigation className="w-3 h-3" />
                              <span>Route</span>
                            </button>
                          )}
                          <a
                            href={`tel:${activeHeroPharmacy.phone}`}
                            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1 transition-colors"
                          >
                            <Phone className="w-3 h-3 text-emerald-600" />
                            <span>Call</span>
                          </a>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer action */}
                <div className="mt-3.5 pt-3 border-t border-slate-700/60 flex items-center justify-between text-xs">
                  <button
                    type="button"
                    onClick={onSearch}
                    className="text-emerald-300 hover:text-emerald-200 font-bold flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <span>View all {pharmacies.length} on Full Map</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={onOpenAiPharmacist}
                    className="text-[11px] text-teal-300/90 hover:text-teal-200 flex items-center gap-1 cursor-pointer"
                  >
                    <Sparkles className="w-3 h-3 text-amber-300" />
                    <span>AI Assistant</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
