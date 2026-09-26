

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:4000';

function authHeaders(): HeadersInit {
  const token = localStorage.getItem('invly_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...authHeaders(), ...options.headers },
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error((payload as any).message ?? 'Request failed');
  return payload as T;
}

export const memoriesApi = {
  // Auth
  async register(name: string, email: string, password: string) {
    return request('/api/auth/register', { method: 'POST', body: JSON.stringify({ name, email, password }) });
  },
  async login(email: string, password: string) {
    return request('/api/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
  },
  async me() {
    return request('/api/auth/me');
  },

  // Guest side (by token)
  async getEvent(token: string) {
    return request(`/api/memories/${token}`);
  },
  async getGallery(token: string, page = 1) {
    return request(`/api/memories/${token}/gallery?page=${page}`);
  },
  async uploadPhoto(token: string, file: File) {
    const form = new FormData();
    form.append('photo', file);
    const tokenHeader = localStorage.getItem('invly_token');
    const response = await fetch(`${API_URL}/api/memories/${token}/upload`, {
      method: 'POST',
      headers: tokenHeader ? { Authorization: `Bearer ${tokenHeader}` } : {},
      body: form,
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error((payload as any).message ?? 'Upload failed');
    return payload;
  },
  async getStorage(token: string) {
    return request(`/api/memories/${token}/storage`);
  },

  // Owner management (by invitation id)
  async enableMemories(id: string) {
    return request(`/api/manage/invitations/${id}/memories/enable`, { method: 'POST' });
  },
  async disableMemories(id: string) {
    return request(`/api/manage/invitations/${id}/memories/disable`, { method: 'POST' });
  },
  async updateSettings(id: string, settings: { guestUploadsEnabled?: boolean; storageQuotaBytes?: number }) {
    return request(`/api/manage/invitations/${id}/memories/settings`, { method: 'PATCH', body: JSON.stringify(settings) });
  },
  async getMedia(id: string, status?: string) {
    const q = status ? `?status=${status}` : '';
    return request(`/api/manage/invitations/${id}/memories/media${q}`);
  },
  async moderateMedia(id: string, mediaId: string, status: 'APPROVED' | 'REJECTED') {
    return request(`/api/manage/invitations/${id}/memories/media/${mediaId}`, { method: 'PATCH', body: JSON.stringify({ status }) });
  },
  async deleteMedia(id: string, mediaId: string) {
    return request(`/api/manage/invitations/${id}/memories/media/${mediaId}`, { method: 'DELETE' });
  },
  async getStorageAdmin(id: string) {
    return request(`/api/manage/invitations/${id}/memories/storage`);
  },
  async getQRUrl(id: string) {
    return request(`/api/manage/invitations/${id}/memories/qr`);
  },
};

export interface MediaItem {
  id: string;
  fileName: string;
  mimeType: string;
  width: number | null;
  height: number | null;
  url: string;
  uploaderName: string;
  uploadedAt: string;
  status?: string;
}

export interface StorageInfo {
  used: number;
  quota: number;
  remaining: number;
  percentage: number;
}

export interface EventInfo {
  slug: string;
  eventType: string;
  clientName: string;
  memoriesEnabled: boolean;
  guestUploadsEnabled: boolean;
  templateId: string;
}
