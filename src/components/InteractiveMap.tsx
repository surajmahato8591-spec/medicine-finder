import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import {
  Map as GoogleMap,
  AdvancedMarker,
  Pin,
  InfoWindow,
  Circle,
  useMap,
  useMapsLibrary,
  useAdvancedMarkerRef,
} from '@vis.gl/react-google-maps';
import { MarkerClusterer } from '@googlemaps/markerclusterer';
import {
  Navigation,
  Compass,
  Phone,
  MapPin,
  Maximize2,
  Layers,
  AlertTriangle,
} from 'lucide-react';
import { Pharmacy, Medicine, SearchFilters } from '../types';
import { calculateDistance } from '../data/mockData';
import { hasGoogleMapsKey, checkGmpQuotaError } from '../utils/gmpQuota';

interface InteractiveMapProps {
  pharmacies: Pharmacy[];
  selectedPharmacy: Pharmacy | null;
  onSelectPharmacy: (pharmacy: Pharmacy) => void;
  searchedMedicine?: Medicine | null;
  filters: SearchFilters;
  onOpenDirections: (pharmacy: Pharmacy) => void;
  onOpenCall?: (phone: string) => void;
}

interface RouteOverlayProps {
  origin: google.maps.LatLngLiteral;
  destination: google.maps.LatLngLiteral;
}

const RouteOverlay: React.FC<RouteOverlayProps> = ({ origin, destination }) => {
  const map = useMap();
  const routesLib = useMapsLibrary('routes');

  useEffect(() => {
    if (!map || !routesLib) return;

    let cancelled = false;
    let activePolylines: google.maps.Polyline[] = [];

    async function computeAndDraw() {
      if (!routesLib || !map) return;
      try {
        const { routes } = await routesLib.Route.computeRoutes({
          origin,
          destination,
          travelMode: 'DRIVING',
          fields: ['path', 'distanceMeters', 'durationMillis', 'viewport'],
        });

        if (cancelled) return;

        if (routes && routes.length > 0) {
          const primaryRoute = routes[0];
          const polylines = primaryRoute.createPolylines({
            polylineOptions: {
              strokeColor: '#0284c7',
              strokeOpacity: 0.85,
              strokeWeight: 4,
            },
          });
          polylines.forEach((p) => p.setMap(map));
          activePolylines = polylines;

          if (primaryRoute.viewport) {
            map.fitBounds(primaryRoute.viewport, 48);
          } else {
            map.panTo(destination);
          }
        }
      } catch (err) {
        checkGmpQuotaError(err);
        if (!cancelled && map) {
          const fallbackLine = new google.maps.Polyline({
            path: [origin, destination],
            geodesic: true,
            strokeColor: '#0284c7',
            strokeOpacity: 0.75,
            strokeWeight: 3,
            map,
          });
          activePolylines = [fallbackLine];
          map.panTo(destination);
        }
      }
    }

    computeAndDraw();

    return () => {
      cancelled = true;
      activePolylines.forEach((p) => p.setMap(null));
    };
  }, [map, routesLib, origin.lat, origin.lng, destination.lat, destination.lng]);

  return null;
};

interface MapContentsProps {
  pharmacies: Pharmacy[];
  selectedPharmacy: Pharmacy | null;
  onSelectPharmacy: (pharmacy: Pharmacy) => void;
  searchedMedicine?: Medicine | null;
  originLat: number;
  originLng: number;
  originName: string;
  originRadius: number;
  showRadiusRing: boolean;
  clusteringEnabled: boolean;
  onOpenDirections: (pharmacy: Pharmacy) => void;
  onOpenCall?: (phone: string) => void;
}

interface PharmacyMarkerItemProps {
  pharmacy: Pharmacy;
  isSelected: boolean;
  searchedMedicine?: Medicine | null;
  onMarkerChange: (id: string, marker: google.maps.marker.AdvancedMarkerElement | null) => void;
  onSelect: (pharmacy: Pharmacy) => void;
}

