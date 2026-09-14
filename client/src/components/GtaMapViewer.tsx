import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Compass, ExternalLink, Crosshair, Navigation, Check, Copy, Car } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

export interface GtaMapViewerProps {
  locationQuery: string;
  title: string;
  locationName?: string;
  address?: string;
  theme?: 'burgundy' | 'amber' | 'rose' | 'dark';
  isRtl?: boolean;
  className?: string;
  heightClass?: string;
  directionsUrl?: string;
  directionsButtonText?: string;
  directionsSubtext?: string;
}

interface VenueCoordinates {
  lat: number;
  lng: number;
  name: string;
  fullAddress: string;
  startLat: number;
  startLng: number;
  startName: string;
  distance: string;
  duration: string;
  routeCoordinates: [number, number][];
}

// Famous French luxury wedding venues presets with real verified road coordinates
const VENUE_PRESETS: Record<string, VenueCoordinates> = {
  ephrussi: {
    lat: 43.6967,
    lng: 7.3298,
    name: 'The Garden Terrace - Villa Ephrussi de Rothschild',
    fullAddress: '1 Avenue Ephrussi de Rothschild, 06230 Saint-Jean-Cap-Ferrat, France',
    startLat: 43.6950,
    startLng: 7.2650,
    startName: 'Nice (Promenade des Anglais)',
    distance: '8.5 km',
    duration: '17 min',
    routeCoordinates: [
      [43.6950, 7.2650], [43.6951, 7.2691], [43.6982, 7.2759], [43.7001, 7.2783],
      [43.6986, 7.2818], [43.6981, 7.2883], [43.6966, 7.2916], [43.6975, 7.2933],
      [43.7005, 7.2963], [43.7060, 7.3010], [43.7055, 7.3035], [43.7039, 7.3066],
      [43.7058, 7.3089], [43.7073, 7.3093], [43.7059, 7.3109], [43.7066, 7.3118],
      [43.7079, 7.3127], [43.7083, 7.3139], [43.7072, 7.3169], [43.7068, 7.3188],
      [43.7051, 7.3211], [43.7040, 7.3221], [43.7029, 7.3243], [43.7016, 7.3269],
      [43.6968, 7.3301], [43.6967, 7.3298]
    ]
  },
  chantilly: {
    lat: 49.1939,
    lng: 2.4853,
    name: 'The Grand Ballroom - Château de Chantilly',
    fullAddress: 'Château de Chantilly, 60500 Chantilly, France',
    startLat: 49.0097,
    startLng: 2.5479,
    startName: 'Paris (Aéroport CDG / Gare TGV)',
    distance: '25.0 km',
    duration: '27 min',
    routeCoordinates: [
      [49.0093, 2.5479], [49.0077, 2.5335], [49.0085, 2.5316], [49.0117, 2.5331],
      [49.0123, 2.5302], [49.0621, 2.5520], [49.0866, 2.5523], [49.0854, 2.5447],
      [49.0914, 2.5360], [49.0911, 2.5306], [49.1302, 2.5339], [49.1538, 2.5232],
      [49.1898, 2.4846], [49.1937, 2.4853]
    ]
  },
  mala: {
    lat: 43.7214,
    lng: 7.4042,
    name: 'The Sunset Cafe - Plage de la Mala',
    fullAddress: 'Plage de la Mala, 06320 Cap-d\'Ail, French Riviera',
    startLat: 43.7384,
    startLng: 7.4246,
    startName: 'Monaco (Place du Casino / Gare)',
    distance: '3.2 km',
    duration: '8 min',
    routeCoordinates: [
      [43.7383, 7.4245], [43.7384, 7.4243], [43.7381, 7.4240], [43.7378, 7.4234],
      [43.7378, 7.4220], [43.7374, 7.4227], [43.7374, 7.4241], [43.7371, 7.4229],
      [43.7370, 7.4216], [43.7368, 7.4212], [43.7359, 7.4201], [43.7343, 7.4185],
      [43.7332, 7.4176], [43.7320, 7.4167], [43.7311, 7.4149], [43.7303, 7.4141],
      [43.7262, 7.4109], [43.7257, 7.4098], [43.7245, 7.4088], [43.7234, 7.4089],
      [43.7226, 7.4083], [43.7225, 7.4062], [43.7218, 7.4046], [43.7217, 7.4043]
    ]
  }
};

