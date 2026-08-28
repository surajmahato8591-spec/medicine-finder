import React, { useEffect, useRef, useState, useCallback } from 'react';
import { setOptions, importLibrary } from '@googlemaps/js-api-loader';
import L from 'leaflet';
import 'leaflet.markercluster';
import { 
  Navigation, 
  Compass, 
  Phone, 
  MapPin, 
  ExternalLink, 
  Clock, 
  CheckCircle2, 
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Maximize2,
  Map as MapIcon,
  Globe,
  Layers,
  Info
} from 'lucide-react';
import { Pharmacy, Medicine, SearchFilters } from '../types';
import { calculateDistance } from '../data/mockData';

const GOOGLE_MAPS_API_KEY = (import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '').trim();
const hasGoogleMapsKey = Boolean(
  GOOGLE_MAPS_API_KEY && 
  GOOGLE_MAPS_API_KEY.startsWith('AIza') && 
  GOOGLE_MAPS_API_KEY !== 'VITE_GOOGLE_MAPS_API_KEY' && 
  GOOGLE_MAPS_API_KEY.length >= 25
);

interface InteractiveMapProps {
  pharmacies: Pharmacy[];
  selectedPharmacy: Pharmacy | null;
  onSelectPharmacy: (pharmacy: Pharmacy) => void;
  searchedMedicine?: Medicine | null;
  filters: SearchFilters;
  onOpenDirections: (pharmacy: Pharmacy) => void;
  onOpenCall: (phone: string) => void;
}

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
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

  const mapContainerRef = useRef<HTMLDivElement>(null);
  
  // Google Maps references
  const googleMapInstanceRef = useRef<google.maps.Map | null>(null);
  const googleMarkersRef = useRef<google.maps.Marker[]>([]);
  const userGoogleMarkerRef = useRef<google.maps.Marker | null>(null);
  const googleCircleRef = useRef<google.maps.Circle | null>(null);
  const googlePolylineRef = useRef<google.maps.Polyline | null>(null);
  const googleInfoWindowRef = useRef<google.maps.InfoWindow | null>(null);

  // Leaflet references
  const leafletMapRef = useRef<L.Map | null>(null);
  const leafletClusterRef = useRef<L.MarkerClusterGroup | null>(null);
  const leafletUserMarkerRef = useRef<L.Marker | null>(null);
  const leafletCircleRef = useRef<L.Circle | null>(null);
  const leafletPolylineRef = useRef<L.Polyline | null>(null);
  const pharmacyMarkerMapRef = useRef<Map<string, L.Marker>>(new Map());

  const [mapEngine, setMapEngine] = useState<'google' | 'leaflet'>(hasGoogleMapsKey ? 'google' : 'leaflet');
  const [mapType, setMapType] = useState<'roadmap' | 'satellite' | 'terrain'>('roadmap');
  const [showRadiusRing, setShowRadiusRing] = useState(true);
  const [clusteringEnabled, setClusteringEnabled] = useState(true);
  const [authErrorNotice, setAuthErrorNotice] = useState<string | null>(null);

  // Initialize Leaflet Map
  const initLeafletMap = useCallback(() => {
    if (!mapContainerRef.current) return;
    
    // Clean up existing Leaflet instance if present
    if (leafletMapRef.current) {
      leafletMapRef.current.remove();
      leafletMapRef.current = null;
    }
    
    mapContainerRef.current.innerHTML = '';

    const map = L.map(mapContainerRef.current, {
      center: [originLat, originLng],
      zoom: 14,
      zoomControl: true,
    });

    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; Google / OpenStreetMap / CartoDB',
      maxZoom: 19,
    }).addTo(map);

    // Create Leaflet MarkerClusterGroup
    const clusterGroup = L.markerClusterGroup({
      showCoverageOnHover: false,
      zoomToBoundsOnClick: true,
      spiderfyOnMaxZoom: true,
      maxClusterRadius: clusteringEnabled ? 45 : 0,
      spiderLegPolylineOptions: { weight: 1.5, color: '#059669', opacity: 0.6 },
      iconCreateFunction: (cluster) => {
        const count = cluster.getChildCount();
        return L.divIcon({
          html: `
            <div class="custom-cluster-pill">
              <span class="cluster-icon">🏥</span>
              <span class="cluster-count">${count}</span>
              <span class="cluster-tag">Pharmacies</span>
            </div>
          `,
          className: 'custom-cluster-badge',
          iconSize: [count > 9 ? 94 : 86, 32],
          iconAnchor: [count > 9 ? 47 : 43, 16],
        });
      },
    });

    map.addLayer(clusterGroup);
    leafletClusterRef.current = clusterGroup;
    leafletMapRef.current = map;
    setMapEngine('leaflet');
  }, [originLat, originLng, clusteringEnabled]);

  // Handle Google Maps Authentication Failure (ApiTargetBlockedMapError, InvalidKeyMapError etc.)
  useEffect(() => {
    (window as any).gm_authFailure = () => {
      console.warn('Google Maps API key blocked, invalid, or unauthorized. Seamlessly falling back to high-res Leaflet map.');
      setAuthErrorNotice("Google Maps key is invalid or restricted. Showing interactive OpenStreetMap view.");
      initLeafletMap();
    };

    return () => {
      (window as any).gm_authFailure = undefined;
    };
  }, [initLeafletMap]);

  // 1. Initialize Map Engine
  useEffect(() => {
    let isMounted = true;

    async function initMap() {
      if (!mapContainerRef.current) return;

      if (mapEngine === 'google' && hasGoogleMapsKey) {
        try {
          setOptions({
            key: GOOGLE_MAPS_API_KEY,
            v: 'weekly',
            libraries: ['places', 'geometry'],
            solutionChannel: 'gmp_mcp_codeassist_v1_aistudio',
          });

          const { Map, InfoWindow } = await importLibrary('maps');
          if (!isMounted || !mapContainerRef.current) return;

          mapContainerRef.current.innerHTML = '';

          const mapOptions: google.maps.MapOptions = {
            center: { lat: originLat, lng: originLng },
            zoom: 14,
            mapTypeId: mapType,
            disableDefaultUI: false,
            zoomControl: true,
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: false,
            styles: [
              {
                featureType: 'poi.medical',
                elementType: 'geometry',
                stylers: [{ color: '#f8fafc' }],
              },
              {
                featureType: 'poi.medical',
                elementType: 'labels.icon',
                stylers: [{ visibility: 'on' }],
              },
              {
                featureType: 'water',
                elementType: 'geometry',
                stylers: [{ color: '#e0f2fe' }],
              },
            ],
          };

          const map = new Map(mapContainerRef.current, mapOptions);
          googleMapInstanceRef.current = map;
          googleInfoWindowRef.current = new InfoWindow();
        } catch (err: any) {
          console.warn('Google Maps load failure, using fallback map:', err);
          if (isMounted) {
            initLeafletMap();
          }
        }
      } else {
        initLeafletMap();
      }
    }

    initMap();

    return () => {
      isMounted = false;
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
    };
  }, [mapEngine, mapType, initLeafletMap, originLat, originLng]);

  // 2. Update Google Maps elements
  useEffect(() => {
    if (mapEngine === 'google' && googleMapInstanceRef.current && window.google) {
      const map = googleMapInstanceRef.current;
      const google = window.google;

      // Clear previous markers
      googleMarkersRef.current.forEach((m) => m.setMap(null));
      googleMarkersRef.current = [];

      if (userGoogleMarkerRef.current) {
        userGoogleMarkerRef.current.setMap(null);
      }

      // User location marker
      const userMarker = new google.maps.Marker({
        position: { lat: originLat, lng: originLng },
        map,
        title: `Search Origin: ${originName}`,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 9,
          fillColor: '#2563eb',
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 3,
        },
      });
      userGoogleMarkerRef.current = userMarker;

      // Radius Circle
      if (googleCircleRef.current) {
        googleCircleRef.current.setMap(null);
      }
      if (showRadiusRing) {
        const circle = new google.maps.Circle({
          map,
          center: { lat: originLat, lng: originLng },
          radius: originRadius * 1000,
          strokeColor: '#059669',
          strokeOpacity: 0.8,
          strokeWeight: 1.5,
          fillColor: '#10b981',
          fillOpacity: 0.08,
        });
        googleCircleRef.current = circle;
      }

      const bounds = new google.maps.LatLngBounds();
      bounds.extend({ lat: originLat, lng: originLng });

      // Add Pharmacy Markers
      pharmacies.forEach((pharmacy) => {
        const inv = searchedMedicine
          ? pharmacy.inventory.find((i) => i.medicineId === searchedMedicine.id)
          : pharmacy.inventory[0];

        const isStocked = inv?.inStockStatus === 'In Stock';
        const isLowStock = inv?.inStockStatus === 'Low Stock';
        const isSelected = selectedPharmacy?.id === pharmacy.id;

        const pinColor = isSelected
          ? '#0284c7'
          : isStocked
          ? '#10b981'
          : isLowStock
          ? '#f59e0b'
          : '#94a3b8';

        const marker = new google.maps.Marker({
          position: { lat: pharmacy.lat, lng: pharmacy.lng },
          map,
          title: pharmacy.name,
          icon: {
            path: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z',
            fillColor: pinColor,
            fillOpacity: 1,
            strokeWeight: 1.5,
            strokeColor: '#ffffff',
            scale: 1.8,
            anchor: new google.maps.Point(12, 22),
          },
          zIndex: isSelected ? 999 : 10,
        });

        bounds.extend({ lat: pharmacy.lat, lng: pharmacy.lng });

        // InfoWindow on Marker Click
        const dist = calculateDistance(originLat, originLng, pharmacy.lat, pharmacy.lng);
        const contentString = document.createElement('div');
        contentString.className = 'p-2.5 font-sans max-w-xs';
        contentString.innerHTML = `
          <div style="font-family: system-ui, sans-serif;">
            <div style="display: flex; justify-content: space-between; align-items: start; gap: 8px; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px;">
              <div>
                <strong style="font-size: 13px; color: #0f172a; display: block;">${pharmacy.name}</strong>
                <span style="font-size: 11px; color: #64748b;">${pharmacy.area} • ${dist} km away</span>
              </div>
              <span style="font-size: 10px; font-weight: bold; padding: 2px 6px; border-radius: 6px; background-color: ${
                isStocked ? '#dcfce7' : isLowStock ? '#fef3c7' : '#f1f5f9'
              }; color: ${isStocked ? '#166534' : isLowStock ? '#92400e' : '#475569'};">
                ${inv ? inv.inStockStatus : 'Open'}
              </span>
            </div>
            
            <div style="margin: 8px 0; font-size: 12px; color: #334155;">
              <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                <span style="color: #64748b;">${searchedMedicine ? searchedMedicine.name : 'Medicine'}:</span>
                <strong style="color: #0f172a;">${inv ? '₹' + inv.price.toFixed(2) : 'Available'}</strong>
              </div>
              <div style="font-size: 11px; color: #64748b;">🕒 ${pharmacy.openHours}</div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px; margin-top: 8px;">
              <button id="gmap-call-btn-${pharmacy.id}" style="padding: 6px 8px; background: #f1f5f9; color: #1e293b; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 11px; font-weight: bold; cursor: pointer;">
                📞 Call
              </button>
              <button id="gmap-route-btn-${pharmacy.id}" style="padding: 6px 8px; background: #059669; color: #ffffff; border: none; border-radius: 8px; font-size: 11px; font-weight: bold; cursor: pointer;">
                🧭 Directions
              </button>
            </div>
          </div>
        `;

        marker.addListener('click', () => {
          onSelectPharmacy(pharmacy);
          if (googleInfoWindowRef.current) {
            googleInfoWindowRef.current.setContent(contentString);
            googleInfoWindowRef.current.open(map, marker);

            setTimeout(() => {
              const callBtn = document.getElementById(`gmap-call-btn-${pharmacy.id}`);
              const routeBtn = document.getElementById(`gmap-route-btn-${pharmacy.id}`);
              if (callBtn) callBtn.onclick = () => onOpenCall(pharmacy.phone);
              if (routeBtn) routeBtn.onclick = () => onOpenDirections(pharmacy);
            }, 100);
          }
        });

        if (isSelected && googleInfoWindowRef.current) {
          googleInfoWindowRef.current.setContent(contentString);
          googleInfoWindowRef.current.open(map, marker);
          setTimeout(() => {
            const callBtn = document.getElementById(`gmap-call-btn-${pharmacy.id}`);
            const routeBtn = document.getElementById(`gmap-route-btn-${pharmacy.id}`);
            if (callBtn) callBtn.onclick = () => onOpenCall(pharmacy.phone);
            if (routeBtn) routeBtn.onclick = () => onOpenDirections(pharmacy);
          }, 100);
        }

        googleMarkersRef.current.push(marker);
      });

      // Route Polyline
      if (googlePolylineRef.current) {
        googlePolylineRef.current.setMap(null);
        googlePolylineRef.current = null;
      }

      if (selectedPharmacy) {
        const polyline = new google.maps.Polyline({
          path: [
            { lat: originLat, lng: originLng },
            { lat: selectedPharmacy.lat, lng: selectedPharmacy.lng },
          ],
          geodesic: true,
          strokeColor: '#0284c7',
          strokeOpacity: 0.8,
          strokeWeight: 4,
          map,
        });
        googlePolylineRef.current = polyline;
        map.panTo({ lat: selectedPharmacy.lat, lng: selectedPharmacy.lng });
      } else if (pharmacies.length > 0) {
        map.fitBounds(bounds, 50);
      }
    }
  }, [pharmacies, selectedPharmacy, searchedMedicine, originLat, originLng, originName, originRadius, showRadiusRing, mapEngine, onOpenCall, onOpenDirections, onSelectPharmacy]);

  // 3. Update Leaflet Map elements
  useEffect(() => {
    if (mapEngine === 'leaflet' && leafletMapRef.current && leafletClusterRef.current) {
      const map = leafletMapRef.current;
      const clusterGroup = leafletClusterRef.current;
      
      clusterGroup.clearLayers();
      pharmacyMarkerMapRef.current.clear();

      // Remove existing user marker if present
      if (leafletUserMarkerRef.current) {
        map.removeLayer(leafletUserMarkerRef.current);
        leafletUserMarkerRef.current = null;
      }

      // Add Search Origin User Marker (unclustered so it's always distinct)
      const userIcon = L.divIcon({
        className: 'leaflet-user-icon',
        html: `<div style="background-color: #2563eb; width: 22px; height: 22px; border-radius: 50%; border: 3px solid #ffffff; box-shadow: 0 4px 10px rgba(37,99,235,0.4); display:flex; align-items:center; justify-content:center;"><div style="width:6px; height:6px; background:#fff; border-radius:50%;"></div></div>`,
        iconSize: [22, 22],
        iconAnchor: [11, 11],
      });
      leafletUserMarkerRef.current = L.marker([originLat, originLng], { icon: userIcon })
        .bindTooltip(`Search Origin: ${originName}`, { permanent: false, direction: 'top' })
        .addTo(map);

      // Circle
      if (leafletCircleRef.current) map.removeLayer(leafletCircleRef.current);
      if (showRadiusRing) {
        leafletCircleRef.current = L.circle([originLat, originLng], {
          radius: originRadius * 1000,
          color: '#059669',
          fillColor: '#10b981',
          fillOpacity: 0.08,
          weight: 1.5,
        }).addTo(map);
      }

      const bounds = L.latLngBounds([[originLat, originLng]]);
      
      pharmacies.forEach((p) => {
        bounds.extend([p.lat, p.lng]);
        const isSelected = selectedPharmacy?.id === p.id;
        const inv = searchedMedicine
          ? p.inventory.find((i) => i.medicineId === searchedMedicine.id)
          : p.inventory[0];
        const isStocked = inv?.inStockStatus === 'In Stock';
        const isLowStock = inv?.inStockStatus === 'Low Stock';

        const color = isSelected
          ? '#0284c7'
          : isStocked
          ? '#059669'
          : isLowStock
          ? '#d97706'
          : '#64748b';

        const icon = L.divIcon({
          className: 'leaflet-pharmacy-icon',
          html: `<div style="background-color: ${color}; width: 28px; height: 28px; border-radius: 8px; border: 2px solid #ffffff; display:flex; align-items:center; justify-content:center; color:white; font-weight:bold; font-size:13px; box-shadow: 0 4px 6px rgba(0,0,0,0.25); transform: ${isSelected ? 'scale(1.15)' : 'scale(1)'}; transition: transform 0.2s;">+</div>`,
          iconSize: [28, 28],
          iconAnchor: [14, 14],
        });

        const dist = calculateDistance(originLat, originLng, p.lat, p.lng);
        const marker = L.marker([p.lat, p.lng], { icon });

        const popupContent = `
          <div style="font-family: system-ui, sans-serif; min-width: 190px; padding: 4px;">
            <div style="font-weight: bold; font-size: 13px; color: #0f172a;">${p.name}</div>
            <div style="font-size: 11px; color: #64748b; margin-bottom: 6px;">${p.area} • ${dist} km away</div>
            <div style="font-size: 11px; margin-bottom: 6px;">
              <strong>${searchedMedicine ? searchedMedicine.name : 'Stock'}:</strong> 
              <span style="color: ${isStocked ? '#166534' : isLowStock ? '#92400e' : '#64748b'}; font-weight: 600;">
                ${inv ? inv.inStockStatus : 'Available'}
              </span>
            </div>
            <div style="font-size: 11px; color: #475569; margin-bottom: 8px;">🕒 ${p.openHours}</div>
            <div style="display: flex; gap: 6px;">
              <a href="tel:${p.phone}" style="flex: 1; text-align: center; background: #f1f5f9; padding: 5px 6px; border-radius: 6px; font-size: 11px; font-weight: bold; color: #1e293b; text-decoration: none;">📞 Call</a>
              <button id="leaflet-route-btn-${p.id}" style="flex: 1; text-align: center; background: #059669; color: #ffffff; padding: 5px 6px; border: none; border-radius: 6px; font-size: 11px; font-weight: bold; cursor: pointer;">🧭 Route</button>
            </div>
          </div>
        `;

        marker.bindPopup(popupContent);
        marker.on('click', () => {
          onSelectPharmacy(p);
          setTimeout(() => {
            const btn = document.getElementById(`leaflet-route-btn-${p.id}`);
            if (btn) btn.onclick = () => onOpenDirections(p);
          }, 50);
        });

        // Register marker in cluster and lookup map
        clusterGroup.addLayer(marker);
        pharmacyMarkerMapRef.current.set(p.id, marker);
      });

      if (selectedPharmacy) {
        if (leafletPolylineRef.current) map.removeLayer(leafletPolylineRef.current);
        leafletPolylineRef.current = L.polyline(
          [
            [originLat, originLng],
            [selectedPharmacy.lat, selectedPharmacy.lng],
          ],
          { color: '#0284c7', weight: 4, opacity: 0.85, dashArray: '6, 6' }
        ).addTo(map);

        const targetMarker = pharmacyMarkerMapRef.current.get(selectedPharmacy.id);
        if (targetMarker) {
          clusterGroup.zoomToShowLayer(targetMarker, () => {
            targetMarker.openPopup();
          });
        } else {
          map.panTo([selectedPharmacy.lat, selectedPharmacy.lng]);
        }
      } else {
        map.fitBounds(bounds, { padding: [40, 40] });
      }
    }
  }, [mapEngine, pharmacies, selectedPharmacy, searchedMedicine, originLat, originLng, originName, originRadius, showRadiusRing, onOpenDirections, onSelectPharmacy]);

  // Map Recenter
  const handleRecenter = () => {
    if (googleMapInstanceRef.current && mapEngine === 'google') {
      googleMapInstanceRef.current.panTo({ lat: originLat, lng: originLng });
      googleMapInstanceRef.current.setZoom(14);
    } else if (leafletMapRef.current) {
      leafletMapRef.current.setView([originLat, originLng], 14);
    }
  };

  // Map Fit All
  const handleFitAll = () => {
    if (googleMapInstanceRef.current && mapEngine === 'google' && window.google) {
      const bounds = new google.maps.LatLngBounds();
      bounds.extend({ lat: originLat, lng: originLng });
      pharmacies.forEach((p) => bounds.extend({ lat: p.lat, lng: p.lng }));
      googleMapInstanceRef.current.fitBounds(bounds, 50);
    } else if (leafletMapRef.current) {
      const bounds = L.latLngBounds([[originLat, originLng]]);
      pharmacies.forEach((p) => bounds.extend([p.lat, p.lng]));
      leafletMapRef.current.fitBounds(bounds, { padding: [40, 40] });
    }
  };

  return (
    <div className="relative isolate map-isolated-container w-full h-full min-h-[420px] rounded-2xl overflow-hidden shadow-md border border-slate-200 bg-slate-100 flex flex-col">
      {/* Map Surface Element */}
      <div 
        ref={mapContainerRef} 
        id="interactive-map-surface"
        className="w-full h-full min-h-[420px] flex-1 z-0" 
      />

      {/* Auth Notification Banner if API key needs Maps JS API authorization */}
      {authErrorNotice && (
        <div className="absolute top-14 left-3 right-3 sm:right-auto sm:max-w-md z-30 bg-amber-500/95 backdrop-blur-md text-white px-3 py-2 rounded-xl shadow-lg border border-amber-400 text-xs flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 font-medium">
            <Info className="w-4 h-4 shrink-0 text-amber-100" />
            <span>OpenStreetMap live view active (Google Maps key restricted).</span>
          </div>
          <button 
            onClick={() => setAuthErrorNotice(null)}
            className="text-amber-100 hover:text-white font-bold ml-1 text-sm"
          >
            ✕
          </button>
        </div>
      )}

      {/* Floating Map Controls Top-Left */}
      <div className="absolute top-3 left-3 z-20 flex flex-col gap-2 pointer-events-auto">
        {/* Layer style & provider toggle */}
        <div className="bg-white/95 backdrop-blur-md rounded-xl p-1 shadow-md border border-slate-200 flex items-center text-xs font-semibold text-slate-700">
          {mapEngine === 'google' ? (
            <>
              <button
                onClick={() => {
                  setMapType('roadmap');
                  if (googleMapInstanceRef.current) googleMapInstanceRef.current.setMapTypeId('roadmap');
                }}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  mapType === 'roadmap' ? 'bg-emerald-600 text-white shadow-xs' : 'hover:bg-slate-100 text-slate-600'
                }`}
              >
                Roadmap
              </button>
              <button
                onClick={() => {
                  setMapType('satellite');
                  if (googleMapInstanceRef.current) googleMapInstanceRef.current.setMapTypeId('satellite');
                }}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  mapType === 'satellite' ? 'bg-emerald-600 text-white shadow-xs' : 'hover:bg-slate-100 text-slate-600'
                }`}
              >
                Satellite
              </button>
            </>
          ) : (
            <div className="px-2.5 py-1 text-emerald-800 bg-emerald-50 rounded-lg flex items-center gap-1">
              <Globe className="w-3.5 h-3.5 text-emerald-600" />
              <span>Interactive Map</span>
            </div>
          )}

          {hasGoogleMapsKey && (
            <button
              onClick={() => {
                if (mapEngine === 'google') {
                  initLeafletMap();
                } else {
                  setMapEngine('google');
                }
              }}
              title="Switch Map Provider"
              className="ml-1 px-2 py-1 text-[11px] text-slate-500 hover:text-slate-900 border-l border-slate-200 pl-2"
            >
              {mapEngine === 'google' ? 'OSM' : 'Google'}
            </button>
          )}
        </div>

        {/* Radius Ring & Cluster Toggles Row */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setShowRadiusRing(!showRadiusRing)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold shadow-md border backdrop-blur-md flex items-center gap-1.5 transition-all ${
              showRadiusRing
                ? 'bg-emerald-50/95 border-emerald-300 text-emerald-800'
                : 'bg-white/95 border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>{filters.radiusKm}km Ring</span>
          </button>

          {mapEngine === 'leaflet' && (
            <button
              onClick={() => {
                setClusteringEnabled(!clusteringEnabled);
                initLeafletMap();
              }}
              title="Toggle pharmacy marker clustering"
              className={`px-2.5 py-1.5 rounded-xl text-xs font-bold shadow-md border backdrop-blur-md flex items-center gap-1 transition-all ${
                clusteringEnabled
                  ? 'bg-emerald-600 border-emerald-700 text-white'
                  : 'bg-white/95 border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Cluster {clusteringEnabled ? 'On' : 'Off'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Floating Map Controls Top-Right */}
      <div className="absolute top-3 right-3 z-20 flex flex-col gap-2 pointer-events-auto">
        <button
          id="map-recenter-btn"
          onClick={handleRecenter}
          title="Recenter to search location"
          className="p-2.5 bg-white/95 backdrop-blur-md hover:bg-white text-slate-700 hover:text-emerald-600 rounded-xl shadow-md border border-slate-200 transition-colors"
        >
          <Navigation className="w-4 h-4" />
        </button>

        <button
          id="map-fit-all-btn"
          onClick={handleFitAll}
          title="Fit all pharmacies in view"
          className="p-2.5 bg-white/95 backdrop-blur-md hover:bg-white text-slate-700 hover:text-emerald-600 rounded-xl shadow-md border border-slate-200 transition-colors"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
      </div>

      {/* Floating Pin Legend Bottom-Left */}
      <div className="absolute bottom-3 left-3 z-20 bg-white/90 backdrop-blur-md px-3 py-2 rounded-xl shadow-md border border-slate-200 text-[11px] font-medium text-slate-700 hidden sm:flex items-center gap-3 pointer-events-auto">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-emerald-200"></span>
          <span>In Stock</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 ring-2 ring-amber-200"></span>
          <span>Low Stock</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-sky-500 ring-2 ring-sky-200"></span>
          <span>Selected</span>
        </div>
      </div>

      {/* Selected Pharmacy Mini Ribbon Overlay */}
      {selectedPharmacy && (
        <div className="absolute bottom-3 right-3 sm:right-16 z-20 max-w-xs bg-white rounded-2xl p-3 shadow-xl border border-slate-200 animate-in fade-in slide-in-from-bottom-2 duration-200 pointer-events-auto">
          <div className="flex items-start justify-between gap-2 mb-1.5">
            <div>
              <h5 className="text-xs font-bold text-slate-900 leading-tight">{selectedPharmacy.name}</h5>
              <p className="text-[11px] text-slate-500">{selectedPharmacy.area}</p>
            </div>
            <button
              onClick={() => onOpenDirections(selectedPharmacy)}
              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 shrink-0 shadow-xs"
            >
              <Navigation className="w-3 h-3" />
              <span>Route</span>
            </button>
          </div>
          <p className="text-[10px] text-slate-500">
            {calculateDistance(originLat, originLng, selectedPharmacy.lat, selectedPharmacy.lng)} km from you • {selectedPharmacy.openHours}
          </p>
        </div>
      )}
    </div>
  );
};