const PharmacyMarkerItem: React.FC<PharmacyMarkerItemProps> = ({
  pharmacy,
  isSelected,
  searchedMedicine,
  onMarkerChange,
  onSelect,
}) => {
  const [markerRef, marker] = useAdvancedMarkerRef();

  useEffect(() => {
    onMarkerChange(pharmacy.id, marker);
    return () => {
      onMarkerChange(pharmacy.id, null);
    };
  }, [pharmacy.id, marker, onMarkerChange]);

  const inv = searchedMedicine
    ? pharmacy.inventory.find((i) => i.medicineId === searchedMedicine.id)
    : pharmacy.inventory[0];

  const isStocked = inv?.inStockStatus === 'In Stock';
  const isLowStock = inv?.inStockStatus === 'Low Stock';

  const pinBg = isSelected
    ? '#0284c7'
    : isStocked
    ? '#10b981'
    : isLowStock
    ? '#f59e0b'
    : '#94a3b8';

  const borderCol = isSelected
    ? '#0369a1'
    : isStocked
    ? '#047857'
    : isLowStock
    ? '#b45309'
    : '#475569';

  return (
    <AdvancedMarker
      ref={markerRef}
      position={{ lat: pharmacy.lat, lng: pharmacy.lng }}
      title={pharmacy.name}
      zIndex={isSelected ? 999 : 10}
      onClick={() => onSelect(pharmacy)}
    >
      <Pin
        background={pinBg}
        borderColor={borderCol}
        glyphColor="#ffffff"
        glyphText="+"
        scale={isSelected ? 1.25 : 1}
      />
    </AdvancedMarker>
  );
};