function resolveVenueData(query: string, name?: string, addr?: string): VenueCoordinates {
  const combined = `${query || ''} ${name || ''} ${addr || ''}`.toLowerCase();
  if (combined.includes('mala') || combined.includes('sunset') || combined.includes('brunch') || combined.includes('cap-d\'ail')) {
    return VENUE_PRESETS.mala;
  }
  if (combined.includes('chantilly') || combined.includes('ballroom') || combined.includes('ceremony')) {
    return VENUE_PRESETS.chantilly;
  }
  return VENUE_PRESETS.ephrussi;
}

export default function GtaMapViewer({
  locationQuery,
  title,
  locationName,
  address,
  theme = 'amber',
  isRtl = false,
  className = '',
  heightClass = 'h-[260px] sm:h-[320px]',
  directionsUrl,
  directionsButtonText,
  directionsSubtext,
}: GtaMapViewerProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const routeLayerGroupRef = useRef<L.LayerGroup | null>(null);

  const [showRoute, setShowRoute] = useState(false);
  const [copiedAddress, setCopiedAddress] = useState(false);
  const [isScanning, setIsScanning] = useState(false);

  const isThemeAmber = theme === 'amber';
  const accentColor = isThemeAmber ? '#D97706' : '#9E4A5A';
  const accentLight = isThemeAmber ? 'rgba(217, 119, 6, 0.1)' : 'rgba(158, 74, 90, 0.1)';
  const buttonGradient = isThemeAmber
    ? 'from-amber-500 via-amber-600 to-amber-700 shadow-amber-500/25'
    : 'from-[#9E4A5A] via-[#B8576A] to-[#853648] shadow-[#9E4A5A]/25';

  const venue = resolveVenueData(locationQuery, locationName || title, address);
  const displayVenueName = locationName || title || venue.name;
  const displayVenueAddress = address || venue.fullAddress;

  const finalDirectionsUrl =
    directionsUrl ||
    `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
      displayVenueAddress || displayVenueName
    )}`;

  // Custom luxury SVG marker icon for the venue
  const createVenueIcon = useCallback(() => {
    const pinColor = isThemeAmber ? '#D97706' : '#9E4A5A';
    return L.divIcon({
      className: 'custom-venue-pin',
      html: `
        <div style="position: relative; display: flex; flex-direction: column; align-items: center; transform: translate(-50%, -100%);">
          <div style="position: relative; width: 44px; height: 44px; border-radius: 50%; background: ${pinColor}; box-shadow: 0 8px 24px rgba(0,0,0,0.35); border: 3px solid #ffffff; display: flex; align-items: center; justify-content: center;">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
            <div style="position: absolute; inset: -5px; border-radius: 50%; border: 2px solid ${pinColor}; opacity: 0.7; animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
          </div>
          <div style="width: 0; height: 0; border-left: 7px solid transparent; border-right: 7px solid transparent; border-top: 9px solid ${pinColor}; margin-top: -1px;"></div>
          <div style="margin-top: 4px; white-space: nowrap; background: rgba(255,255,255,0.96); color: #1e293b; font-weight: 700; font-size: 11px; padding: 2px 8px; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); border: 1px solid rgba(0,0,0,0.08);">
            ${displayVenueName.split('-')[0].trim()}
          </div>
        </div>
      `,
      iconSize: [0, 0],
      iconAnchor: [0, 0],
    });
  }, [isThemeAmber, displayVenueName]);

  // Start pin for route departure
  const createStartIcon = useCallback((startLabel: string) => {
    return L.divIcon({
      className: 'custom-start-pin',
      html: `
        <div style="position: relative; display: flex; flex-direction: column; align-items: center; transform: translate(-50%, -100%);">
          <div style="width: 36px; height: 36px; border-radius: 50%; background: #059669; box-shadow: 0 8px 20px rgba(5,150,105,0.4); border: 3px solid #ffffff; display: flex; align-items: center; justify-content: center;">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <polygon points="3 11 22 2 13 21 11 13 3 11"/>
            </svg>
          </div>
          <div style="width: 0; height: 0; border-left: 6px solid transparent; border-right: 6px solid transparent; border-top: 8px solid #059669; margin-top: -1px;"></div>
          <div style="margin-top: 3px; white-space: nowrap; background: rgba(255,255,255,0.96); color: #065f46; font-weight: 700; font-size: 10px; padding: 2px 7px; border-radius: 10px; box-shadow: 0 4px 10px rgba(0,0,0,0.12);">
            🚩 ${startLabel.split('(')[0].trim()}
          </div>
        </div>
      `,
      iconSize: [0, 0],
      iconAnchor: [0, 0],
    });
  }, []);

  const isInitialMountRef = useRef(true);
  const [isReady, setIsReady] = useState(false);

  // Safely observe container size so we only initialize Leaflet when visible with real dimensions
  useEffect(() => {
    const el = mapContainerRef.current;
    if (!el) return;

    if (el.clientWidth > 50 && el.clientHeight > 50) {
      setIsReady(true);
    }

    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.contentRect.width > 50 && entry.contentRect.height > 50) {
          setIsReady(true);
          if (mapInstanceRef.current) {
            try {
              mapInstanceRef.current.invalidateSize();
            } catch {
              // ignore
            }
          }
        }
      }
    });

    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Initialize and update the Leaflet map only when container has valid dimensions
  useEffect(() => {
    if (!isReady || !mapContainerRef.current) return;
    const el = mapContainerRef.current;
    if (el.clientWidth < 50 || el.clientHeight < 50) return;

    try {
      if (!mapInstanceRef.current) {
        const map = L.map(el, {
          center: [venue.lat, venue.lng],
          zoom: 15,
          zoomControl: false,
          attributionControl: false,
        });

        L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
          maxZoom: 19,
          subdomains: 'abcd',
        }).addTo(map);

        L.control.zoom({ position: 'bottomright' }).addTo(map);

        const routeGroup = L.layerGroup().addTo(map);
        routeLayerGroupRef.current = routeGroup;
        mapInstanceRef.current = map;
      }

      const map = mapInstanceRef.current;
      const routeGroup = routeLayerGroupRef.current;

      if (!map || !routeGroup) return;

      routeGroup.clearLayers();

      const venueMarker = L.marker([venue.lat, venue.lng], {
        icon: createVenueIcon(),
      }).addTo(routeGroup);

      venueMarker.bindPopup(`
        <div style="font-family: inherit; padding: 4px;">
          <p style="margin: 0; font-size: 11px; font-weight: 700; color: ${accentColor}; text-transform: uppercase;">Destination</p>
          <h4 style="margin: 4px 0; font-size: 14px; font-weight: 700; color: #0f172a;">${displayVenueName}</h4>
          <p style="margin: 0; font-size: 11px; color: #475569;">${displayVenueAddress}</p>
        </div>
      `);

      if (showRoute) {
        const startMarker = L.marker([venue.startLat, venue.startLng], {
          icon: createStartIcon(venue.startName),
        }).addTo(routeGroup);

        startMarker.bindPopup(`
          <div style="font-family: inherit; padding: 4px;">
            <p style="margin: 0; font-size: 11px; font-weight: 700; color: #059669; text-transform: uppercase;">Point de départ</p>
            <h4 style="margin: 4px 0; font-size: 13px; font-weight: 700; color: #0f172a;">${venue.startName}</h4>
            <p style="margin: 0; font-size: 11px; color: #475569;">Trajet recommandé vers le lieu du mariage</p>
          </div>
        `);

        L.polyline(venue.routeCoordinates, {
          color: isThemeAmber ? '#F59E0B' : '#C5924E',
          weight: 8,
          opacity: 0.45,
          lineCap: 'round',
          lineJoin: 'round',
        }).addTo(routeGroup);

        L.polyline(venue.routeCoordinates, {
          color: accentColor,
          weight: 4,
          opacity: 0.95,
          dashArray: '8, 8',
          lineCap: 'round',
          lineJoin: 'round',
        }).addTo(routeGroup);

        const bounds = L.latLngBounds(venue.routeCoordinates);
        const mapSize = map.getSize();
        if (mapSize && mapSize.x > 50 && mapSize.y > 50) {
          try {
            map.flyToBounds(bounds, {
              padding: [45, 45],
              duration: 1.2,
            });
          } catch {
            map.fitBounds(bounds, { padding: [20, 20] });
          }
        } else {
          map.fitBounds(bounds, { padding: [20, 20] });
        }
      } else {
        const mapSize = map.getSize();
        if (!isInitialMountRef.current && mapSize && mapSize.x > 50 && mapSize.y > 50) {
          try {
            map.flyTo([venue.lat, venue.lng], 15, {
              duration: 1.0,
            });
          } catch {
            map.setView([venue.lat, venue.lng], 15);
          }
        } else {
          map.setView([venue.lat, venue.lng], 15);
        }
      }

      isInitialMountRef.current = false;
    } catch (err) {
      console.warn('Leaflet map update caught error:', err);
    }
  }, [
    isReady,
    venue,
    showRoute,
    accentColor,
    isThemeAmber,
    createVenueIcon,
    createStartIcon,
    displayVenueName,
    displayVenueAddress,
  ]);

  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.remove();
        } catch {
          // ignore
        }
        mapInstanceRef.current = null;
      }
    };
  }, []);

  const handleCopyAddress = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(displayVenueAddress);
      setCopiedAddress(true);
      setTimeout(() => setCopiedAddress(false), 2000);
    }
  };

  const handleToggleRoute = () => {
    setIsScanning(true);
    setShowRoute((prev) => !prev);
    setTimeout(() => setIsScanning(false), 1200);
  };

  const handleRecenter = () => {
    if (mapInstanceRef.current) {
      setIsScanning(true);
      try {
        const mapSize = mapInstanceRef.current.getSize();
        if (mapSize && mapSize.x > 50 && mapSize.y > 50) {
          mapInstanceRef.current.flyTo([venue.lat, venue.lng], 16, { duration: 1.1 });
        } else {
          mapInstanceRef.current.setView([venue.lat, venue.lng], 16);
        }
      } catch {
        mapInstanceRef.current.setView([venue.lat, venue.lng], 16);
      }
      setTimeout(() => setIsScanning(false), 1200);
    }
  };

  return (
    <div
      className={`relative overflow-hidden rounded-[24px] border ${
        isThemeAmber ? 'border-amber-200/80 bg-[#FFFDFB]' : 'border-[#EAC9D1] bg-[#FFFDFD]'
      } p-4 sm:p-5 shadow-xl transition-all ${className}`}
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      {/* ─── CARD HEADER ─── */}
      <div className="flex items-center justify-between border-b pb-3 gap-2 border-slate-100">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span className="flex h-2 w-2 rounded-full" style={{ backgroundColor: accentColor }} />
            <p className="text-[10px] sm:text-[11px] font-bold tracking-widest uppercase text-slate-500 truncate">
              {isRtl ? 'خريطة الموقع والمسار المباشر' : 'CARTE INTERACTIVE & ITINÉRAIRE'}
            </p>
          </div>
          <h3 className="mt-0.5 text-base sm:text-lg font-bold text-slate-900 truncate font-serif">
            {displayVenueName}
          </h3>
        </div>

        {/* Recenter / Scan Trigger Button */}
        <button
          type="button"
          onClick={handleRecenter}
          title={isRtl ? 'إعادة تمركز الخريطة' : 'Recentrer la caméra sur le lieu'}
          className="flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-xl border transition-all active:scale-90 hover:scale-105 shadow-sm"
          style={{ backgroundColor: accentLight, borderColor: accentColor }}
        >
          <Crosshair
            className={`h-4 w-4 sm:h-5 sm:w-5 transition-transform duration-700 ${
              isScanning ? 'rotate-180 animate-spin' : ''
            }`}
            style={{ color: accentColor }}
          />
        </button>
      </div>

      {/* ─── VENUE ADDRESS BADGE ─── */}
      <div className="mt-2.5 flex items-start gap-2 text-xs text-slate-600">
        <MapPin className="h-3.5 w-3.5 shrink-0 mt-0.5" style={{ color: accentColor }} />
        <p className="line-clamp-2 leading-relaxed text-[11px] sm:text-xs font-medium">
          {displayVenueAddress}
        </p>
      </div>

      {/* ─── LEAFLET INTERACTIVE MAP STAGE (NO BLACK BACKGROUNDS) ─── */}
      <div
        className={`relative mt-3 overflow-hidden rounded-2xl border ${
          isThemeAmber ? 'border-amber-200/70' : 'border-[#F2D6DC]'
        } bg-[#FAF6F0] shadow-inner`}
      >
        <div ref={mapContainerRef} className={`w-full ${heightClass} relative z-0`} />

        {/* Floating Quick Toggle on Map (Venue vs Route) */}
        <div className="absolute top-2.5 right-2.5 z-10 flex items-center gap-1.5 rounded-full bg-white/95 backdrop-blur-md p-1 shadow-md border border-slate-200/80">
          <button
            type="button"
            onClick={() => setShowRoute(false)}
            className={`rounded-full px-2.5 py-1 text-[10px] font-bold transition-all cursor-pointer ${
              !showRoute
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {isRtl ? 'المكان' : 'Lieu'}
          </button>
          <button
            type="button"
            onClick={() => setShowRoute(true)}
            className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold transition-all cursor-pointer ${
              showRoute
                ? 'text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
            style={{ backgroundColor: showRoute ? accentColor : 'transparent' }}
          >
            <Car className="h-3 w-3" />
            <span>{isRtl ? 'المسار' : 'Itinéraire'}</span>
          </button>
        </div>

        {/* Floating Mode Indicator */}
        <div className="pointer-events-none absolute bottom-2.5 left-2.5 z-10 flex items-center gap-1.5 rounded-full bg-white/90 backdrop-blur-md px-2.5 py-1 text-[10px] font-semibold text-slate-800 shadow-sm border border-slate-200">
          <Navigation className="h-3 w-3" style={{ color: accentColor }} />
          <span>
            {showRoute
              ? isRtl
                ? `المسار من ${venue.startName} (${venue.distance})`
                : `Itinéraire depuis ${venue.startName} (${venue.distance})`
              : isRtl
              ? 'موقع الحفل الرسمي'
              : 'Emplacement officiel'}
          </span>
        </div>
      </div>

      {/* ─── MAIN BUTTON: SHOW THE WAY IN THE SAME MAP ─── */}
      <div className="mt-3.5 sm:mt-4 space-y-2">
        <button
          type="button"
          onClick={handleToggleRoute}
          className={`w-full inline-flex flex-col sm:flex-row items-center justify-center gap-1.5 sm:gap-2.5 rounded-2xl bg-gradient-to-r ${buttonGradient} px-4 py-3 sm:py-3.5 text-xs sm:text-sm font-bold text-white shadow-lg transition-all duration-300 hover:scale-[1.01] active:scale-95 text-center leading-snug break-words min-w-0 cursor-pointer`}
        >
          <div className="flex items-center justify-center gap-1.5 min-w-0 flex-wrap">
            <Compass className="h-4 w-4 text-amber-200 shrink-0" />
            <span className="break-words">
              {showRoute
                ? isRtl
                  ? '✓ تم إظهار الطريق على الخريطة'
                  : '✓ Itinéraire affiché sur la même carte'
                : directionsButtonText ||
                  (isRtl ? '📍 عرض الوجهة وخريطة الطريق' : '📍 Voir la destination & Obtenir l’itinéraire')}
            </span>
          </div>
          <span className="text-[10px] sm:text-[11px] font-normal opacity-90 block sm:inline break-words">
            {showRoute
              ? isRtl
                ? '(اضغط لإعادة التكبير على المكان)'
                : '(Cliquez pour re-centrer sur le lieu)'
              : isRtl
              ? '(رسم مسار الوصول مباشرة على نفس الخريطة)'
              : '(Voir le chemin & Guidage GPS direct)'}
          </span>
        </button>

        {/* ─── LIVE ROUTE & DESTINATION INFO CARD (DIRECTLY BELOW MAP) ─── */}
        <AnimatePresence>
          {showRoute && (
            <motion.div
              initial={{ opacity: 0, height: 0, y: -8 }}
              animate={{ opacity: 1, height: 'auto', y: 0 }}
              exit={{ opacity: 0, height: 0, y: -8 }}
              transition={{ duration: 0.3 }}
              className={`overflow-hidden rounded-2xl border p-4 shadow-md ${
                isThemeAmber
                  ? 'border-amber-300/80 bg-gradient-to-br from-[#FFFDF9] to-[#FDF6EE]'
                  : 'border-[#F2D6DC] bg-gradient-to-br from-[#FFFDFD] to-[#FAF1F3]'
              }`}
            >
              {/* Route Telemetry Bar */}
              <div className="flex items-center justify-between gap-2 border-b pb-2.5 border-slate-200/60">
                <div className="flex items-center gap-2">
                  <span
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-white shadow-xs"
                    style={{ backgroundColor: accentColor }}
                  >
                    <Car className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      {isRtl ? 'تفاصيل المسار المباشر' : 'GUIDAGE ROUTIER EN DIRECT'}
                    </p>
                    <h4 className="font-bold text-xs sm:text-sm text-slate-900 leading-tight">
                      {venue.distance} · {venue.duration} {isRtl ? 'بالسيارة' : 'en voiture'}
                    </h4>
                  </div>
                </div>

                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-[10px] font-bold text-emerald-800 border border-emerald-200">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 animate-pulse" />
                  {isRtl ? 'المسار مفعّل' : 'Tracé actif'}
                </span>
              </div>

              {/* Waypoints */}
              <div className="mt-3 space-y-2 text-xs text-slate-700 font-medium">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 shrink-0" />
                  <span className="text-slate-500">{isRtl ? 'من:' : 'Départ :'}</span>
                  <span className="font-semibold text-slate-900">{venue.startName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: accentColor }} />
                  <span className="text-slate-500">{isRtl ? 'إلى:' : 'Arrivée :'}</span>
                  <span className="font-semibold text-slate-900 truncate">{displayVenueName}</span>
                </div>
              </div>

              {/* Action Buttons: Google Maps External & Copy */}
              <div className="mt-3.5 flex flex-wrap items-center gap-2">
                <a
                  href={finalDirectionsUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:opacity-95 active:scale-95"
                  style={{ backgroundColor: accentColor }}
                >
                  <Compass className="h-3.5 w-3.5 text-white/90" />
                  <span>{isRtl ? 'فتح في خرائط Google' : 'Ouvrir dans Google Maps'}</span>
                  <ExternalLink className="h-3 w-3 text-white/80" />
                </a>

                <button
                  type="button"
                  onClick={handleCopyAddress}
                  className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs font-bold text-slate-800 hover:bg-slate-50 shadow-xs transition active:scale-95 cursor-pointer"
                >
                  {copiedAddress ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-600" />
                      <span>{isRtl ? 'تم النسخ!' : 'Copié !'}</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5 text-slate-600" />
                      <span>{isRtl ? 'نسخ العنوان' : 'Copier l’adresse'}</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <p className="text-center text-[10px] sm:text-[11px] text-slate-500 leading-tight">
          {directionsSubtext ||
            (isRtl
              ? 'اضغط لإظهار مسار الوصول كاملاً على الخريطة أو فتح الملاحة الصوتية في Google Maps.'
              : 'Cliquez pour voir le chemin directement sur la carte ou lancer le guidage GPS.')}
        </p>
      </div>
    </div>
  );
}
