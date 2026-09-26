import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Camera,
  Check,
  Download,
  Eye,
  HardDrive,
  Image,
  Loader2,
  ToggleLeft,
  ToggleRight,
  Trash2,
  X,
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { memoriesApi, type MediaItem, type StorageInfo } from '../lib/memoriesApi';

export function ManageMemories() {
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [memoriesEnabled, setMemoriesEnabled] = useState(false);
  const [guestUploadsEnabled, setGuestUploadsEnabled] = useState(true);
  const [memoriesToken, setMemoriesToken] = useState<string | null>(null);
  const [storageQuotaBytes, setStorageQuotaBytes] = useState(1073741824);

  const [media, setMedia] = useState<MediaItem[]>([]);
  const [storage, setStorage] = useState<StorageInfo | null>(null);
  const [qrUrl, setQrUrl] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const load = async () => {
    if (!id) return;
    try {
      // Load invitation details to get memories settings
      const { invitation } = await fetch(
        `${import.meta.env.VITE_API_URL ?? 'http://localhost:4000'}/api/manage/invitations/${id}`,
        { credentials: 'include', headers: { 'Content-Type': 'application/json' } },
      ).then((r) => r.json());

      setMemoriesEnabled(invitation.memoriesEnabled ?? false);
      setGuestUploadsEnabled(invitation.guestUploadsEnabled ?? true);
      setMemoriesToken(invitation.memoriesToken ?? null);
      setStorageQuotaBytes(Number(invitation.storageQuotaBytes ?? 1073741824));

      if (invitation.memoriesEnabled) {
        const [mediaResult, storageResult] = await Promise.all([
          memoriesApi.getMedia(id, statusFilter || undefined),
          memoriesApi.getStorageAdmin(id),
        ]);
        setMedia(mediaResult.media ?? []);
        setStorage(storageResult);

        if (invitation.memoriesToken) {
          try {
            const qr = await memoriesApi.getQRUrl(id);
            setQrUrl(qr.url);
          } catch {
            // QR not available yet
          }
        }
      }
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Unable to load');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [id, statusFilter]);

  const toggleMemories = async () => {
    if (!id) return;
    setActionLoading('toggle');
    try {
      if (memoriesEnabled) {
        await memoriesApi.disableMemories(id);
        setMemoriesEnabled(false);
      } else {
        const result = await memoriesApi.enableMemories(id);
        setMemoriesEnabled(true);
        setMemoriesToken(result.invitation.memoriesToken);
      }
      await load();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Failed to toggle');
    } finally {
      setActionLoading(null);
    }
  };

  const toggleUploads = async () => {
    if (!id) return;
    setActionLoading('uploads');
    try {
      await memoriesApi.updateSettings(id, { guestUploadsEnabled: !guestUploadsEnabled });
      setGuestUploadsEnabled(!guestUploadsEnabled);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Failed to update');
    } finally {
      setActionLoading(null);
    }
  };

  const moderatePhoto = async (mediaId: string, status: 'APPROVED' | 'REJECTED') => {
    if (!id) return;
    setActionLoading(mediaId);
    try {
      await memoriesApi.moderateMedia(id, mediaId, status);
      await load();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Failed to moderate');
    } finally {
      setActionLoading(null);
    }
  };

  const deletePhoto = async (mediaId: string) => {
    if (!id || !window.confirm('Delete this photo permanently?')) return;
    setActionLoading(mediaId);
    try {
      await memoriesApi.deleteMedia(id, mediaId);
      await load();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Failed to delete');
    } finally {
      setActionLoading(null);
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  };

  if (loading) {
    return (
      <main className="flex min-h-[60vh] items-center justify-center text-sm text-[#5c4a3d]">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Loading memories settings...
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl px-5 py-10 lg:px-8">
      <Link
        to="/manage"
        className="inline-flex items-center gap-2 text-sm font-semibold text-[#5c4a3d] hover:text-[#2d241e]"
      >
        <ArrowLeft className="h-4 w-4" /> Back to dashboard
      </Link>

      <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#8a6a4a]">
            Event Memories
          </p>
          <h1 className="mt-2 font-serif text-4xl text-[#2d241e]">Manage Gallery</h1>
        </div>

        <button
          onClick={toggleMemories}
          disabled={actionLoading === 'toggle'}
          className={`inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold transition ${
            memoriesEnabled
              ? 'bg-red-50 text-red-700 hover:bg-red-100'
              : 'bg-[#2d241e] text-white hover:bg-[#453a33]'
          }`}
        >
          {memoriesEnabled ? (
            <>
              <ToggleRight className="h-4 w-4" /> Disable Memories
            </>
          ) : (
            <>
              <ToggleLeft className="h-4 w-4" /> Enable Memories
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {!memoriesEnabled ? (
        <div className="mt-10 flex flex-col items-center justify-center rounded-3xl border border-dashed border-[#e6d9cc] bg-[#faf6f1] p-12 text-center">
          <Camera className="mb-4 h-12 w-12 text-[#c4a882]" />
          <h2 className="font-serif text-2xl text-[#2d241e]">Memories are disabled</h2>
          <p className="mt-2 max-w-md text-sm text-[#715c49]">
            Enable memories to let guests upload and share photos from your event. You'll be able
            to approve every photo before it appears in the gallery.
          </p>
        </div>
      ) : (
        <div className="mt-8 space-y-8">
          {/* Settings + Storage Row */}
          <div className="grid gap-6 md:grid-cols-3">
            {/* Guest Uploads Toggle */}
            <div className="rounded-2xl border border-[#e6d9cc] bg-[#fffdfb] p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-[#8a6a4a]">
                    Guest Uploads
                  </p>
                  <p className="mt-1 text-2xl font-bold">{guestUploadsEnabled ? 'ON' : 'OFF'}</p>
                </div>
                <button
                  onClick={toggleUploads}
                  disabled={actionLoading === 'uploads'}
                  className="rounded-full border border-[#d8c4a8] bg-white px-3 py-1.5 text-xs font-semibold hover:bg-[#f8f1ea]"
                >
                  Toggle
                </button>
              </div>
            </div>

            {/* Storage Usage */}
            {storage && (
              <>
                <div className="rounded-2xl border border-[#e6d9cc] bg-[#fffdfb] p-5">
                  <p className="text-xs font-semibold uppercase tracking-wide text-[#8a6a4a]">
                    Storage Used
                  </p>
                  <p className="mt-1 text-2xl font-bold">
                    {formatBytes(storage.used)}
                    <span className="text-sm font-normal text-[#715c49]">
                      {' '}
                      / {formatBytes(storage.quota)}
                    </span>
                  </p>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#f0e4d7]">
                    <div
                      className="h-full rounded-full bg-[#8a6a4a] transition-all"
                      style={{ width: `${Math.min(storage.percentage, 100)}%` }}
                    />
                  </div>
                </div>
                <div className="rounded-2xl border border-[#e6d9cc] bg-[#fffdfb] p-5">
                  <p className="text-xs font-semibold uppercase tracking-wide text-[#8a6a4a]">
                    Remaining
                  </p>
                  <p className="mt-1 text-2xl font-bold">{formatBytes(storage.remaining)}</p>
                  <p className="mt-2 text-xs text-[#715c49]">{storage.percentage}% used</p>
                </div>
              </>
            )}
          </div>

          {/* QR Code */}
          {qrUrl && (
            <div className="rounded-2xl border border-[#e6d9cc] bg-[#fffdfb] p-6">
              <h2 className="mb-4 font-serif text-xl text-[#2d241e]">QR Code for Guests</h2>
              <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
                <div className="rounded-xl border border-[#e6d9cc] bg-white p-4">
                  <QRCodeSVG value={qrUrl} size={180} />
                </div>
                <div>
                  <p className="text-sm text-[#5c4a3d]">
                    Share this QR code with your guests so they can upload their photos.
                  </p>
                  <p className="mt-2 rounded-lg bg-[#f8f1ea] px-3 py-2 font-mono text-xs text-[#715c49] break-all">
                    {qrUrl}
                  </p>
                  <button
                    onClick={() => navigator.clipboard.writeText(qrUrl)}
                    className="mt-3 rounded-full border border-[#d8c4a8] bg-white px-4 py-2 text-xs font-semibold hover:bg-[#f8f1ea]"
                  >
                    Copy Link
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Media Grid */}
          <div className="rounded-2xl border border-[#e6d9cc] bg-[#fffdfb]">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#e6d9cc] px-5 py-4">
              <h2 className="font-serif text-xl text-[#2d241e]">
                <Image className="mr-2 inline h-5 w-5" />
                Photos ({media.length})
              </h2>
              <div className="flex items-center gap-1 rounded-full border border-[#d8c4a8] bg-white p-1 text-xs font-semibold">
                {['', 'PENDING', 'APPROVED', 'REJECTED'].map((s) => (
                  <button
                    key={s}
                    onClick={() => setStatusFilter(s)}
                    className={`rounded-full px-3 py-1.5 capitalize transition ${
                      statusFilter === s
                        ? 'bg-[#2d241e] text-white'
                        : 'text-[#5c4a3d] hover:bg-[#f8f1ea]'
                    }`}
                  >
                    {s || 'All'}
                  </button>
                ))}
              </div>
            </div>

            {media.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-12 text-center">
                <Camera className="mb-3 h-10 w-10 text-[#c4a882]" />
                <p className="text-sm text-[#715c49]">No photos yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4 p-5 sm:grid-cols-3 lg:grid-cols-4">
                {media.map((item) => (
                  <div
                    key={item.id}
                    className="group relative overflow-hidden rounded-xl border border-[#e6d9cc] bg-white"
                  >
                    <img
                      src={item.url}
                      alt={item.fileName}
                      className="aspect-square w-full object-cover"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/60 to-transparent opacity-0 transition group-hover:opacity-100">
                      <div className="w-full p-3">
                        <p className="truncate text-xs font-semibold text-white">
                          {item.uploaderName}
                        </p>
                        <div className="mt-2 flex gap-1">
                          {item.status !== 'APPROVED' && (
                            <button
                              onClick={() => moderatePhoto(item.id, 'APPROVED')}
                              disabled={actionLoading === item.id}
                              className="rounded-full bg-green-600 p-1.5 text-white hover:bg-green-700"
                              title="Approve"
                            >
                              <Check className="h-3.5 w-3.5" />
                            </button>
                          )}
                          {item.status !== 'REJECTED' && (
                            <button
                              onClick={() => moderatePhoto(item.id, 'REJECTED')}
                              disabled={actionLoading === item.id}
                              className="rounded-full bg-amber-600 p-1.5 text-white hover:bg-amber-700"
                              title="Reject"
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          )}
                          <button
                            onClick={() => deletePhoto(item.id)}
                            disabled={actionLoading === item.id}
                            className="rounded-full bg-red-600 p-1.5 text-white hover:bg-red-700"
                            title="Delete"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="px-3 py-2">
                      <span
                        className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                          item.status === 'APPROVED'
                            ? 'bg-green-100 text-green-700'
                            : item.status === 'REJECTED'
                              ? 'bg-red-100 text-red-700'
                              : 'bg-amber-100 text-amber-700'
                        }`}
                      >
                        {item.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}

export default ManageMemories;
