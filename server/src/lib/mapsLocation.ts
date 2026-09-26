export interface GeoCoordinates {
  latitude: number;
  longitude: number;
}

export interface ResolvedMapsLocation extends GeoCoordinates {
  formattedAddress?: string;
  googleMapsUrl: string;
  source: 'url' | 'geocode' | 'coordinates';
}

const ALLOWED_HOST_SUFFIXES = [
  'google.com',
  'google.tn',
  'google.fr',
  'google.co.uk',
  'google.ca',
  'google.de',
  'google.es',
  'google.it',
  'google.be',
  'google.nl',
  'google.ch',
  'google.ae',
  'google.sa',
  'google.com.eg',
  'google.co.ma',
  'google.dz',
  'gstatic.com',
];

const ALLOWED_HOSTS = new Set([
  'maps.app.goo.gl',
  'goo.gl',
  'g.co',
]);

const COORD_EPSILON_ZERO = 0.0001;

export function isValidCoordinates(latitude: unknown, longitude: unknown): latitude is number {
  if (typeof latitude !== 'number' || typeof longitude !== 'number') return false;
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return false;
  if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) return false;
  if (Math.abs(latitude) < COORD_EPSILON_ZERO && Math.abs(longitude) < COORD_EPSILON_ZERO) return false;
  return true;
}

export function parseCoordinate(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim()) {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return null;
}

export function isAllowedMapsUrl(value: string): boolean {
  try {
    const url = new URL(value);
    if (url.protocol !== 'https:' && url.protocol !== 'http:') return false;
    const host = url.hostname.toLowerCase().replace(/^www\./, '');
    if (ALLOWED_HOSTS.has(host)) return true;
    return ALLOWED_HOST_SUFFIXES.some((suffix) => host === suffix || host.endsWith(`.${suffix}`));
  } catch {
    return false;
  }
}

