import { useEffect, useRef, useState } from 'react';
import { loadGoogleMapsApi } from '../../lib/googleMapsLoader';
import { resolveMapsLocationRequest } from '../../lib/mapsApi';
import { extractCoordinatesFromMapsUrl, isValidCoordinates, parseCoordinate } from '../../lib/mapsLocation';

interface MapsLocationFieldProps {
  mapsUrl: string;
  latitude: unknown;
  longitude: unknown;
  address?: string;
  venue?: string;
  onChange: (next: { mapsUrl: string; mapsLatitude: number | null; mapsLongitude: number | null }) => void;
}

export function MapsLocationField({ mapsUrl, latitude, longitude, address, venue, onChange }: MapsLocationFieldProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const markerRef = useRef<google.maps.Marker | null>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const onChangeRef = useRef(onChange);
  const [status, setStatus] = useState('');
  const [resolving, setResolving] = useState(false);
  const [needsPicker, setNeedsPicker] = useState(false);

  onChangeRef.current = onChange;

  const lat = parseCoordinate(latitude);
  const lng = parseCoordinate(longitude);
  const hasCoords = lat !== null && lng !== null && isValidCoordinates(lat, lng);

  useEffect(() => {
    const url = mapsUrl.trim();
    if (!url) {
      setStatus('');
      setNeedsPicker(false);
      return;
    }

    const extracted = extractCoordinatesFromMapsUrl(url);
    if (extracted) {
      onChangeRef.current({ mapsUrl: url, mapsLatitude: extracted.latitude, mapsLongitude: extracted.longitude });
      setNeedsPicker(false);
      setStatus('Location coordinates extracted from the Google Maps URL.');
      return;
    }

    let cancelled = false;
    const timer = window.setTimeout(async () => {
      setResolving(true);
      const resolved = await resolveMapsLocationRequest({
        url,
        query: [venue, address].filter(Boolean).join(', ') || undefined,
      });
      if (cancelled) return;
      setResolving(false);
      if (resolved && isValidCoordinates(resolved.latitude, resolved.longitude)) {
        onChangeRef.current({ mapsUrl: url, mapsLatitude: resolved.latitude, mapsLongitude: resolved.longitude });
        setNeedsPicker(false);
        setStatus('Location coordinates were resolved and will be stored with the invitation.');
      } else {
        setNeedsPicker(true);
        setStatus('تعذر تحديد الموقع تلقائياً. يرجى اختيار موقع الحفل على الخريطة.');
      }
    }, 600);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [address, mapsUrl, venue]);

  useEffect(() => {
    if (!needsPicker && !hasCoords) return;
    let cancelled = false;
    loadGoogleMapsApi('fr')
      .then(() => {
        if (cancelled || !mapRef.current) return;
        const center = hasCoords && lat !== null && lng !== null ? { lat, lng } : { lat: 36.8065, lng: 10.1815 };
        if (!mapInstanceRef.current) {
          mapInstanceRef.current = new google.maps.Map(mapRef.current, {
            center,
            zoom: hasCoords ? 15 : 6,
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: false,
            gestureHandling: 'greedy',
          });
          mapInstanceRef.current.addListener('click', (event: google.maps.MapMouseEvent) => {
            if (!event.latLng) return;
            onChangeRef.current({
              mapsUrl,
              mapsLatitude: event.latLng.lat(),
              mapsLongitude: event.latLng.lng(),
            });
            setNeedsPicker(false);
            setStatus('Event destination saved from the map selection.');
          });
        }
        markerRef.current?.setMap(null);
        if (hasCoords && lat !== null && lng !== null) {
          markerRef.current = new google.maps.Marker({
            map: mapInstanceRef.current,
            position: { lat, lng },
            draggable: true,
            title: 'موقع الحفل',
          });
          markerRef.current.addListener('dragend', () => {
            const position = markerRef.current?.getPosition();
            if (!position) return;
            onChangeRef.current({ mapsUrl, mapsLatitude: position.lat(), mapsLongitude: position.lng() });
          });
          mapInstanceRef.current.setCenter({ lat, lng });
          mapInstanceRef.current.setZoom(15);
        }
      })
      .catch(() => {
        if (!cancelled && needsPicker) {
          setStatus('تعذر تحديد الموقع تلقائياً. يرجى اختيار موقع الحفل على الخريطة.');
        }
      });
    return () => {
      cancelled = true;
    };
  }, [hasCoords, lat, lng, mapsUrl, needsPicker]);

  return (
    <div className="sm:col-span-2 space-y-3">
      <label className="block text-sm font-semibold text-[#2d241e]">
        Google Maps Link
        <input
          type="url"
          value={mapsUrl}
          onChange={(event) =>
            onChange({ mapsUrl: event.target.value, mapsLatitude: null, mapsLongitude: null })
          }
          placeholder="https://maps.app.goo.gl/..."
          className="mt-2 w-full rounded-xl border border-[#e6d9cc] bg-white px-4 py-3 font-normal outline-none focus:border-[#8a6a4a]"
        />
        <span className="mt-1 block text-xs text-[#715c49]">
          Paste a Google Maps share link. Short maps.app.goo.gl links are resolved on the server and stored as coordinates.
        </span>
      </label>

      {(needsPicker || hasCoords) && (
        <div className="overflow-hidden rounded-2xl border border-[#e6d9cc] bg-white">
          <div ref={mapRef} className="h-56 w-full" />
        </div>
      )}

      <p className={`text-xs ${needsPicker ? 'font-semibold text-red-700' : 'text-[#715c49]'}`}>
        {resolving ? 'Resolving Google Maps location…' : status}
        {hasCoords && lat !== null && lng !== null ? ` (${lat.toFixed(6)}, ${lng.toFixed(6)})` : ''}
      </p>
    </div>
  );
}