const MapContents: React.FC<MapContentsProps> = ({
  pharmacies,
  selectedPharmacy,
  onSelectPharmacy,
  searchedMedicine,
  originLat,
  originLng,
  originName,
  originRadius,
  showRadiusRing,
  clusteringEnabled,
  onOpenDirections,
  onOpenCall = (phone: string) => {
    window.location.href = `tel:${phone}`;
  },
}) => {
  const map = useMap();
  const clustererRef = useRef<MarkerClusterer | null>(null);
  const [markers, setMarkers] = useState<
    Record<string, google.maps.marker.AdvancedMarkerElement>
  >({});
  const [infoPharmacyId, setInfoPharmacyId] = useState<string | null>(
    selectedPharmacy?.id || null
  );

  // Sync InfoWindow target when selectedPharmacy changes externally
  useEffect(() => {
    if (selectedPharmacy) {
      setInfoPharmacyId(selectedPharmacy.id);
    }
  }, [selectedPharmacy]);

  const handleMarkerChange = useCallback(
    (id: string, marker: google.maps.marker.AdvancedMarkerElement | null) => {
      setMarkers((prev) => {
        if (marker) {
          if (prev[id] === marker) return prev;
          return { ...prev, [id]: marker };
        } else {
          if (!prev[id]) return prev;
          const next = { ...prev };
          delete next[id];
          return next;
        }
      });
    },
    []
  );

  // Manage MarkerClusterer lifecycle
  useEffect(() => {
    if (!map) return;

    if (clustererRef.current) {
      clustererRef.current.clearMarkers();
      clustererRef.current.setMap(null);
      clustererRef.current = null;
    }

    const currentMarkers: google.maps.marker.AdvancedMarkerElement[] = [];
    for (const p of pharmacies) {
      const m = markers[p.id];
      if (m) currentMarkers.push(m);
    }

    if (clusteringEnabled && currentMarkers.length > 0) {
      const clusterer = new MarkerClusterer({
        map,
        markers: currentMarkers,
      });
      clustererRef.current = clusterer;

      return () => {
        clusterer.clearMarkers();
        clusterer.setMap(null);
        currentMarkers.forEach((m) => {
          m.map = map;
        });
      };
    } else {
      currentMarkers.forEach((m) => {
        m.map = map;
      });
    }
  }, [map, pharmacies, clusteringEnabled, markers]);

  // Fit bounds on initial load / pharmacy list change when no pharmacy is selected
  useEffect(() => {
    if (!map || selectedPharmacy || pharmacies.length === 0) return;
    const bounds = new google.maps.LatLngBounds();
    bounds.extend({ lat: originLat, lng: originLng });
    pharmacies.forEach((p) => bounds.extend({ lat: p.lat, lng: p.lng }));
    map.fitBounds(bounds, 50);
  }, [map, pharmacies, originLat, originLng, selectedPharmacy]);

  const infoPharmacy = useMemo(
    () => pharmacies.find((p) => p.id === infoPharmacyId) || null,
    [pharmacies, infoPharmacyId]
  );
  const infoMarker = infoPharmacy ? markers[infoPharmacy.id] || null : null;

  return (
    <>
      {/* Origin Beacon Marker */}
      <AdvancedMarker
        position={{ lat: originLat, lng: originLng }}
        title={`Search Origin: ${originName}`}
        zIndex={1001}
      >
        <div className="relative flex items-center justify-center">
          <div className="w-4 h-4 rounded-full bg-blue-600 ring-4 ring-white shadow-lg z-10" />
          <div className="absolute w-8 h-8 rounded-full bg-blue-500/35 animate-ping" />
        </div>
      </AdvancedMarker>

      {/* Search Radius Circle */}
      {showRadiusRing && (
        <Circle
          center={{ lat: originLat, lng: originLng }}
          radius={originRadius * 1000}
          strokeColor="#059669"
          strokeOpacity={0.8}
          strokeWeight={1.5}
          fillColor="#10b981"
          fillOpacity={0.08}
        />
      )}

      {/* Pharmacy AdvancedMarkers */}
      {pharmacies.map((pharmacy) => (
        <PharmacyMarkerItem
          key={pharmacy.id}
          pharmacy={pharmacy}
          isSelected={selectedPharmacy?.id === pharmacy.id}
          searchedMedicine={searchedMedicine}
          onMarkerChange={handleMarkerChange}
          onSelect={(p) => {
            setInfoPharmacyId(p.id);
            onSelectPharmacy(p);
          }}
        />
      ))}

      {/* InfoWindow anchored to selected AdvancedMarkerElement or position fallback when clustered */}
      {infoPharmacy && (infoMarker || clusteringEnabled) && (
        <InfoWindow
          anchor={infoMarker?.map ? infoMarker : undefined}
          position={
            infoMarker?.map ? undefined : { lat: infoPharmacy.lat, lng: infoPharmacy.lng }
          }
          maxWidth={280}
          onCloseClick={() => setInfoPharmacyId(null)}
        >
          {(() => {
            const inv = searchedMedicine
              ? infoPharmacy.inventory.find((i) => i.medicineId === searchedMedicine.id)
              : infoPharmacy.inventory[0];
            const isStocked = inv?.inStockStatus === 'In Stock';
            const isLowStock = inv?.inStockStatus === 'Low Stock';
            const dist = calculateDistance(
              originLat,
              originLng,
              infoPharmacy.lat,
              infoPharmacy.lng
            );

            return (
              <div className="p-1 font-sans min-w-[210px]">
                <div className="flex justify-between items-start gap-2 border-b border-slate-200 pb-1.5">
                  <div>
                    <strong className="text-xs text-slate-900 block leading-tight">
                      {infoPharmacy.name}
                    </strong>
                    <span className="text-[11px] text-slate-500">
                      {infoPharmacy.area} • {dist} km away
                    </span>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded shrink-0 ${
                      isStocked
                        ? 'bg-emerald-100 text-emerald-800'
                        : isLowStock
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {inv ? inv.inStockStatus : 'Open'}
                  </span>
                </div>

                <div className="my-2 text-xs text-slate-700 space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-500">
                      {searchedMedicine ? searchedMedicine.name : 'Medicine'}:
                    </span>
                    <strong className="text-slate-900">
                      {inv ? `₹${inv.price.toFixed(2)}` : 'Available'}
                    </strong>
                  </div>
                  <div className="text-[11px] text-slate-500">🕒 {infoPharmacy.openHours}</div>
                </div>

                <div className="grid grid-cols-2 gap-1.5 mt-2">
                  <button
                    type="button"
                    onClick={() => onOpenCall(infoPharmacy.phone)}
                    className="px-2 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Phone className="w-3 h-3 text-emerald-600" />
                    <span>Call</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onOpenDirections(infoPharmacy)}
                    className="px-2 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-bold flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Navigation className="w-3 h-3" />
                    <span>Directions</span>
                  </button>
                </div>
              </div>
            );
          })()}
        </InfoWindow>
      )}

      {/* Real Routes API v2 Overlay when a pharmacy is selected */}
      {selectedPharmacy && (
        <RouteOverlay
          origin={{ lat: originLat, lng: originLng }}
          destination={{ lat: selectedPharmacy.lat, lng: selectedPharmacy.lng }}
        />
      )}
    </>
  );
};

