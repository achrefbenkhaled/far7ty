import { useCallback, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Compass, ExternalLink, Crosshair, Navigation, Check, Copy, Car } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { loadGoogleMapsApi } from '../lib/googleMapsLoader';
import { resolveMapsLocationRequest } from '../lib/mapsApi';
import {
  buildGoogleMapsDirectionsUrl,
  extractCoordinatesFromMapsUrl,
  isValidCoordinates,
  parseCoordinate,
  type GeoCoordinates,
} from '../lib/mapsLocation';

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
  googleMapsUrl?: string;
  latitude?: number | null;
  longitude?: number | null;
}

interface RouteSummary {
  distance: string;
  duration: string;
  trafficAware: boolean;
}

function googlePinIcon(color: string, label: string) {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="44" height="56" viewBox="0 0 44 56">
      <circle cx="22" cy="20" r="16" fill="${color}" stroke="#ffffff" stroke-width="3"/>
      <circle cx="22" cy="20" r="5" fill="#ffffff"/>
      <path d="M22 54 L12 32 H32 Z" fill="${color}"/>
    </svg>
  `;
  return {
    url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`,
    scaledSize: new google.maps.Size(36, 46),
    anchor: new google.maps.Point(18, 46),
    labelOrigin: new google.maps.Point(18, -4),
    label,
  };
}