function toFiniteNumber(value: string): number | null {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export function extractCoordinatesFromMapsUrl(rawUrl: string): GeoCoordinates | null {
  let url: URL;
  try {
    url = new URL(rawUrl);
  } catch {
    return null;
  }

  const decoded = decodeURIComponent(rawUrl);

  const placeCoord = decoded.match(/!3d(-?\d+(?:\.\d+)?)!4d(-?\d+(?:\.\d+)?)/);
  if (placeCoord) {
    const latitude = toFiniteNumber(placeCoord[1]);
    const longitude = toFiniteNumber(placeCoord[2]);
    if (latitude !== null && longitude !== null && isValidCoordinates(latitude, longitude)) {
      return { latitude, longitude };
    }
  }

  const atCoord = decoded.match(/@(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/);
  if (atCoord) {
    const latitude = toFiniteNumber(atCoord[1]);
    const longitude = toFiniteNumber(atCoord[2]);
    if (latitude !== null && longitude !== null && isValidCoordinates(latitude, longitude)) {
      return { latitude, longitude };
    }
  }

  const queryKeys = ['q', 'query', 'll', 'center', 'destination', 'origin', 'daddr', 'saddr'];
  for (const key of queryKeys) {
    const value = url.searchParams.get(key);
    if (!value) continue;
    const match = value.trim().match(/^(-?\d+(?:\.\d+)?)(?:\s*,\s*|\s+)(-?\d+(?:\.\d+)?)$/);
    if (!match) continue;
    const latitude = toFiniteNumber(match[1]);
    const longitude = toFiniteNumber(match[2]);
    if (latitude !== null && longitude !== null && isValidCoordinates(latitude, longitude)) {
      return { latitude, longitude };
    }
  }

  const pathSearch = url.pathname.match(/\/search\/(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/);
  if (pathSearch) {
    const latitude = toFiniteNumber(pathSearch[1]);
    const longitude = toFiniteNumber(pathSearch[2]);
    if (latitude !== null && longitude !== null && isValidCoordinates(latitude, longitude)) {
      return { latitude, longitude };
    }
  }

  return null;
}

export function extractGeocodeQueryFromMapsUrl(rawUrl: string): string | null {
  try {
    const url = new URL(rawUrl);
    const q = url.searchParams.get('q') || url.searchParams.get('query') || url.searchParams.get('destination');
    if (q && !/^(-?\d+(?:\.\d+)?)(?:\s*,\s*|\s+)(-?\d+(?:\.\d+)?)$/.test(q.trim())) {
      return q.trim().slice(0, 400);
    }
    const placeMatch = decodeURIComponent(url.pathname).match(/\/maps\/place\/([^/@]+)/);
    if (placeMatch?.[1]) {
      return placeMatch[1].replace(/\+/g, ' ').trim().slice(0, 400);
    }
    return null;
  } catch {
    return null;
  }
}

const resolveCache = new Map<string, { value: ResolvedMapsLocation | null; expiresAt: number }>();
const CACHE_TTL_MS = 12 * 60 * 60 * 1000;

async function followAllowedRedirects(startUrl: string): Promise<{ url: string; body?: string }> {
  let current = startUrl;
  for (let hop = 0; hop < 8; hop += 1) {
    if (!isAllowedMapsUrl(current)) {
      throw new Error('Redirected to a non-Google host');
    }
    const response = await fetch(current, {
      method: 'GET',
      redirect: 'manual',
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
        Accept: 'text/html,application/xhtml+xml',
      },
    });
    const location = response.headers.get('location');
    if (location && response.status >= 300 && response.status < 400) {
      current = new URL(location, current).toString();
      continue;
    }
    const contentType = response.headers.get('content-type') ?? '';
    let body: string | undefined;
    if (contentType.includes('text/html')) {
      const text = await response.text();
      body = text.slice(0, 250_000);
    }
    return { url: response.url || current, body };
  }
  return { url: current };
}

function extractCoordinatesFromHtml(html: string): GeoCoordinates | null {
  const patterns = [
    /!3d(-?\d+(?:\.\d+)?)!4d(-?\d+(?:\.\d+)?)/,
    /@(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/,
    /\[null,null,(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)\]/,
    /"location"\s*:\s*\{\s*"lat"\s*:\s*(-?\d+(?:\.\d+)?)\s*,\s*"lng"\s*:\s*(-?\d+(?:\.\d+)?)/,
  ];
  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (!match) continue;
    const latitude = toFiniteNumber(match[1]);
    const longitude = toFiniteNumber(match[2]);
    if (latitude !== null && longitude !== null && isValidCoordinates(latitude, longitude)) {
      return { latitude, longitude };
    }
  }
  return null;
}

async function geocodeAddress(query: string): Promise<{ coordinates: GeoCoordinates; formattedAddress?: string } | null> {
  const cleanQuery = query.trim().slice(0, 400);
  if (!cleanQuery) return null;

  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (apiKey) {
    try {
      const endpoint = new URL('https://maps.googleapis.com/maps/api/geocode/json');
      endpoint.searchParams.set('address', cleanQuery);
      endpoint.searchParams.set('key', apiKey);

      const response = await fetch(endpoint);
      if (response.ok) {
        const payload = (await response.json()) as {
          status?: string;
          results?: Array<{
            formatted_address?: string;
            geometry?: { location?: { lat?: number; lng?: number } };
          }>;
        };
        if (payload.status === 'OK' && payload.results?.[0]?.geometry?.location) {
          const latitude = payload.results[0].geometry.location.lat;
          const longitude = payload.results[0].geometry.location.lng;
          if (typeof latitude === 'number' && typeof longitude === 'number' && isValidCoordinates(latitude, longitude)) {
            return {
              coordinates: { latitude, longitude },
              formattedAddress: payload.results[0].formatted_address,
            };
          }
        }
      }
    } catch {
      // Ignore and proceed to Nominatim fallback
    }
  }

  // Free fallback geocoding without requiring API key
  try {
    const endpoint = new URL('https://nominatim.openstreetmap.org/search');
    endpoint.searchParams.set('q', cleanQuery);
    endpoint.searchParams.set('format', 'json');
    endpoint.searchParams.set('limit', '1');
    const response = await fetch(endpoint, {
      headers: { 'User-Agent': 'InvlyDigitalInvitations/1.0' },
    });
    if (response.ok) {
      const results = (await response.json()) as Array<{ lat: string; lon: string; display_name?: string }>;
      if (Array.isArray(results) && results.length > 0) {
        const latitude = parseFloat(results[0].lat);
        const longitude = parseFloat(results[0].lon);
        if (isValidCoordinates(latitude, longitude)) {
          return {
            coordinates: { latitude, longitude },
            formattedAddress: results[0].display_name,
          };
        }
      }
    }
  } catch {
    // Return null if geocoding failed
  }

  return null;
}

export async function resolveMapsLocation(input: {
  url?: string;
  query?: string;
  latitude?: number | null;
  longitude?: number | null;
}): Promise<ResolvedMapsLocation | null> {
  const latitude = parseCoordinate(input.latitude);
  const longitude = parseCoordinate(input.longitude);
  if (latitude !== null && longitude !== null && isValidCoordinates(latitude, longitude)) {
    return {
      latitude,
      longitude,
      googleMapsUrl: input.url && isAllowedMapsUrl(input.url) ? input.url : `https://www.google.com/maps?q=${latitude},${longitude}`,
      source: 'coordinates',
    };
  }

  const url = input.url?.trim();
  const query = input.query?.trim();
  const cacheKey = JSON.stringify({ url: url || '', query: query || '' });
  const cached = resolveCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) return cached.value;

  let resolved: ResolvedMapsLocation | null = null;

  if (url) {
    if (!isAllowedMapsUrl(url)) {
      resolveCache.set(cacheKey, { value: null, expiresAt: Date.now() + 60_000 });
      return null;
    }

    const fromOriginal = extractCoordinatesFromMapsUrl(url);
    if (fromOriginal) {
      resolved = { ...fromOriginal, googleMapsUrl: url, source: 'url' };
    } else {
      try {
        const followed = await followAllowedRedirects(url);
        const fromFinal = extractCoordinatesFromMapsUrl(followed.url);
        const fromHtml = followed.body ? extractCoordinatesFromHtml(followed.body) : null;
        const coords = fromFinal ?? fromHtml;
        if (coords) {
          resolved = { ...coords, googleMapsUrl: url, source: 'url' };
        } else {
          const geocodeQuery = extractGeocodeQueryFromMapsUrl(followed.url) || extractGeocodeQueryFromMapsUrl(url);
          if (geocodeQuery) {
            const geocoded = await geocodeAddress(geocodeQuery);
            if (geocoded) {
              resolved = {
                ...geocoded.coordinates,
                formattedAddress: geocoded.formattedAddress,
                googleMapsUrl: url,
                source: 'geocode',
              };
            }
          }
        }
      } catch {
        const geocodeQuery = extractGeocodeQueryFromMapsUrl(url);
        if (geocodeQuery) {
          const geocoded = await geocodeAddress(geocodeQuery);
          if (geocoded) {
            resolved = {
              ...geocoded.coordinates,
              formattedAddress: geocoded.formattedAddress,
              googleMapsUrl: url,
              source: 'geocode',
            };
          }
        }
      }
    }
  }

  if (!resolved && query) {
    if (/^https?:\/\//i.test(query)) {
      if (isAllowedMapsUrl(query)) {
        return resolveMapsLocation({ url: query });
      }
      resolveCache.set(cacheKey, { value: null, expiresAt: Date.now() + 60_000 });
      return null;
    }
    const geocoded = await geocodeAddress(query);
    if (geocoded) {
      resolved = {
        ...geocoded.coordinates,
        formattedAddress: geocoded.formattedAddress,
        googleMapsUrl: `https://www.google.com/maps?q=${geocoded.coordinates.latitude},${geocoded.coordinates.longitude}`,
        source: 'geocode',
      };
    }
  }

  resolveCache.set(cacheKey, { value: resolved, expiresAt: Date.now() + CACHE_TTL_MS });
  return resolved;
}

export async function enrichInvitationLocationData(data: Record<string, unknown>): Promise<Record<string, unknown>> {
  const mapsUrl = typeof data.mapsUrl === 'string' ? data.mapsUrl.trim() : '';
  const latitude = parseCoordinate(data.mapsLatitude);
  const longitude = parseCoordinate(data.mapsLongitude);

  if (isValidCoordinates(latitude, longitude)) {
    return {
      ...data,
      mapsLatitude: latitude,
      mapsLongitude: longitude,
      ...(mapsUrl ? { mapsUrl } : {}),
    };
  }

  if (!mapsUrl && typeof data.address !== 'string' && typeof data.venue !== 'string') {
    return data;
  }

  const resolved = await resolveMapsLocation({
    url: mapsUrl || undefined,
    query: [typeof data.venue === 'string' ? data.venue : '', typeof data.address === 'string' ? data.address : '']
      .filter(Boolean)
      .join(', ') || undefined,
  });

  if (!resolved) return data;

  return {
    ...data,
    mapsLatitude: resolved.latitude,
    mapsLongitude: resolved.longitude,
    ...(resolved.formattedAddress && !data.address ? { address: resolved.formattedAddress } : {}),
    mapsUrl: mapsUrl || resolved.googleMapsUrl,
  };
}
