import React, { useEffect, useState } from 'react';
import {
  Map as GoogleMap,
  AdvancedMarker,
  Pin,
  useMap,
  useMapsLibrary,
} from '@vis.gl/react-google-maps';
import {
  X,
  Navigation,
  ExternalLink,
  Car,
  Footprints,
  Bike,
  Loader2,
  MapPin,
} from 'lucide-react';
import { Pharmacy, SearchFilters } from '../types';
import { calculateDistance } from '../data/mockData';
import { hasGoogleMapsKey, checkGmpQuotaError } from '../utils/gmpQuota';

type SelectedTravelMode = 'DRIVING' | 'TWO_WHEELER' | 'WALKING';

interface RouteStepInfo {
  instructions: string;
  distanceText: string;
}

interface LiveRouteMetrics {
  distanceKm: string;
  durationMins: number;
  steps: RouteStepInfo[];
}

interface DirectionsModalProps {
  pharmacy: Pharmacy | null;
  filters: SearchFilters;
  onClose: () => void;
}

interface RouteComputeChildProps {
  origin: google.maps.LatLngLiteral;
  destination: google.maps.LatLngLiteral;
  travelMode: SelectedTravelMode;
  onRouteComputed: (metrics: LiveRouteMetrics) => void;
  onComputingChange: (loading: boolean) => void;
}