function leafletPinIcon(color: string) {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="36" height="46" viewBox="0 0 44 56">
      <circle cx="22" cy="20" r="16" fill="${color}" stroke="#ffffff" stroke-width="3"/>
      <circle cx="22" cy="20" r="5" fill="#ffffff"/>
      <path d="M22 54 L12 32 H32 Z" fill="${color}"/>
    </svg>
  `;
  return L.divIcon({
    className: 'custom-leaflet-marker',
    html: `<div style="transform: translate(-50%, -100%); filter: drop-shadow(0 4px 6px rgba(0,0,0,0.35));">${svg}</div>`,
    iconSize: [36, 46],
    iconAnchor: [0, 0],
  });
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
  googleMapsUrl,
  latitude,
  longitude,
}: GtaMapViewerProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const googleMapRef = useRef<google.maps.Map | null>(null);
  const googleDestMarkerRef = useRef<google.maps.Marker | null>(null);
  const googleOriginMarkerRef = useRef<google.maps.Marker | null>(null);
  const googleDirectionsRef = useRef<google.maps.DirectionsRenderer | null>(null);
  const googleTrafficRef = useRef<google.maps.TrafficLayer | null>(null);

  const leafletMapRef = useRef<L.Map | null>(null);
  const leafletDestMarkerRef = useRef<L.Marker | null>(null);
  const leafletOriginMarkerRef = useRef<L.Marker | null>(null);
  const leafletPolylineRef = useRef<L.Polyline | null>(null);

  const lastRouteKeyRef = useRef<string>('');

  const [showRoute, setShowRoute] = useState(false);
  const [copiedAddress, setCopiedAddress] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [destination, setDestination] = useState<GeoCoordinates | null>(null);
  const [origin, setOrigin] = useState<GeoCoordinates | null>(null);
  const [routeSummary, setRouteSummary] = useState<RouteSummary | null>(null);
  const [engine, setEngine] = useState<'google' | 'leaflet' | 'none'>('none');

  const isThemeAmber = theme === 'amber';
  const accentColor = isThemeAmber ? '#D97706' : theme === 'rose' ? '#BE185D' : theme === 'dark' ? '#D4AF37' : '#9E4A5A';
  const accentLight = isThemeAmber ? 'rgba(217, 119, 6, 0.1)' : 'rgba(158, 74, 90, 0.1)';
  const buttonGradient = isThemeAmber
    ? 'from-amber-500 via-amber-600 to-amber-700 shadow-amber-500/25'
    : 'from-[#9E4A5A] via-[#B8576A] to-[#853648] shadow-[#9E4A5A]/25';

  // Sanitize venue names so raw URLs are NEVER displayed as headings or titles
  const isUrl = (val?: string) => Boolean(val && /^https?:\/\//i.test(val.trim()));
  const cleanTitle = isUrl(title) ? '' : title;
  const cleanLocationName = isUrl(locationName) ? '' : locationName;
  const cleanAddress = isUrl(address) ? '' : address;
  const displayVenueName = cleanLocationName || cleanTitle || cleanAddress || (isRtl ? 'موقع الحفل' : 'Lieu de la cérémonie');
  const displayVenueAddress = cleanAddress || (cleanLocationName && cleanLocationName !== displayVenueName ? cleanLocationName : '') || '';

  const destinationLabel = isRtl ? 'موقع الحفل' : 'Lieu de la cérémonie';
  const currentLocationLabel = isRtl ? 'موقعك الحالي' : 'Votre position';

  const fallbackDirectionsUrl =
    directionsUrl ||
    (destination
      ? buildGoogleMapsDirectionsUrl({ origin, destination })
      : googleMapsUrl ||
        (displayVenueAddress || displayVenueName
          ? `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(displayVenueAddress || displayVenueName)}&travelmode=driving`
          : ''));

  // Ensure map initializes only when container is visible with real dimensions
  useEffect(() => {
    const el = mapContainerRef.current;
    if (!el) return;
    if (el.clientWidth > 50 && el.clientHeight > 50) setIsReady(true);
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.contentRect.width > 50 && entry.contentRect.height > 50) {
          setIsReady(true);
          if (googleMapRef.current && window.google?.maps) {
            google.maps.event.trigger(googleMapRef.current, 'resize');
          }
          if (leafletMapRef.current) {
            leafletMapRef.current.invalidateSize();
          }
        }
      }
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Resolve destination coordinates from props, URL, or backend lookup
  useEffect(() => {
    const providedLat = parseCoordinate(latitude);
    const providedLng = parseCoordinate(longitude);
    if (providedLat !== null && providedLng !== null && isValidCoordinates(providedLat, providedLng)) {
      setDestination({ latitude: providedLat, longitude: providedLng });
      return;
    }

    const urlCandidate =
      (isUrl(googleMapsUrl) ? googleMapsUrl : '') ||
      (isUrl(locationQuery) ? locationQuery : '') ||
      (isUrl(address) ? address : '') ||
      (isUrl(locationName) ? locationName : '');
    if (urlCandidate) {
      const extracted = extractCoordinatesFromMapsUrl(urlCandidate);
      if (extracted) {
        setDestination(extracted);
        return;
      }
    }

    let cancelled = false;
    const lookup = async () => {
      try {
        const resolved = await resolveMapsLocationRequest({
          url: urlCandidate || undefined,
          query: !isUrl(locationQuery) ? [locationName, address, locationQuery].filter(Boolean).join(', ') : undefined,
        });
        if (cancelled) return;
        if (resolved && isValidCoordinates(resolved.latitude, resolved.longitude)) {
          setDestination({ latitude: resolved.latitude, longitude: resolved.longitude });
        }
      } catch {
        // Fallback default coordinates if offline
        if (!cancelled && !destination) {
          setDestination({ latitude: 36.8065, longitude: 10.1815 });
        }
      }
    };
    void lookup();
    return () => {
      cancelled = true;
    };
  }, [googleMapsUrl, latitude, longitude, locationQuery, locationName, address]);

  // Initialize Map Engine (Google Maps if available, otherwise Leaflet)
  useEffect(() => {
    if (!isReady || !mapContainerRef.current || !destination) return;

    let cancelled = false;

    // Try Google Maps first
    loadGoogleMapsApi(isRtl ? 'ar' : 'fr')
      .then(() => {
        if (cancelled || !mapContainerRef.current) return;
        setEngine('google');

        if (!googleMapRef.current) {
          const map = new google.maps.Map(mapContainerRef.current, {
            center: { lat: destination.latitude, lng: destination.longitude },
            zoom: 15,
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: true,
            zoomControl: true,
            gestureHandling: 'greedy',
            clickableIcons: false,
          });
          googleMapRef.current = map;
          googleDirectionsRef.current = new google.maps.DirectionsRenderer({
            map,
            suppressMarkers: true,
            preserveViewport: false,
            polylineOptions: {
              strokeColor: accentColor,
              strokeOpacity: 0.95,
              strokeWeight: 5,
            },
          });
          googleTrafficRef.current = new google.maps.TrafficLayer();
        } else {
          googleMapRef.current.panTo({ lat: destination.latitude, lng: destination.longitude });
          googleMapRef.current.setZoom(15);
        }

        // Place or update Google Maps destination pin
        googleDestMarkerRef.current?.setMap(null);
        googleDestMarkerRef.current = new google.maps.Marker({
          map: googleMapRef.current,
          position: { lat: destination.latitude, lng: destination.longitude },
          title: destinationLabel,
          icon: googlePinIcon(accentColor, ''),
          zIndex: 2,
        });
        const info = new google.maps.InfoWindow({
          content: `<div style="font-family:inherit;padding:4px;max-width:220px">
            <p style="margin:0;font-size:11px;font-weight:700;color:${accentColor}">${destinationLabel}</p>
            <h4 style="margin:4px 0;font-size:14px;font-weight:700;color:#0f172a">${displayVenueName}</h4>
            ${displayVenueAddress ? `<p style="margin:0;font-size:11px;color:#475569">${displayVenueAddress}</p>` : ''}
          </div>`,
        });
        googleDestMarkerRef.current.addListener('click', () => info.open({ map: googleMapRef.current, anchor: googleDestMarkerRef.current }));
      })
      .catch(() => {
        if (cancelled || !mapContainerRef.current) return;
        // Fallback cleanly to Leaflet
        setEngine('leaflet');

        if (!leafletMapRef.current) {
          const lMap = L.map(mapContainerRef.current, {
            center: [destination.latitude, destination.longitude],
            zoom: 15,
            zoomControl: true,
            attributionControl: false,
          });
          leafletMapRef.current = lMap;

          // Clean openstreetmap tiles with zero watermark and no API key needed
          L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
          }).addTo(lMap);
        } else {
          leafletMapRef.current.closePopup();
          leafletMapRef.current.flyTo([destination.latitude, destination.longitude], 15, {
            duration: 1.0,
          });
        }

        // Place or update Leaflet destination pin
        leafletDestMarkerRef.current?.remove();
        const marker = L.marker([destination.latitude, destination.longitude], {
          icon: leafletPinIcon(accentColor),
        }).addTo(leafletMapRef.current);
        marker.bindPopup(`
          <div style="font-family:inherit;padding:4px;min-width:160px;">
            <p style="margin:0;font-size:11px;font-weight:700;color:${accentColor}">${destinationLabel}</p>
            <h4 style="margin:4px 0;font-size:14px;font-weight:700;color:#0f172a">${displayVenueName}</h4>
            ${displayVenueAddress ? `<p style="margin:0;font-size:11px;color:#475569">${displayVenueAddress}</p>` : ''}
          </div>
        `);
        leafletDestMarkerRef.current = marker;
      });

    return () => {
      cancelled = true;
    };
  }, [accentColor, destination, destinationLabel, displayVenueAddress, displayVenueName, isReady, isRtl]);

  // Clean up Leaflet on unmount
  useEffect(() => {
    return () => {
      leafletMapRef.current?.remove();
      leafletMapRef.current = null;
    };
  }, []);

  const clearRouteOverlay = useCallback(() => {
    // Clear Google Maps overlay
    googleDirectionsRef.current?.set('directions', null);
    googleOriginMarkerRef.current?.setMap(null);
    googleOriginMarkerRef.current = null;
    googleTrafficRef.current?.setMap(null);

    // Clear Leaflet overlay
    leafletPolylineRef.current?.remove();
    leafletPolylineRef.current = null;
    leafletOriginMarkerRef.current?.remove();
    leafletOriginMarkerRef.current = null;

    lastRouteKeyRef.current = '';
    setRouteSummary(null);
    setOrigin(null);
  }, []);

  // Reset route whenever destination or location props change
  useEffect(() => {
    setShowRoute(false);
    clearRouteOverlay();
  }, [googleMapsUrl, locationQuery, latitude, longitude, clearRouteOverlay]);

  const drawRoute = useCallback(
    async (from: GeoCoordinates, to: GeoCoordinates) => {
      const routeKey = `${from.latitude},${from.longitude}|${to.latitude},${to.longitude}`;
      if (lastRouteKeyRef.current === routeKey && routeSummary) return;

      // Google Maps routing engine
      if (engine === 'google' && googleMapRef.current && window.google?.maps) {
        const map = googleMapRef.current;
        googleOriginMarkerRef.current?.setMap(null);
        googleOriginMarkerRef.current = new google.maps.Marker({
          map,
          position: { lat: from.latitude, lng: from.longitude },
          title: currentLocationLabel,
          icon: googlePinIcon('#059669', ''),
          zIndex: 3,
        });

        const service = new google.maps.DirectionsService();
        const request = (traffic: boolean): google.maps.DirectionsRequest => ({
          origin: { lat: from.latitude, lng: from.longitude },
          destination: { lat: to.latitude, lng: to.longitude },
          travelMode: google.maps.TravelMode.DRIVING,
          provideRouteAlternatives: false,
          ...(traffic ? { drivingOptions: { departureTime: new Date(), trafficModel: google.maps.TrafficModel.BEST_GUESS } } : {}),
        });

        try {
          let trafficAware = true;
          let result: google.maps.DirectionsResult;
          try {
            result = await new Promise((res, rej) =>
              service.route(request(true), (r, s) => (s === 'OK' && r ? res(r) : rej(s)))
            );
          } catch {
            trafficAware = false;
            result = await new Promise((res, rej) =>
              service.route(request(false), (r, s) => (s === 'OK' && r ? res(r) : rej(s)))
            );
          }

          googleDirectionsRef.current?.setDirections(result);
          googleTrafficRef.current?.setMap(map);
          const leg = result.routes[0]?.legs[0];
          const durationText = leg?.duration_in_traffic?.text || leg?.duration?.text || '';
          const distance = leg?.distance?.text || '';
          setRouteSummary({ distance, duration: durationText, trafficAware: Boolean(trafficAware && leg?.duration_in_traffic) });
          lastRouteKeyRef.current = routeKey;
          const bounds = result.routes[0]?.bounds;
          if (bounds) map.fitBounds(bounds, 48);
          return;
        } catch {
          // Fallback bounds
          map.fitBounds(
            new google.maps.LatLngBounds(
              { lat: Math.min(from.latitude, to.latitude), lng: Math.min(from.longitude, to.longitude) },
              { lat: Math.max(from.latitude, to.latitude), lng: Math.max(from.longitude, to.longitude) }
            ),
            48
          );
        }
      }

      // Leaflet routing engine
      if (leafletMapRef.current) {
        const lMap = leafletMapRef.current;
        leafletOriginMarkerRef.current?.remove();
        leafletOriginMarkerRef.current = L.marker([from.latitude, from.longitude], {
          icon: leafletPinIcon('#059669'),
        }).addTo(lMap);

        // Fetch driving road route from free OSRM service
        try {
          const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${from.longitude},${from.latitude};${to.longitude},${to.latitude}?overview=full&geometries=geojson`;
          const res = await fetch(osrmUrl);
          const data = (await res.json()) as {
            routes?: Array<{
              distance: number;
              duration: number;
              geometry: { coordinates: Array<[number, number]> };
            }>;
          };

          if (data.routes && data.routes.length > 0) {
            const road = data.routes[0];
            const latLngs = road.geometry.coordinates.map(([lng, lat]) => [lat, lng] as [number, number]);
            leafletPolylineRef.current?.remove();
            leafletPolylineRef.current = L.polyline(latLngs, {
              color: accentColor,
              weight: 5,
              opacity: 0.9,
            }).addTo(lMap);

            const km = (road.distance / 1000).toFixed(1);
            const mins = Math.max(1, Math.round(road.duration / 60));
            const durationStr = mins > 60 ? `${Math.floor(mins / 60)} h ${mins % 60} min` : `${mins} min`;

            setRouteSummary({ distance: `${km} km`, duration: durationStr, trafficAware: true });
            lastRouteKeyRef.current = routeKey;
            lMap.fitBounds(leafletPolylineRef.current.getBounds(), { padding: [40, 40] });
            return;
          }
        } catch {
          // OSRM failed, draw direct road polyline
        }

        // Direct straight line fallback if routing server unreachable
        const directCoords: Array<[number, number]> = [
          [from.latitude, from.longitude],
          [to.latitude, to.longitude],
        ];
        leafletPolylineRef.current?.remove();
        leafletPolylineRef.current = L.polyline(directCoords, {
          color: accentColor,
          weight: 4,
          dashArray: '8, 8',
          opacity: 0.85,
        }).addTo(lMap);

        const dLat = (to.latitude - from.latitude) * 111;
        const dLng = (to.longitude - from.longitude) * 111 * Math.cos((from.latitude * Math.PI) / 180);
        const approxKm = Math.sqrt(dLat * dLat + dLng * dLng).toFixed(1);
        const approxMins = Math.max(2, Math.round((Number(approxKm) / 45) * 60));

        setRouteSummary({ distance: `~${approxKm} km`, duration: `~${approxMins} min`, trafficAware: false });
        lastRouteKeyRef.current = routeKey;
        lMap.fitBounds(leafletPolylineRef.current.getBounds(), { padding: [40, 40] });
      }
    },
    [accentColor, currentLocationLabel, engine, routeSummary]
  );

  const requestVisitorRoute = useCallback(() => {
    if (!destination) {
      setStatusMessage(isRtl ? 'تعذر تحديد موقع الحفل على الخريطة.' : 'Le lieu de la cérémonie est introuvable.');
      setShowRoute(true);
      return;
    }

    if (!navigator.geolocation) {
      setStatusMessage(
        isRtl
          ? 'المتصفح لا يدعم تحديد الموقع. يمكنك فتح المسار مباشرة في تطبيق Google Maps.'
          : 'La géolocalisation n’est pas prise en charge. Ouvrez l’itinéraire dans Google Maps.'
      );
      setShowRoute(true);
      return;
    }

    setShowRoute(true);
    setIsScanning(true);
    setStatusMessage(
      isRtl
        ? 'نحتاج إلى إذن تحديد موقعك لحساب مسار الوصول إلى الحفل.'
        : 'Nous avons besoin de votre position pour calculer l’itinéraire vers le lieu.'
    );

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const nextOrigin = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };
        if (!isValidCoordinates(nextOrigin.latitude, nextOrigin.longitude)) {
          setStatusMessage(
            isRtl
              ? 'لم نتمكن من قراءة إحداثيات موقعك بدقة. يمكنك فتح المسار في Google Maps.'
              : 'Impossible de lire votre position exacte. Ouvrez l’itinéraire dans Google Maps.'
          );
          setIsScanning(false);
          return;
        }
        setOrigin(nextOrigin);
        setStatusMessage('');
        void drawRoute(nextOrigin, destination);
        setIsScanning(false);
      },
      () => {
        setStatusMessage(
          isRtl
            ? 'لم نتمكن من الوصول إلى موقعك الحالي. اضغط على الزر بالأسفل لفتح المسار في تطبيق Google Maps.'
            : 'Impossible d’accéder à votre position. Cliquez ci-dessous pour ouvrir le guidage dans Google Maps.'
        );
        setIsScanning(false);
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 60_000 }
    );
  }, [destination, drawRoute, isRtl]);

  const handleToggleRoute = () => {
    if (showRoute) {
      setShowRoute(false);
      clearRouteOverlay();
      if (googleMapRef.current && destination) {
        googleMapRef.current.panTo({ lat: destination.latitude, lng: destination.longitude });
        googleMapRef.current.setZoom(15);
      }
      if (leafletMapRef.current && destination) {
        leafletMapRef.current.setView([destination.latitude, destination.longitude], 15);
      }
      setStatusMessage('');
      return;
    }
    requestVisitorRoute();
  };

  const handleRecenter = () => {
    if (!destination) return;
    setIsScanning(true);
    if (googleMapRef.current) {
      googleMapRef.current.panTo({ lat: destination.latitude, lng: destination.longitude });
      googleMapRef.current.setZoom(16);
    }
    if (leafletMapRef.current) {
      leafletMapRef.current.setView([destination.latitude, destination.longitude], 16);
    }
    window.setTimeout(() => setIsScanning(false), 1200);
  };

  const handleCopyAddress = () => {
    const text = displayVenueAddress || displayVenueName;
    if (!text || !navigator.clipboard) return;
    navigator.clipboard.writeText(text);
    setCopiedAddress(true);
    setTimeout(() => setCopiedAddress(false), 2000);
  };

  return (
    <div
      className={`relative overflow-hidden rounded-[24px] border ${
        isThemeAmber ? 'border-amber-200/80 bg-[#FFFDFB]' : 'border-[#EAC9D1] bg-[#FFFDFD]'
      } p-4 sm:p-5 shadow-xl transition-all ${className}`}
      dir={isRtl ? 'rtl' : 'ltr'}
    >
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

      <div className="mt-2.5 flex items-start gap-2 text-xs text-slate-600">
        <MapPin className="h-3.5 w-3.5 shrink-0 mt-0.5" style={{ color: accentColor }} />
        <p className="line-clamp-2 leading-relaxed text-[11px] sm:text-xs font-medium">
          {displayVenueAddress || (isRtl ? 'موقع الحفل' : 'Lieu de la cérémonie')}
        </p>
      </div>

      <div
        className={`relative mt-3 overflow-hidden rounded-2xl border ${
          isThemeAmber ? 'border-amber-200/70' : 'border-[#F2D6DC]'
        } bg-[#FAF6F0] shadow-inner`}
      >
        <div ref={mapContainerRef} className={`w-full ${heightClass} relative z-0`} />

        <div className="absolute top-2.5 right-2.5 z-10 flex items-center gap-1.5 rounded-full bg-white/95 backdrop-blur-md p-1 shadow-md border border-slate-200/80">
          <button
            type="button"
            onClick={() => {
              setShowRoute(false);
              clearRouteOverlay();
              if (googleMapRef.current && destination) {
                googleMapRef.current.panTo({ lat: destination.latitude, lng: destination.longitude });
                googleMapRef.current.setZoom(15);
              }
              if (leafletMapRef.current && destination) {
                leafletMapRef.current.setView([destination.latitude, destination.longitude], 15);
              }
            }}
            className={`rounded-full px-2.5 py-1 text-[10px] font-bold transition-all cursor-pointer ${
              !showRoute ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {isRtl ? 'المكان' : 'Lieu'}
          </button>
          <button
            type="button"
            onClick={requestVisitorRoute}
            className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold transition-all cursor-pointer ${
              showRoute ? 'text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
            style={{ backgroundColor: showRoute ? accentColor : 'transparent' }}
          >
            <Car className="h-3 w-3" />
            <span>{isRtl ? 'المسار' : 'Itinéraire'}</span>
          </button>
        </div>

        <div className="pointer-events-none absolute bottom-2.5 left-2.5 z-10 flex items-center gap-1.5 rounded-full bg-white/90 backdrop-blur-md px-2.5 py-1 text-[10px] font-semibold text-slate-800 shadow-sm border border-slate-200">
          <Navigation className="h-3 w-3" style={{ color: accentColor }} />
          <span>
            {showRoute
              ? routeSummary
                ? isRtl
                  ? `المسار (${routeSummary.distance})`
                  : `Itinéraire (${routeSummary.distance})`
                : isRtl
                ? 'مسار الوصول المباشر'
                : 'Guidage GPS vers le lieu'
              : isRtl
              ? 'موقع الحفل الرسمي'
              : 'Emplacement officiel'}
          </span>
        </div>
      </div>

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
                      {routeSummary
                        ? `🚗 ${isRtl ? 'مدة الوصول' : 'Durée'} : ${routeSummary.duration} · 📍 ${isRtl ? 'المسافة' : 'Distance'} : ${routeSummary.distance}`
                        : isRtl
                        ? `مسار الوصول إلى ${displayVenueName}`
                        : `Itinéraire vers ${displayVenueName}`}
                    </h4>
                  </div>
                </div>

                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold border ${
                    routeSummary
                      ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                      : 'bg-amber-50 text-amber-800 border-amber-200'
                  }`}
                >
                  <span className={`h-1.5 w-1.5 rounded-full ${routeSummary ? 'bg-emerald-600' : 'bg-amber-500'}`} />
                  {routeSummary
                    ? routeSummary.trafficAware
                      ? isRtl
                        ? 'مرور محدّث'
                        : 'Trafic à jour'
                      : isRtl
                      ? 'المسار مفعّل'
                      : 'Tracé actif'
                    : isRtl
                    ? 'الملاحة جاهزة'
                    : 'Prêt pour navigation'}
                </span>
              </div>

              {statusMessage && (
                <p className="mt-3 rounded-xl bg-white/80 px-3 py-2 text-xs font-medium text-slate-700 border border-slate-200">
                  {statusMessage}
                </p>
              )}

              <div className="mt-3 space-y-2 text-xs text-slate-700 font-medium">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 shrink-0" />
                  <span className="text-slate-500">{isRtl ? 'من:' : 'Départ :'}</span>
                  <span className="font-semibold text-slate-900 truncate">
                    {origin ? currentLocationLabel : (isRtl ? 'موقعك الحالي (عبر Google Maps)' : 'Votre position')}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: accentColor }} />
                  <span className="text-slate-500">{isRtl ? 'إلى:' : 'Arrivée :'}</span>
                  <span className="font-semibold text-slate-900 truncate">{displayVenueName}</span>
                </div>
              </div>

              <div className="mt-3.5 flex flex-wrap items-center gap-2">
                <a
                  href={fallbackDirectionsUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:opacity-95 active:scale-95"
                  style={{ backgroundColor: accentColor }}
                >
                  <Compass className="h-3.5 w-3.5 text-white/90" />
                  <span>{isRtl ? 'فتح المسار في Google Maps' : 'Ouvrir dans Google Maps'}</span>
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
