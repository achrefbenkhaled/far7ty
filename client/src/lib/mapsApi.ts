const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:4000';

export async function resolveMapsLocationRequest(input: {
  url?: string;
  query?: string;
  latitude?: number;
  longitude?: number;
}): Promise<{
  latitude: number;
  longitude: number;
  formattedAddress?: string;
  googleMapsUrl: string;
} | null> {
  const response = await fetch(`${API_URL}/api/maps/resolve`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  const payload = (await response.json().catch(() => ({}))) as {
    location?: {
      latitude: number;
      longitude: number;
      formattedAddress?: string;
      googleMapsUrl: string;
    } | null;
  };
  if (!response.ok || !payload.location) return null;
  return payload.location;
}