const DirectionsRouteComputeOverlay: React.FC<RouteComputeChildProps> = ({
  origin,
  destination,
  travelMode,
  onRouteComputed,
  onComputingChange,
}) => {
  const map = useMap();
  const routesLib = useMapsLibrary('routes');

  useEffect(() => {
    if (!map || !routesLib) return;

    let cancelled = false;
    let activePolylines: google.maps.Polyline[] = [];

    async function compute() {
      if (!routesLib || !map) return;
      onComputingChange(true);
      try {
        const { routes } = await routesLib.Route.computeRoutes({
          origin,
          destination,
          travelMode,
          fields: ['path', 'distanceMeters', 'durationMillis', 'viewport', 'legs'],
        });

        if (cancelled) return;

        if (routes && routes.length > 0) {
          const primaryRoute = routes[0];
          const polylines = primaryRoute.createPolylines({
            polylineOptions: {
              strokeColor: '#0284c7',
              strokeOpacity: 0.9,
              strokeWeight: 4,
            },
          });
          polylines.forEach((p) => p.setMap(map));
          activePolylines = polylines;

          if (primaryRoute.viewport) {
            map.fitBounds(primaryRoute.viewport, 36);
          } else {
            const bounds = new google.maps.LatLngBounds();
            bounds.extend(origin);
            bounds.extend(destination);
            map.fitBounds(bounds, 36);
          }

          const meters = primaryRoute.distanceMeters || 0;
          const millis = primaryRoute.durationMillis || 0;
          const legSteps = primaryRoute.legs?.[0]?.steps || [];

          const parsedSteps: RouteStepInfo[] = legSteps
            .filter((s) => Boolean(s.instructions))
            .map((s) => ({
              instructions: (s.instructions || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim(),
              distanceText:
                s.localizedValues?.distance ||
                (s.distanceMeters >= 1000
                  ? `${(s.distanceMeters / 1000).toFixed(1)} km`
                  : `${s.distanceMeters} m`),
            }));

          onRouteComputed({
            distanceKm: meters > 0 ? (meters / 1000).toFixed(1) : '0.5',
            durationMins: millis > 0 ? Math.max(1, Math.round(millis / 60000)) : 2,
            steps: parsedSteps,
          });
        }
      } catch (err) {
        checkGmpQuotaError(err);
        if (!cancelled && map && typeof google !== 'undefined') {
          const fallbackLine = new google.maps.Polyline({
            path: [origin, destination],
            geodesic: true,
            strokeColor: '#0284c7',
            strokeOpacity: 0.75,
            strokeWeight: 3,
            map,
          });
          activePolylines = [fallbackLine];
          const bounds = new google.maps.LatLngBounds();
          bounds.extend(origin);
          bounds.extend(destination);
          map.fitBounds(bounds, 36);
        }
      } finally {
        if (!cancelled) {
          onComputingChange(false);
        }
      }
    }

    void compute();

    return () => {
      cancelled = true;
      activePolylines.forEach((p) => p.setMap(null));
    };
  }, [map, routesLib, origin.lat, origin.lng, destination.lat, destination.lng, travelMode]);

  return null;
};

export const DirectionsModal: React.FC<DirectionsModalProps> = ({
  pharmacy,
  filters,
  onClose,
}) => {
  const originLat = filters?.location?.lat ?? 19.2952;
  const originLng = filters?.location?.lng ?? 72.8544;
  const originName = filters?.location?.name ?? 'Mira Bhayandar';

  const [travelMode, setTravelMode] = useState<SelectedTravelMode>('DRIVING');
  const [liveRoute, setLiveRoute] = useState<LiveRouteMetrics | null>(null);
  const [isComputingRoute, setIsComputingRoute] = useState(false);

  // Reset liveRoute when pharmacy changes
  useEffect(() => {
    setLiveRoute(null);
  }, [pharmacy?.id]);

  if (!pharmacy) return null;

  const fallbackDistance = calculateDistance(
    originLat,
    originLng,
    pharmacy.lat,
    pharmacy.lng
  );

  const walkingMinutes = Math.max(2, Math.round(fallbackDistance * 14));
  const drivingMinutes = Math.max(1, Math.round(fallbackDistance * 3.5));
  const cyclingMinutes = Math.max(2, Math.round(fallbackDistance * 5.5));

  const displayedDistance = liveRoute ? liveRoute.distanceKm : String(fallbackDistance);

  const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${originLat},${originLng}&destination=${pharmacy.lat},${pharmacy.lng}&travelmode=${
    travelMode === 'WALKING' ? 'walking' : travelMode === 'TWO_WHEELER' ? 'two-wheeler' : 'driving'
  }`;

  const fallbackSteps: RouteStepInfo[] = [
    {
      instructions: `Head toward ${originName} main corridor`,
      distanceText: `${Math.round(fallbackDistance * 250)} m`,
    },
    {
      instructions: `Continue toward ${pharmacy.area} connecting road`,
      distanceText: `${Math.round(fallbackDistance * 500)} m`,
    },
    {
      instructions: `Arrive at ${pharmacy.name} (${pharmacy.openHours})`,
      distanceText: 'Destination',
    },
  ];

  const stepsToRender =
    liveRoute && liveRoute.steps.length > 0 ? liveRoute.steps : fallbackSteps;

  return (
    <div className="fixed inset-0 z-[10000] overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
      <div
        id="directions-modal-container"
        className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-150 relative max-h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-100 bg-gradient-to-r from-emerald-50 via-teal-50/40 to-white flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold text-xl shadow-md">
              <Navigation className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-slate-900">
                Directions & Live Route
              </h3>
              <p className="text-xs text-slate-500">To {pharmacy.name}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1 text-xs">
          {/* Interactive Google Maps Route Preview */}
          <div className="w-full h-48 rounded-2xl overflow-hidden border border-slate-200 shadow-inner relative bg-slate-100 isolate map-isolated-container">
            {hasGoogleMapsKey ? (
              <GoogleMap
                id="directions-route-map"
                mapId="DEMO_MAP_ID"
                defaultCenter={{
                  lat: (originLat + pharmacy.lat) / 2,
                  lng: (originLng + pharmacy.lng) / 2,
                }}
                defaultZoom={14}
                gestureHandling="greedy"
                disableDefaultUI={true}
                zoomControl={true}
                internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
                style={{ width: '100%', height: '100%' }}
              >
                <AdvancedMarker
                  position={{ lat: originLat, lng: originLng }}
                  title={`Start: ${originName}`}
                  zIndex={999}
                >
                  <div className="w-4 h-4 rounded-full bg-blue-600 ring-4 ring-white shadow-md" />
                </AdvancedMarker>

                <AdvancedMarker
                  position={{ lat: pharmacy.lat, lng: pharmacy.lng }}
                  title={pharmacy.name}
                  zIndex={1000}
                >
                  <Pin
                    background="#059669"
                    borderColor="#047857"
                    glyphColor="#ffffff"
                    glyphText="+"
                  />
                </AdvancedMarker>

                <DirectionsRouteComputeOverlay
                  origin={{ lat: originLat, lng: originLng }}
                  destination={{ lat: pharmacy.lat, lng: pharmacy.lng }}
                  travelMode={travelMode}
                  onRouteComputed={setLiveRoute}
                  onComputingChange={setIsComputingRoute}
                />
              </GoogleMap>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center text-slate-500 space-y-1.5">
                <MapPin className="w-6 h-6 text-emerald-600" />
                <p className="font-semibold text-slate-700">
                  Route preview unavailable without Google Maps API key.
                </p>
              </div>
            )}

            <div className="absolute top-2 left-2 z-10 bg-white/90 backdrop-blur-xs px-2.5 py-1 rounded-lg text-[10px] font-bold text-slate-700 shadow-xs border border-slate-200 flex items-center gap-1.5">
              {isComputingRoute ? (
                <Loader2 className="w-3 h-3 animate-spin text-emerald-600" />
              ) : (
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
              )}
              <span>Live Route ({displayedDistance} km)</span>
            </div>
          </div>

          {/* Selectable Travel Mode Cards */}
          <div className="grid grid-cols-3 gap-2.5">
            <button
              type="button"
              onClick={() => setTravelMode('DRIVING')}
              className={`p-3 rounded-2xl border text-center space-y-1 transition-all cursor-pointer ${
                travelMode === 'DRIVING'
                  ? 'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-500/20'
                  : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <Car className="w-5 h-5 text-emerald-600 mx-auto" />
              <div className="text-sm font-extrabold text-slate-900">
                {travelMode === 'DRIVING' && liveRoute
                  ? `${liveRoute.durationMins} mins`
                  : `${drivingMinutes} mins`}
              </div>
              <div className="text-[10px] text-slate-500">
                Driving ({displayedDistance} km)
              </div>
            </button>

            <button
              type="button"
              onClick={() => setTravelMode('TWO_WHEELER')}
              className={`p-3 rounded-2xl border text-center space-y-1 transition-all cursor-pointer ${
                travelMode === 'TWO_WHEELER'
                  ? 'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-500/20'
                  : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <Bike className="w-5 h-5 text-teal-600 mx-auto" />
              <div className="text-sm font-extrabold text-slate-900">
                {travelMode === 'TWO_WHEELER' && liveRoute
                  ? `${liveRoute.durationMins} mins`
                  : `${cyclingMinutes} mins`}
              </div>
              <div className="text-[10px] text-slate-500">Two-wheeler</div>
            </button>

            <button
              type="button"
              onClick={() => setTravelMode('WALKING')}
              className={`p-3 rounded-2xl border text-center space-y-1 transition-all cursor-pointer ${
                travelMode === 'WALKING'
                  ? 'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-500/20'
                  : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <Footprints className="w-5 h-5 text-sky-600 mx-auto" />
              <div className="text-sm font-extrabold text-slate-900">
                {travelMode === 'WALKING' && liveRoute
                  ? `${liveRoute.durationMins} mins`
                  : `${walkingMinutes} mins`}
              </div>
              <div className="text-[10px] text-slate-500">Walking</div>
            </button>
          </div>

          {/* Route Start and End */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-3 h-3 rounded-full bg-blue-600 ring-4 ring-blue-100 mt-1 shrink-0" />
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  Start Location
                </span>
                <p className="font-bold text-slate-800">{originName}</p>
              </div>
            </div>

            <div className="border-l-2 border-dashed border-slate-300 ml-1.5 h-6" />

            <div className="flex items-start gap-3">
              <div className="w-3 h-3 rounded-full bg-emerald-600 ring-4 ring-emerald-100 mt-1 shrink-0" />
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  Destination
                </span>
                <p className="font-bold text-slate-800">{pharmacy.name}</p>
                <p className="text-[11px] text-slate-500">{pharmacy.address}</p>
              </div>
            </div>
          </div>

          {/* Turn-by-turn Navigation */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-slate-700">Turn-by-turn Navigation</h4>
              {liveRoute && liveRoute.steps.length > 0 && (
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  Routes API Live Steps
                </span>
              )}
            </div>
            <div className="space-y-2 text-[11px] text-slate-600 max-h-48 overflow-y-auto pr-1">
              {stepsToRender.map((step, idx) => (
                <div
                  key={idx}
                  className="p-2.5 bg-white border border-slate-200 rounded-xl flex items-start justify-between gap-2.5"
                >
                  <div className="flex items-start gap-2">
                    <span className="font-bold text-slate-400 shrink-0">{idx + 1}.</span>
                    <span>{step.instructions}</span>
                  </div>
                  <span className="text-[10px] font-semibold text-slate-400 shrink-0">
                    {step.distanceText}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* External Maps Launcher */}
          <div className="pt-2">
            <a
              href={googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold text-xs rounded-xl shadow-md flex items-center justify-center gap-2 transition-all"
            >
              <span>Open Navigation in Google Maps App</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
