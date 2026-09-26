const CALLBACK_NAME = '__invlyGoogleMapsInit';

let loadPromise: Promise<typeof google> | null = null;

export function getGoogleMapsBrowserKey() {
  return import.meta.env.VITE_GOOGLE_MAPS_API_KEY ?? '';
}

export function loadGoogleMapsApi(language = 'fr'): Promise<typeof google> {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('Google Maps can only load in the browser'));
  }

  if (window.google?.maps) {
    return Promise.resolve(window.google);
  }

  const apiKey = getGoogleMapsBrowserKey();
  if (!apiKey) {
    return Promise.reject(new Error('missing_key'));
  }

  if (loadPromise) return loadPromise;

  loadPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>('script[data-invly-google-maps="true"]');
    if (existing) {
      const ready = () => {
        if (window.google?.maps) resolve(window.google);
        else reject(new Error('Google Maps failed to load'));
      };
      existing.addEventListener('load', ready, { once: true });
      existing.addEventListener('error', () => reject(new Error('Google Maps failed to load')), { once: true });
      return;
    }

    const previous = (window as unknown as Record<string, unknown>)[CALLBACK_NAME];
    (window as unknown as Record<string, unknown>)[CALLBACK_NAME] = () => {
      if (typeof previous === 'function') previous();
      if (window.google?.maps) resolve(window.google);
      else reject(new Error('Google Maps failed to load'));
    };

    const script = document.createElement('script');
    script.dataset.invlyGoogleMaps = 'true';
    script.async = true;
    script.defer = true;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(apiKey)}&language=${encodeURIComponent(language)}&callback=${CALLBACK_NAME}`;
    script.onerror = () => {
      loadPromise = null;
      reject(new Error('Google Maps failed to load'));
    };
    document.head.appendChild(script);
  });

  return loadPromise;
}
