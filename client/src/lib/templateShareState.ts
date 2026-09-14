export const getTemplateStorageKey = (templateId: string) => `invly-template-state:${templateId}`;

const encodeStateForUrl = (value: unknown) => {
  if (typeof window === 'undefined') return '';
  try {
    const json = JSON.stringify(value);
    const encoded = btoa(unescape(encodeURIComponent(json)));
    return encoded;
  } catch {
    return '';
  }
};

const isInvitationRoute = () => typeof window !== 'undefined' && /^\/invitation\/[^/]+$/.test(window.location.pathname);

const decodeBase64Json = <T>(raw: string, fallback: T): T => {
  try {
    const normalized = raw.replace(/-/g, '+').replace(/_/g, '/');
    const padded = normalized + '='.repeat((4 - (normalized.length % 4)) % 4);
    const binary = atob(padded);
    const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
    const text = new TextDecoder('utf-8').decode(bytes);
    const parsed = JSON.parse(text) as T;
    return parsed;
  } catch {
    return fallback;
  }
};

const decodeStateFromUrl = <T>(value: string | null, fallback: T): T => {
  if (!value || typeof window === 'undefined') return fallback;

  try {
    const raw = decodeURIComponent(value);

    if (!raw) return fallback;

    try {
      return JSON.parse(raw) as T;
    } catch {
      // Support older shared URLs created with base64-encoded JSON
      return decodeBase64Json(raw, fallback);
    }
  } catch {
    try {
      return JSON.parse(value) as T;
    } catch {
      return fallback;
    }
  }
};

const removeInvalidSharedState = () => {
  if (typeof window === 'undefined') return;

  const params = new URLSearchParams(window.location.search);
  if (!params.has('invdata')) return;

  params.delete('invdata');
  const nextUrl = `${window.location.pathname}${params.toString() ? `?${params.toString()}` : ''}`;
  window.history.replaceState({}, '', nextUrl);
};

export const loadTemplateState = <T>(_templateId: string, fallback: T): T => {
  if (typeof window === 'undefined') return fallback;

  const params = new URLSearchParams(window.location.search);
  if (!isInvitationRoute()) {
    if (params.has('invdata')) removeInvalidSharedState();
    return fallback;
  }

  const sharedState = params.get('invdata');
  if (sharedState) {
    const parsed = decodeStateFromUrl(sharedState, fallback);
    if (parsed === fallback && String(sharedState).trim() !== '') {
      removeInvalidSharedState();
    }
    return parsed;
  }

  return fallback;
};

export const saveTemplateState = <T>(_templateId: string, value: T) => {
  if (typeof window === 'undefined' || !isInvitationRoute()) return;

  const params = new URLSearchParams(window.location.search);
  const encoded = encodeStateForUrl(value);
  if (encoded) {
    params.set('invdata', encoded);
  } else {
    params.delete('invdata');
  }

  const nextUrl = `${window.location.pathname}${params.toString() ? `?${params.toString()}` : ''}`;
  window.history.replaceState({}, '', nextUrl);
};
