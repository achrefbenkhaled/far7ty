export interface ManagedInvitation {
  id: string;
  slug: string;
  previewToken: string;
  templateId: string;
  status: 'DRAFT' | 'PREVIEW' | 'CHANGES_REQUESTED' | 'APPROVED' | 'PUBLISHED';
  clientName: string;
  clientPhone: string;
  clientEmail?: string | null;
  eventType: string;
  data: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string | null;
}

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:4000';

async function request<T>(path: string, options: RequestInit = {}) {
  const response = await fetch(`${API_URL}${path}`, { ...options, credentials: 'include', headers: { 'Content-Type': 'application/json', ...options.headers } });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.message ?? 'Request failed');
  return payload as T;
}

export const manageApi = {
  async login(username: string, password: string) { return request<{ authenticated: boolean }>('/api/manage/auth/login', { method: 'POST', body: JSON.stringify({ username, password }) }); },
  async logout() { return request<{ authenticated: boolean }>('/api/manage/auth/logout', { method: 'POST' }); },
  async session() { return request<{ authenticated: boolean }>('/api/manage/auth/session'); },
  async list() { return request<{ invitations: ManagedInvitation[] }>('/api/manage/invitations'); },
  async get(id: string) { return request<{ invitation: ManagedInvitation }>(`/api/manage/invitations/${id}`); },
  async create(data: Omit<ManagedInvitation, 'id' | 'createdAt' | 'updatedAt' | 'publishedAt' | 'previewToken'>) { return request<{ invitation: ManagedInvitation }>('/api/manage/invitations', { method: 'POST', body: JSON.stringify(data) }); },
  async update(id: string, data: Partial<ManagedInvitation>) { return request<{ invitation: ManagedInvitation }>(`/api/manage/invitations/${id}`, { method: 'PATCH', body: JSON.stringify(data) }); },
  async remove(id: string) { return request<void>(`/api/manage/invitations/${id}`, { method: 'DELETE' }); },
  async publish(id: string) { return request<{ invitation: ManagedInvitation }>(`/api/manage/invitations/${id}/publish`, { method: 'POST' }); },
  async unpublish(id: string) { return request<{ invitation: ManagedInvitation }>(`/api/manage/invitations/${id}/unpublish`, { method: 'POST' }); },
};

export function invitationPreviewUrl(invitation: ManagedInvitation) { return `${window.location.origin}/invitation/${invitation.slug}?preview=${encodeURIComponent(invitation.previewToken)}`; }
export function invitationPublicUrl(invitation: ManagedInvitation) { return `${window.location.origin}/invitation/${invitation.slug}`; }
