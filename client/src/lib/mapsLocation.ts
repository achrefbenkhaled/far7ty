export interface GeoCoordinates {
  latitude: number;
  longitude: number;
}

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

export function extractCoordinatesFromMapsUrl(rawUrl: string): GeoCoordinates | null {
  let url: URL;
  try {
    url = new URL(rawUrl);
  } catch {
    return null;
  }

  const decoded = decodeURIComponent(rawUrl);
  const toFiniteNumber = (value: string) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  };

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

  return null;
}

export function buildGoogleMapsDirectionsUrl(input: {
  origin?: GeoCoordinates | null;
  destination: GeoCoordinates;
}): string {
  const parts = [
    'api=1',
    `destination=${input.destination.latitude},${input.destination.longitude}`,
  ];
  if (input.origin && isValidCoordinates(input.origin.latitude, input.origin.longitude)) {
    parts.push(`origin=${input.origin.latitude},${input.origin.longitude}`);
  }
  parts.push('travelmode=driving');
  return `https://www.google.com/maps/dir/?${parts.join('&')}`;
}

export function invitationCoordinates(data?: Record<string, unknown> | null): GeoCoordinates | null {
  if (!data) return null;
  const latitude = parseCoordinate(data.mapsLatitude);
  const longitude = parseCoordinate(data.mapsLongitude);
  return latitude !== null && longitude !== null && isValidCoordinates(latitude, longitude)
    ? { latitude, longitude }
    : null;
}

export function isUrlString(value?: unknown): boolean {
  if (typeof value !== 'string') return false;
  const trimmed = value.trim();
  return /^https?:\/\//i.test(trimmed);
}

export function extractMapsUrlFromItem(item?: Record<string, unknown> | null, defaultUrl = ''): string {
  if (!item) return defaultUrl;
  const candidateKeys = ['mapQuery', 'mapsUrl', 'url', 'location', 'address'];
  for (const key of candidateKeys) {
    const val = item[key];
    if (typeof val === 'string' && isUrlString(val)) {
      return val.trim();
    }
  }
  return defaultUrl;
}

export function cleanDisplayLocation(value?: unknown, fallback = ''): string {
  if (typeof value !== 'string') return fallback;
  const trimmed = value.trim();
  if (!trimmed || isUrlString(trimmed)) return fallback;
  return trimmed;
}