const InteractiveMapWithApi: React.FC<InteractiveMapProps> = ({
  pharmacies,
  selectedPharmacy,
  onSelectPharmacy,
  searchedMedicine,
  filters,
  onOpenDirections,
  onOpenCall,
}) => {
  const originLat = filters?.location?.lat ?? 19.2952;
  const originLng = filters?.location?.lng ?? 72.8544;
  const originName = filters?.location?.name ?? 'Mira Bhayandar';
  const originRadius = filters?.radiusKm ?? 5;

  const map = useMap('main-pharmacy-map');

  const [mapType, setMapType] = useState<'roadmap' | 'satellite' | 'terrain'>('roadmap');
  const [showRadiusRing, setShowRadiusRing] = useState(true);
  const [clusteringEnabled, setClusteringEnabled] = useState(true);

  const handleRecenter = () => {
    if (map) {
      map.panTo({ lat: originLat, lng: originLng });
      map.setZoom(14);
    }
  };

  const handleFitAll = () => {
    if (map && typeof google !== 'undefined') {
      const bounds = new google.maps.LatLngBounds();
      bounds.extend({ lat: originLat, lng: originLng });
      pharmacies.forEach((p) => bounds.extend({ lat: p.lat, lng: p.lng }));
      map.fitBounds(bounds, 50);
    }
  };

  return (
    <div className="relative isolate map-isolated-container w-full h-full min-h-[420px] rounded-2xl overflow-hidden shadow-md border border-slate-200 bg-slate-100 flex flex-col">
      {/* Google Map Surface */}
      <div id="interactive-map-surface" className="w-full h-full min-h-[420px] flex-1 z-0">
        <GoogleMap
          id="main-pharmacy-map"
          mapId="DEMO_MAP_ID"
          defaultCenter={{ lat: originLat, lng: originLng }}
          defaultZoom={14}
          mapTypeId={mapType}
          gestureHandling="greedy"
          disableDefaultUI={false}
          zoomControl={true}
          mapTypeControl={false}
          streetViewControl={false}
          fullscreenControl={false}
          internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
          style={{ width: '100%', height: '100%' }}
        >
          <MapContents
            pharmacies={pharmacies}
            selectedPharmacy={selectedPharmacy}
            onSelectPharmacy={onSelectPharmacy}
            searchedMedicine={searchedMedicine}
            originLat={originLat}
            originLng={originLng}
            originName={originName}
            originRadius={originRadius}
            showRadiusRing={showRadiusRing}
            clusteringEnabled={clusteringEnabled}
            onOpenDirections={onOpenDirections}
            onOpenCall={onOpenCall}
          />
        </GoogleMap>
      </div>

      {/* Floating Map Controls Top-Left */}
      <div className="absolute top-3 left-3 right-14 z-20 flex flex-col items-start gap-2 pointer-events-none">
        <div className="bg-white/95 backdrop-blur-md rounded-xl p-1 shadow-md border border-slate-200 flex items-center text-[11px] sm:text-xs font-semibold text-slate-700 pointer-events-auto">
          <button
            type="button"
            onClick={() => setMapType('roadmap')}
            className={`px-2 sm:px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
              mapType === 'roadmap'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'hover:bg-slate-100 text-slate-600'
            }`}
          >
            Roadmap
          </button>
          <button
            type="button"
            onClick={() => setMapType('satellite')}
            className={`px-2 sm:px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
              mapType === 'satellite'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'hover:bg-slate-100 text-slate-600'
            }`}
          >
            Satellite
          </button>
          <button
            type="button"
            onClick={() => setMapType('terrain')}
            className={`px-2 sm:px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
              mapType === 'terrain'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'hover:bg-slate-100 text-slate-600'
            }`}
          >
            Terrain
          </button>
        </div>

        {/* Radius Ring & Cluster Toggles Row */}
        <div className="flex items-center gap-1.5 flex-wrap pointer-events-auto">
          <button
            type="button"
            onClick={() => setShowRadiusRing(!showRadiusRing)}
            className={`px-2.5 sm:px-3 py-1.5 rounded-xl text-[11px] sm:text-xs font-bold shadow-md border backdrop-blur-md flex items-center gap-1.5 transition-all cursor-pointer ${
              showRadiusRing
                ? 'bg-emerald-50/95 border-emerald-300 text-emerald-800'
                : 'bg-white/95 border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>{filters.radiusKm}km Ring</span>
          </button>

          <button
            type="button"
            onClick={() => setClusteringEnabled(!clusteringEnabled)}
            title="Toggle pharmacy marker clustering"
            className={`px-2.5 py-1.5 rounded-xl text-[11px] sm:text-xs font-bold shadow-md border backdrop-blur-md flex items-center gap-1 transition-all cursor-pointer ${
              clusteringEnabled
                ? 'bg-emerald-600 border-emerald-700 text-white'
                : 'bg-white/95 border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Cluster {clusteringEnabled ? 'On' : 'Off'}</span>
          </button>
        </div>
      </div>

      {/* Floating Map Controls Top-Right */}
      <div className="absolute top-3 right-3 z-20 flex flex-col gap-2 pointer-events-auto">
        <button
          id="map-recenter-btn"
          type="button"
          onClick={handleRecenter}
          title="Recenter to search location"
          className="p-2.5 bg-white/95 backdrop-blur-md hover:bg-white text-slate-700 hover:text-emerald-600 rounded-xl shadow-md border border-slate-200 transition-colors cursor-pointer"
        >
          <Navigation className="w-4 h-4" />
        </button>

        <button
          id="map-fit-all-btn"
          type="button"
          onClick={handleFitAll}
          title="Fit all pharmacies in view"
          className="p-2.5 bg-white/95 backdrop-blur-md hover:bg-white text-slate-700 hover:text-emerald-600 rounded-xl shadow-md border border-slate-200 transition-colors cursor-pointer"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
      </div>

      {/* Floating Pin Legend Bottom-Left (hidden below 2xl when mini ribbon is open so overlays never overlap) */}
      <div
        className={`absolute bottom-3 left-3 z-20 bg-white/90 backdrop-blur-md px-3 py-2 rounded-xl shadow-md border border-slate-200 text-[11px] font-medium text-slate-700 hidden ${
          selectedPharmacy ? '2xl:flex' : 'sm:flex'
        } items-center gap-3 pointer-events-auto`}
      >
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-emerald-200" />
          <span>In Stock</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 ring-2 ring-amber-200" />
          <span>Low Stock</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-sky-500 ring-2 ring-sky-200" />
          <span>Selected</span>
        </div>
      </div>

      {/* Selected Pharmacy Mini Ribbon Overlay (stays left of Google Maps bottom-right zoom buttons) */}
      {selectedPharmacy && (
        <div className="absolute bottom-3 left-3 right-14 sm:left-auto sm:right-16 sm:w-72 z-20 bg-white rounded-2xl p-3 shadow-xl border border-slate-200 animate-in fade-in slide-in-from-bottom-2 duration-200 pointer-events-auto">
          <div className="flex items-start justify-between gap-2 mb-1">
            <div className="min-w-0">
              <h5 className="text-xs font-bold text-slate-900 leading-tight truncate">
                {selectedPharmacy.name}
              </h5>
              <p className="text-[11px] text-slate-500 truncate">{selectedPharmacy.area}</p>
            </div>
            <button
              type="button"
              onClick={() => onOpenDirections(selectedPharmacy)}
              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 shrink-0 shadow-xs cursor-pointer"
            >
              <Navigation className="w-3 h-3" />
              <span>Route</span>
            </button>
          </div>
          <p className="text-[10px] text-slate-500 truncate">
            {calculateDistance(originLat, originLng, selectedPharmacy.lat, selectedPharmacy.lng)}{' '}
            km away • {selectedPharmacy.openHours}
          </p>
        </div>
      )}
    </div>
  );
};

export const InteractiveMap: React.FC<InteractiveMapProps> = (props) => {
  if (!hasGoogleMapsKey) {
    return (
      <div className="relative w-full h-full min-h-[420px] rounded-2xl overflow-hidden shadow-md border border-slate-200 bg-slate-100 flex flex-col items-center justify-center p-6 text-center space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <div className="space-y-1 max-w-sm">
          <h4 className="text-sm font-bold text-slate-900">Google Maps View Unavailable</h4>
          <p className="text-xs text-slate-600">
            The Google Maps Platform API key is not configured in this environment. You can still browse all {props.pharmacies.length} pharmacies in the list view.
          </p>
        </div>
        {props.selectedPharmacy && (
          <button
            type="button"
            onClick={() => props.onOpenDirections(props.selectedPharmacy!)}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5"
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>Open Directions for {props.selectedPharmacy.name}</span>
          </button>
        )}
      </div>
    );
  }

  return <InteractiveMapWithApi {...props} />;
};
