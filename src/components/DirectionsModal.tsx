import React, { useEffect, useRef, useState } from 'react';
import { setOptions, importLibrary } from '@googlemaps/js-api-loader';
import L from 'leaflet';
import { 
  X, 
  Navigation, 
  MapPin, 
  ExternalLink, 
  Clock, 
  Car, 
  Footprints, 
  Bike, 
  Share2,
  CheckCircle2,
  Phone
} from 'lucide-react';
import { Pharmacy, SearchFilters } from '../types';
import { calculateDistance } from '../data/mockData';

const GOOGLE_MAPS_API_KEY = (import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '').trim();
const hasGoogleMapsKey = Boolean(
  GOOGLE_MAPS_API_KEY && 
  GOOGLE_MAPS_API_KEY.startsWith('AIza') && 
  GOOGLE_MAPS_API_KEY !== 'VITE_GOOGLE_MAPS_API_KEY' && 
  GOOGLE_MAPS_API_KEY.length >= 25
);

interface DirectionsModalProps {
  pharmacy: Pharmacy | null;
  filters: SearchFilters;
  onClose: () => void;
}

export const DirectionsModal: React.FC<DirectionsModalProps> = ({
  pharmacy,
  filters,
  onClose,
}) => {
  const mapPreviewRef = useRef<HTMLDivElement>(null);
  const leafletPreviewMapRef = useRef<L.Map | null>(null);

  const originLat = filters?.location?.lat ?? 19.2952;
  const originLng = filters?.location?.lng ?? 72.8544;
  const originName = filters?.location?.name ?? 'Mira Bhayandar';

  const distance = pharmacy
    ? calculateDistance(
        originLat,
        originLng,
        pharmacy.lat,
        pharmacy.lng
      )
    : 0;

  const walkingMinutes = Math.max(2, Math.round(distance * 14));
  const drivingMinutes = Math.max(1, Math.round(distance * 3.5));
  const cyclingMinutes = Math.max(2, Math.round(distance * 5.5));

  const googleMapsUrl = pharmacy
    ? `https://www.google.com/maps/dir/?api=1&origin=${originLat},${originLng}&destination=${pharmacy.lat},${pharmacy.lng}`
    : '#';

  // Render Map Route Preview in Modal
  useEffect(() => {
    if (!pharmacy || !mapPreviewRef.current) return;

    let isMounted = true;

    function renderLeafletPreview() {
      if (!mapPreviewRef.current || !pharmacy) return;
      if (leafletPreviewMapRef.current) {
        leafletPreviewMapRef.current.remove();
        leafletPreviewMapRef.current = null;
      }
      mapPreviewRef.current.innerHTML = '';

      const map = L.map(mapPreviewRef.current, {
        center: [(originLat + pharmacy.lat) / 2, (originLng + pharmacy.lng) / 2],
        zoom: 14,
        zoomControl: false,
      });

      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap',
        maxZoom: 19,
      }).addTo(map);

      // Origin Marker
      const originIcon = L.divIcon({
        className: 'origin-marker-icon',
        html: `<div style="background-color: #2563eb; width: 16px; height: 16px; border-radius: 50%; border: 2px solid #ffffff; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
        iconSize: [16, 16],
        iconAnchor: [8, 8],
      });
      L.marker([originLat, originLng], { icon: originIcon }).addTo(map);

      // Destination Marker
      const destIcon = L.divIcon({
        className: 'dest-marker-icon',
        html: `<div style="background-color: #059669; width: 22px; height: 22px; border-radius: 6px; border: 2px solid #ffffff; color: white; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 11px; box-shadow: 0 2px 4px rgba(0,0,0,0.3);">+</div>`,
        iconSize: [22, 22],
        iconAnchor: [11, 11],
      });
      L.marker([pharmacy.lat, pharmacy.lng], { icon: destIcon }).addTo(map);

      // Polyline
      L.polyline([
        [originLat, originLng],
        [pharmacy.lat, pharmacy.lng]
      ], { color: '#0284c7', weight: 4, opacity: 0.85 }).addTo(map);

      const bounds = L.latLngBounds([
        [originLat, originLng],
        [pharmacy.lat, pharmacy.lng]
      ]);
      map.fitBounds(bounds, { padding: [30, 30] });
      leafletPreviewMapRef.current = map;
    }

    async function loadDirectionsMap() {
      if (!hasGoogleMapsKey) {
        renderLeafletPreview();
        return;
      }

      try {
        setOptions({
          key: GOOGLE_MAPS_API_KEY,
          v: 'weekly',
          libraries: ['places', 'geometry'],
          solutionChannel: 'gmp_mcp_codeassist_v1_aistudio',
        });

        const { Map } = await importLibrary('maps');
        if (!isMounted || !mapPreviewRef.current) return;

        const map = new Map(mapPreviewRef.current, {
          center: { lat: (originLat + pharmacy.lat) / 2, lng: (originLng + pharmacy.lng) / 2 },
          zoom: 14,
          disableDefaultUI: true,
          zoomControl: true,
        });

        // Origin Marker (Blue)
        new google.maps.Marker({
          position: { lat: originLat, lng: originLng },
          map,
          title: `You: ${originName}`,
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 8,
            fillColor: '#2563eb',
            fillOpacity: 1,
            strokeColor: '#ffffff',
            strokeWeight: 2,
          },
        });

        // Destination Marker (Emerald)
        new google.maps.Marker({
          position: { lat: pharmacy.lat, lng: pharmacy.lng },
          map,
          title: pharmacy.name,
          icon: {
            path: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z',
            fillColor: '#059669',
            fillOpacity: 1,
            strokeWeight: 1.5,
            strokeColor: '#ffffff',
            scale: 1.6,
            anchor: new google.maps.Point(12, 22),
          },
        });

        // Polyline connecting origin & destination
        new google.maps.Polyline({
          path: [
            { lat: originLat, lng: originLng },
            { lat: pharmacy.lat, lng: pharmacy.lng },
          ],
          strokeColor: '#0284c7',
          strokeOpacity: 0.85,
          strokeWeight: 4,
          map,
        });

        const bounds = new google.maps.LatLngBounds();
        bounds.extend({ lat: originLat, lng: originLng });
        bounds.extend({ lat: pharmacy.lat, lng: pharmacy.lng });
        map.fitBounds(bounds, 35);
      } catch (e) {
        console.warn('Modal Google Map preview failed to load, falling back to Leaflet:', e);
        if (isMounted) {
          renderLeafletPreview();
        }
      }
    }

    // Try Google Maps or render Leaflet fallback
    loadDirectionsMap();

    return () => {
      isMounted = false;
      if (leafletPreviewMapRef.current) {
        leafletPreviewMapRef.current.remove();
        leafletPreviewMapRef.current = null;
      }
    };
  }, [pharmacy, filters]);

  if (!pharmacy) return null;

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
              <h3 className="text-lg font-extrabold text-slate-900">Directions & Live Route</h3>
              <p className="text-xs text-slate-500">To {pharmacy.name}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1 text-xs">
          
          {/* Interactive Map Mini Route Preview */}
          <div className="w-full h-44 rounded-2xl overflow-hidden border border-slate-200 shadow-inner relative bg-slate-100 isolate map-isolated-container">
            <div ref={mapPreviewRef} className="w-full h-full" />
            <div className="absolute top-2 left-2 z-10 bg-white/90 backdrop-blur-xs px-2.5 py-1 rounded-lg text-[10px] font-bold text-slate-700 shadow-xs border border-slate-200 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>Live Route Preview ({distance} km)</span>
            </div>
          </div>

          {/* Estimated Travel Times */}
          <div className="grid grid-cols-3 gap-2.5">
            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 text-center space-y-1">
              <Car className="w-5 h-5 text-emerald-600 mx-auto" />
              <div className="text-sm font-extrabold text-slate-900">{drivingMinutes} mins</div>
              <div className="text-[10px] text-slate-400">Driving ({distance} km)</div>
            </div>

            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 text-center space-y-1">
              <Bike className="w-5 h-5 text-teal-600 mx-auto" />
              <div className="text-sm font-extrabold text-slate-900">{cyclingMinutes} mins</div>
              <div className="text-[10px] text-slate-400">Two-wheeler</div>
            </div>

            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 text-center space-y-1">
              <Footprints className="w-5 h-5 text-sky-600 mx-auto" />
              <div className="text-sm font-extrabold text-slate-900">{walkingMinutes} mins</div>
              <div className="text-[10px] text-slate-400">Walking</div>
            </div>
          </div>

          {/* Route Start and End */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-3 h-3 rounded-full bg-blue-600 ring-4 ring-blue-100 mt-1 shrink-0"></div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Start Location</span>
                <p className="font-bold text-slate-800">{originName}</p>
              </div>
            </div>

            <div className="border-l-2 border-dashed border-slate-300 ml-1.5 h-6"></div>

            <div className="flex items-start gap-3">
              <div className="w-3 h-3 rounded-full bg-emerald-600 ring-4 ring-emerald-100 mt-1 shrink-0"></div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Destination</span>
                <p className="font-bold text-slate-800">{pharmacy.name}</p>
                <p className="text-[11px] text-slate-500">{pharmacy.address}</p>
              </div>
            </div>
          </div>

          {/* Turn by turn mock guidance */}
          <div className="space-y-2">
            <h4 className="font-bold text-slate-700">Turn-by-turn Navigation</h4>
            <div className="space-y-2 text-[11px] text-slate-600">
              <div className="p-2.5 bg-white border border-slate-200 rounded-xl flex items-center gap-2.5">
                <span className="font-bold text-slate-400">1.</span>
                <span>Head toward {originName} main corridor ({Math.round(distance * 250)}m)</span>
              </div>
              <div className="p-2.5 bg-white border border-slate-200 rounded-xl flex items-center gap-2.5">
                <span className="font-bold text-slate-400">2.</span>
                <span>Turn toward {pharmacy.area} connecting road ({Math.round(distance * 500)}m)</span>
              </div>
              <div className="p-2.5 bg-white border border-slate-200 rounded-xl flex items-center gap-2.5">
                <span className="font-bold text-slate-400">3.</span>
                <span>Arrive at {pharmacy.name} ({pharmacy.openHours})</span>
              </div>
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
