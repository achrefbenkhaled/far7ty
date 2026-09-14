import { useEffect, useState } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, LoaderCircle } from 'lucide-react';
import { templates } from '../data/templates';
import { getTemplateComponent } from '../templates';
import { invitationPreviewUrl, invitationPublicUrl, manageApi, type ManagedInvitation } from '../lib/manageApi';
import { useManageAuth } from '../context/ManageAuthContext';
import {
  defaultDynamicDataForEvent,
  getEventFieldConfig,
  getEventSchemaForType,
  normalizeEventType,
  type EventType,
} from '../lib/invitationFieldSchemas';

const statuses = ['DRAFT', 'PREVIEW', 'CHANGES_REQUESTED', 'APPROVED', 'PUBLISHED'] as const;

export function RequireManageAuth({ children }: { children: React.ReactNode }) {
  const { ready, authenticated } = useManageAuth();
  if (!ready) return <div className="flex min-h-screen items-center justify-center text-sm text-[#5c4a3d]">Loading manager...</div>;
  return authenticated ? <>{children}</> : <Navigate to="/manage/login" replace />;
}

export function ManageLogin() {
  const { authenticated, login } = useManageAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  if (authenticated) return <Navigate to="/manage" replace />;

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    try {
      await login(username, password);
      navigate('/manage', { replace: true });
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Unable to sign in');
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f7f3ee] px-4">
      <form onSubmit={submit} className="w-full max-w-md rounded-3xl border border-[#e6d9cc] bg-[#fffdf9] p-8 shadow-[0_24px_70px_rgba(92,74,61,0.1)]">
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#8a6a4a]">Private area</p>
        <h1 className="mt-3 font-serif text-4xl">Owner sign in</h1>
        <p className="mt-3 text-sm leading-6 text-[#5c4a3d]">This area is only for managing Invly invitations.</p>
        <div className="mt-7 space-y-4">
          <label className="block text-sm font-semibold">
            Username
            <input required value={username} onChange={(event) => setUsername(event.target.value)} className="mt-2 w-full rounded-xl border border-[#e6d9cc] px-4 py-3 font-normal outline-none focus:border-[#8a6a4a]" />
          </label>
          <label className="block text-sm font-semibold">
            Password
            <input required type="password" value={password} onChange={(event) => setPassword(event.target.value)} className="mt-2 w-full rounded-xl border border-[#e6d9cc] px-4 py-3 font-normal outline-none focus:border-[#8a6a4a]" />
          </label>
          {error && <p className="text-sm text-red-700">{error}</p>}
          <button className="w-full rounded-full bg-[#2d241e] px-5 py-3 font-semibold text-white">Sign in</button>
        </div>
      </form>
    </main>
  );
}

export function ManageDashboard() {
  const [invitations, setInvitations] = useState<ManagedInvitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = () =>
    manageApi.list()
      .then((result) => setInvitations(result.invitations))
      .catch((reason) => setError(reason instanceof Error ? reason.message : 'Unable to load invitations'))
      .finally(() => setLoading(false));

  useEffect(() => {
    void load();
  }, []);

  const update = async (action: 'publish' | 'unpublish' | 'remove', invitation: ManagedInvitation) => {
    if (action === 'remove' && !window.confirm('Delete this invitation?')) return;
    if (action === 'remove') await manageApi.remove(invitation.id);
    else if (action === 'publish') await manageApi.publish(invitation.id);
    else await manageApi.unpublish(invitation.id);
    await load();
  };

  const count = (status: string) => invitations.filter((invitation) => invitation.status === status).length;

  return (
    <main className="mx-auto max-w-7xl px-5 py-10 lg:px-8">
      <div className="flex flex-wrap items-end justify-between gap-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#8a6a4a]">Private workspace</p>
          <h1 className="mt-3 font-serif text-5xl">Invitation manager</h1>
        </div>
        <Link to="/manage/invitations/new" className="rounded-full bg-[#2d241e] px-5 py-3 text-sm font-semibold text-white">Create invitation</Link>
      </div>

      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {statuses.map((status) => (
          <div key={status} className="rounded-2xl border border-[#e6d9cc] bg-[#fffdfb] p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-[#8a6a4a]">{status.replace('_', ' ')}</p>
            <p className="mt-3 text-3xl font-bold">{count(status)}</p>
          </div>
        ))}
      </div>

      <section className="mt-10 overflow-hidden rounded-2xl border border-[#e6d9cc] bg-[#fffdfb]">
        <div className="border-b border-[#e6d9cc] px-5 py-4">
          <h2 className="font-serif text-2xl">Recent invitations</h2>
        </div>

        {loading ? (
          <div className="flex items-center gap-2 p-6 text-sm"><LoaderCircle className="h-4 w-4 animate-spin" />Loading...</div>
        ) : error ? (
          <p className="p-6 text-sm text-red-700">{error}</p>
        ) : invitations.length === 0 ? (
          <p className="p-6 text-sm text-[#5c4a3d]">No invitations yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1100px] text-left text-sm">
              <thead className="bg-[#f8f1ea] text-xs uppercase tracking-wide text-[#715c49]">
                <tr>
                  <th className="px-5 py-3">Client</th>
                  <th className="px-5 py-3">Couple / event</th>
                  <th className="px-5 py-3">Template</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Updated</th>
                  <th className="px-5 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {invitations.map((invitation) => {
                  const previewUrl = invitationPreviewUrl(invitation);
                  const publicUrl = invitationPublicUrl(invitation);
                  return (
                    <tr key={invitation.id} className="border-t border-[#eee2d8]">
                      <td className="px-5 py-4">
                        <p className="font-semibold">{invitation.clientName}</p>
                        <p className="text-[#715c49]">{invitation.clientPhone}</p>
                      </td>
                      <td className="px-5 py-4">
                        <p className="font-semibold">{invitation.eventType}</p>
                        <p className="text-[#715c49]">{invitation.slug}</p>
                      </td>
                      <td className="px-5 py-4">{invitation.templateId}</td>
                      <td className="px-5 py-4"><span className="rounded-full bg-[#f8f1ea] px-2 py-1 text-xs font-semibold text-[#715c49]">{invitation.status}</span></td>
                      <td className="px-5 py-4">{new Date(invitation.updatedAt).toLocaleDateString()}</td>
                      <td className="px-5 py-4">
                        <div className="flex flex-wrap gap-2">
                          <Link to={`/manage/invitations/${invitation.id}/preview`} className="rounded-full border border-[#d8c4a8] bg-white px-3 py-1.5 text-xs font-semibold">Preview</Link>
                          <Link to={`/manage/invitations/${invitation.id}/edit`} className="rounded-full border border-[#d8c4a8] bg-white px-3 py-1.5 text-xs font-semibold">Edit</Link>
                          <button type="button" onClick={() => navigator.clipboard.writeText(previewUrl)} className="rounded-full border border-[#d8c4a8] bg-white px-3 py-1.5 text-xs font-semibold">Copy</button>
                          <a href={publicUrl} target="_blank" rel="noreferrer" className="rounded-full border border-[#d8c4a8] bg-white px-3 py-1.5 text-xs font-semibold">Public</a>
                          <button type="button" onClick={() => update('publish', invitation)} className="rounded-full bg-[#2d241e] px-3 py-1.5 text-xs font-semibold text-white">Publish</button>
                          <button type="button" onClick={() => update('remove', invitation)} className="rounded-full bg-red-600 px-3 py-1.5 text-xs font-semibold text-white">Delete</button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}

export function ManageInvitationForm() {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const editing = Boolean(id);

  const [templateId, setTemplateId] = useState(templates[0].id);
  const [status, setStatus] = useState<ManagedInvitation['status']>('DRAFT');
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [eventType, setEventType] = useState<EventType>('wedding');
  const [data, setData] = useState<Record<string, unknown>>(() => defaultDynamicDataForEvent('wedding'));
  const [slug, setSlug] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(editing);

  const normalizedEventType = normalizeEventType(eventType);
  const dynamicFieldConfig = getEventFieldConfig(normalizedEventType);

  useEffect(() => {
    if (!editing) {
      setData((current) => ({ ...defaultDynamicDataForEvent(normalizedEventType), ...current }));
    }
  }, [normalizedEventType, editing]);

  useEffect(() => {
    if (!id) return;
    manageApi.get(id)
      .then(({ invitation }) => {
        setTemplateId(invitation.templateId);
        setStatus(invitation.status);
        setClientName(invitation.clientName);
        setClientPhone(invitation.clientPhone);
        setClientEmail(invitation.clientEmail ?? '');
        setEventType(normalizeEventType(invitation.eventType));
        setSlug(invitation.slug);
        setData({ ...defaultDynamicDataForEvent(normalizeEventType(invitation.eventType)), ...invitation.data });
      })
      .catch((reason) => setError(reason instanceof Error ? reason.message : 'Unable to load invitation'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleTemplateChange = (nextTemplateId: string) => {
    setTemplateId(nextTemplateId);
    let nextEventType: EventType = 'wedding';
    if (nextTemplateId === 'magic-birthday' || nextTemplateId === 'modern-bloom') nextEventType = 'birthday';
    else if (nextTemplateId === 'corporate-luxe') nextEventType = 'business';
    else if (nextTemplateId === 'midnight-gala') nextEventType = 'gala';
    else nextEventType = 'wedding';

    setEventType(nextEventType);
    if (!editing) {
      setData(defaultDynamicDataForEvent(nextEventType));
    }
  };

  const setField = (field: string, value: string | string[] | Record<string, unknown> | number | boolean | null | undefined) => {
    setData((current) => ({ ...current, [field]: value }));
  };

  const updateRepeatableItem = (fieldKey: string, index: number, itemKey: string, value: string) => {
    setData((current) => {
      const items = Array.isArray(current[fieldKey]) ? [...(current[fieldKey] as Array<Record<string, string>>)] : [];
      const nextItem = { ...(items[index] ?? {}), [itemKey]: value };
      items[index] = nextItem;
      return { ...current, [fieldKey]: items };
    });
  };

  const addRepeatableItem = (fieldKey: string, itemFields: Array<{ key: string }>) => {
    setData((current) => {
      const items = Array.isArray(current[fieldKey]) ? [...(current[fieldKey] as Array<Record<string, string>>)] : [];
      const defaults: Record<string, string> = {};
      itemFields.forEach((itemField) => {
        defaults[itemField.key] = '';
      });
      items.push(defaults);
      return { ...current, [fieldKey]: items };
    });
  };

  const removeRepeatableItem = (fieldKey: string, index: number) => {
    setData((current) => {
      const items = Array.isArray(current[fieldKey]) ? [...(current[fieldKey] as Array<Record<string, string>>)] : [];
      items.splice(index, 1);
      return { ...current, [fieldKey]: items };
    });
  };

  const validateDynamicData = () => {
    const schema = getEventSchemaForType(normalizedEventType);
    const parsed = schema.safeParse(data);
    if (!parsed.success) {
      setError(parsed.error.issues.map((issue) => issue.message).join(', '));
      return false;
    }
    return true;
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');

    if (!validateDynamicData()) {
      return;
    }

    try {
      const payload = {
        slug: slug || undefined,
        templateId,
        status,
        clientName,
        clientPhone,
        clientEmail,
        eventType: normalizedEventType,
        data,
      };

      const result = editing
        ? await manageApi.update(id!, payload)
        : await manageApi.create(payload as Omit<ManagedInvitation, 'id' | 'createdAt' | 'updatedAt' | 'publishedAt' | 'previewToken'>);

      navigate(`/manage/invitations/${result.invitation.id}/preview`);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Unable to save invitation');
    }
  };

  if (loading) return <main className="p-10 text-center font-sans text-sm text-[#5c4a3d]">Loading invitation data...</main>;

  const sections = [
    { id: 'main', title: 'Event Details & Names', desc: 'Primary names, date, time, and greeting message' },
    { id: 'venue', title: 'Venue & Location', desc: 'Place name, address, and Google Maps directions link' },
    { id: 'schedule', title: 'Programme & Schedule (Events)', desc: 'Add, remove, and edit event timeline items' },
    { id: 'wishes', title: 'Pre-filled Wishes & Guestbook', desc: 'Customize initial messages and heartfelt greetings' },
    { id: 'story', title: 'Love Story / Milestones', desc: 'Relationship timeline milestones' },
    { id: 'gallery', title: 'Gallery Photos', desc: 'Add image URLs for the event showcase' },
    { id: 'rsvp', title: 'WhatsApp RSVP & Settings', desc: 'Direct WhatsApp phone number for guest confirmations' },
  ];

  return (
    <main className="mx-auto max-w-5xl px-5 py-10 lg:px-8 font-sans">
      <Link to="/manage" className="inline-flex items-center gap-2 text-sm font-semibold text-[#5c4a3d] hover:text-[#2d241e]">
        <ArrowLeft className="h-4 w-4" /> Back to dashboard
      </Link>
      <h1 className="mt-8 font-serif text-4xl sm:text-5xl text-[#2d241e]">
        {editing ? 'Edit invitation' : 'Create invitation'}
      </h1>
      <p className="mt-2 text-sm text-[#715c49]">
        Customize all details, schedule events, venue address, guestbook wishes, and WhatsApp RSVP settings.
      </p>

      <form onSubmit={submit} className="mt-8 space-y-8">
        {/* Client & Status Section */}
        <section className="rounded-3xl border border-[#e6d9cc] bg-[#fffdfb] p-6 shadow-sm">
          <div className="border-b border-[#f0e4d7] pb-3">
            <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#8a6a4a]">Step 1</p>
            <h2 className="font-serif text-2xl text-[#2d241e]">Client & Status</h2>
          </div>
          <div className="mt-5 grid gap-4 sm:grid-cols-3">
            <Field label="Client name" value={clientName} onChange={setClientName} required />
            <Field label="Client WhatsApp / Phone" value={clientPhone} onChange={setClientPhone} required />
            <Field label="Client Email (optional)" value={clientEmail} onChange={setClientEmail} />
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="block text-sm font-semibold text-[#2d241e]">
              Status
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ManagedInvitation['status'])}
                className="mt-2 w-full rounded-xl border border-[#e6d9cc] bg-white px-4 py-3 font-normal outline-none focus:border-[#8a6a4a]"
              >
                {statuses.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </label>
            <label className="block text-sm font-semibold text-[#2d241e]">
              Custom URL Slug (optional)
              <input
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="e.g. emma-james-2028"
                className="mt-2 w-full rounded-xl border border-[#e6d9cc] bg-white px-4 py-3 font-normal outline-none focus:border-[#8a6a4a]"
              />
            </label>
          </div>
        </section>

        {/* Template & Category Selector */}
        <section className="rounded-3xl border border-[#e6d9cc] bg-[#fffdfb] p-6 shadow-sm">
          <div className="border-b border-[#f0e4d7] pb-3">
            <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#8a6a4a]">Step 2</p>
            <h2 className="font-serif text-2xl text-[#2d241e]">Template & Event Category</h2>
          </div>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <label className="block text-sm font-semibold text-[#2d241e]">
              Template Design
              <select
                value={templateId}
                onChange={(event) => handleTemplateChange(event.target.value)}
                className="mt-2 w-full rounded-xl border border-[#e6d9cc] bg-white px-4 py-3 font-normal outline-none focus:border-[#8a6a4a]"
              >
                {templates.map((template) => (
                  <option key={template.id} value={template.id}>
                    {template.title} ({template.category})
                  </option>
                ))}
              </select>
            </label>

            <label className="block text-sm font-semibold text-[#2d241e]">
              Event Category
              <select
                value={eventType}
                onChange={(event) => setEventType(event.target.value as EventType)}
                className="mt-2 w-full rounded-xl border border-[#e6d9cc] bg-white px-4 py-3 font-normal outline-none focus:border-[#8a6a4a]"
              >
                <option value="wedding">Wedding (Mariage / زفاف)</option>
                <option value="birthday">Birthday (Anniversaire / عيد ميلاد)</option>
                <option value="business">Business / Conference (Entreprise)</option>
                <option value="gala">Gala / Evening Celebration (Soirée)</option>
                <option value="custom">Custom (Personnalisé)</option>
              </select>
            </label>
          </div>
        </section>

        {/* Dynamic Grouped Sections for Template Details */}
        {sections.map((section) => {
          const sectionFields = dynamicFieldConfig.fields.filter((f) => (f.section || 'main') === section.id);
          if (sectionFields.length === 0) return null;

          return (
            <section key={section.id} className="rounded-3xl border border-[#e6d9cc] bg-[#fffdfb] p-6 shadow-sm">
              <div className="border-b border-[#f0e4d7] pb-3">
                <h2 className="font-serif text-2xl text-[#2d241e]">{section.title}</h2>
                <p className="mt-1 text-xs text-[#715c49]">{section.desc}</p>
              </div>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                {sectionFields.map((field) => {
                  const value = data[field.key] ?? '';

                  if (field.type === 'repeatable-list') {
                    const repeatableField = field as Extract<typeof field, { type: 'repeatable-list' }>;
                    const listItems = Array.isArray(value) ? (value as Array<Record<string, unknown>>) : [];

                    return (
                      <div key={field.key} className="sm:col-span-2">
                        <div className="mb-3 flex items-center justify-between">
                          <p className="text-sm font-bold text-[#2d241e]">{repeatableField.label}</p>
                          <button
                            type="button"
                            onClick={() => addRepeatableItem(repeatableField.key, repeatableField.itemFields)}
                            className="rounded-full border border-[#d8c4a8] bg-[#f7efe7] px-4 py-2 text-xs font-bold text-[#2d241e] hover:bg-[#ebdccb] transition"
                          >
                            ➕ Add item
                          </button>
                        </div>

                        <div className="space-y-3">
                          {listItems.length === 0 ? (
                            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#e6d9cc] bg-[#faf6f1] p-6 text-center">
                              <p className="text-sm font-medium text-[#715c49]">No items in this list yet.</p>
                              <button
                                type="button"
                                onClick={() => addRepeatableItem(repeatableField.key, repeatableField.itemFields)}
                                className="mt-2 text-xs font-bold text-[#8a6a4a] hover:underline"
                              >
                                Click here to add the first item
                              </button>
                            </div>
                          ) : (
                            listItems.map((item, index) => (
                              <div key={`${repeatableField.key}-${index}`} className="rounded-2xl border border-[#e6d9cc] bg-white p-4 shadow-sm">
                                <div className="mb-3 flex items-center justify-between border-b border-[#f5efe8] pb-2">
                                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#8a6a4a]">
                                    {repeatableField.label} #{index + 1}
                                  </p>
                                  <button
                                    type="button"
                                    onClick={() => removeRepeatableItem(repeatableField.key, index)}
                                    className="rounded-lg bg-red-50 px-2.5 py-1 text-xs font-bold text-red-600 hover:bg-red-100 transition"
                                  >
                                    Remove
                                  </button>
                                </div>

                                <div className="grid gap-3 sm:grid-cols-2">
                                  {repeatableField.itemFields.map((itemField) => (
                                    <label
                                      key={`${repeatableField.key}-${index}-${itemField.key}`}
                                      className={`block text-xs font-semibold text-[#2d241e] ${itemField.type === 'textarea' ? 'sm:col-span-2' : ''}`}
                                    >
                                      {itemField.label}
                                      {itemField.type === 'textarea' ? (
                                        <textarea
                                          rows={2}
                                          value={String((item[itemField.key] as string | undefined) ?? '')}
                                          onChange={(event) => updateRepeatableItem(repeatableField.key, index, itemField.key, event.target.value)}
                                          placeholder={itemField.placeholder}
                                          className="mt-1.5 w-full rounded-xl border border-[#e6d9cc] bg-[#fcfbf9] px-3.5 py-2.5 text-xs font-normal outline-none focus:border-[#8a6a4a]"
                                        />
                                      ) : (
                                        <input
                                          type={itemField.type === 'time' ? 'text' : itemField.type === 'date' ? 'date' : 'text'}
                                          value={String((item[itemField.key] as string | undefined) ?? '')}
                                          onChange={(event) => updateRepeatableItem(repeatableField.key, index, itemField.key, event.target.value)}
                                          placeholder={itemField.placeholder}
                                          className="mt-1.5 w-full rounded-xl border border-[#e6d9cc] bg-[#fcfbf9] px-3.5 py-2.5 text-xs font-normal outline-none focus:border-[#8a6a4a]"
                                        />
                                      )}
                                    </label>
                                  ))}
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    );
                  }

                  if (field.type === 'select') {
                    const selectField = field as typeof field & { options: Array<{ label: string; value: string }> };
                    return (
                      <label key={field.key} className="block text-sm font-semibold text-[#2d241e]">
                        {field.label}
                        <select
                          value={String(value ?? selectField.options[0]?.value ?? '')}
                          onChange={(event) => setField(field.key, event.target.value)}
                          className="mt-2 w-full rounded-xl border border-[#e6d9cc] bg-white px-4 py-3 font-normal outline-none focus:border-[#8a6a4a]"
                        >
                          {selectField.options.map((option) => (
                            <option key={option.value} value={option.value}>{option.label}</option>
                          ))}
                        </select>
                      </label>
                    );
                  }

                  if (field.type === 'textarea') {
                    return (
                      <label key={field.key} className="block text-sm font-semibold text-[#2d241e] sm:col-span-2">
                        {field.label}
                        <textarea
                          rows={3}
                          value={String(value ?? '')}
                          onChange={(event) => setField(field.key, event.target.value)}
                          placeholder={field.placeholder}
                          className="mt-2 w-full rounded-xl border border-[#e6d9cc] bg-white px-4 py-3 font-normal outline-none focus:border-[#8a6a4a]"
                        />
                        {field.helperText && <span className="mt-1 block text-xs text-[#715c49]">{field.helperText}</span>}
                      </label>
                    );
                  }

                  if (field.type === 'image') {
                    return (
                      <label key={field.key} className="block text-sm font-semibold text-[#2d241e] sm:col-span-2">
                        {field.label}
                        <textarea
                          value={Array.isArray(value) ? value.join('\n') : String(value ?? '')}
                          onChange={(event) => setField(field.key, event.target.value.split('\n').map((line) => line.trim()).filter(Boolean))}
                          className="mt-2 min-h-[100px] w-full rounded-xl border border-[#e6d9cc] bg-white px-4 py-3 font-normal outline-none focus:border-[#8a6a4a]"
                          placeholder="https://images.unsplash.com/photo-1.jpg&#10;https://images.unsplash.com/photo-2.jpg"
                        />
                        {field.helperText && <span className="mt-1 block text-xs text-[#715c49]">{field.helperText}</span>}
                      </label>
                    );
                  }

                  return (
                    <label key={field.key} className="block text-sm font-semibold text-[#2d241e]">
                      {field.label}
                      <input
                        type={field.type === 'date' ? 'date' : field.type === 'url' ? 'url' : 'text'}
                        value={String(value ?? '')}
                        onChange={(event) => setField(field.key, event.target.value)}
                        required={Boolean(field.required)}
                        className="mt-2 w-full rounded-xl border border-[#e6d9cc] bg-white px-4 py-3 font-normal outline-none focus:border-[#8a6a4a]"
                        placeholder={field.placeholder}
                      />
                      {field.helperText && <span className="mt-1 block text-xs text-[#715c49]">{field.helperText}</span>}
                    </label>
                  );
                })}
              </div>
            </section>
          );
        })}

        {error && (
          <div className="rounded-2xl bg-red-50 border border-red-200 p-4 text-sm font-medium text-red-700">
            {error}
          </div>
        )}

        <div className="flex justify-end gap-3 pt-4">
          <Link
            to="/manage"
            className="rounded-full border border-[#d8c4a8] bg-white px-6 py-3 text-sm font-semibold text-[#2d241e] hover:bg-[#f8f1ea] transition"
          >
            Cancel
          </Link>
          <button
            type="submit"
            className="rounded-full bg-[#2d241e] px-8 py-3 text-sm font-semibold text-white shadow-md hover:bg-[#453a33] transition"
          >
            {editing ? 'Save changes' : 'Create & preview invitation'}
          </button>
        </div>
      </form>
    </main>
  );
}

function Field({ label, value, onChange, required = false }: { label: string; value: string; onChange: (value: string) => void; required?: boolean }) {
  return (
    <label className="block text-sm font-semibold text-[#2d241e]">
      {label}
      <input
        required={required}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 w-full rounded-xl border border-[#e6d9cc] bg-white px-4 py-3 font-normal outline-none focus:border-[#8a6a4a]"
      />
    </label>
  );
}

export function ManageInvitationPreview() {
  const { id } = useParams<{ id: string }>();
  const [invitation, setInvitation] = useState<ManagedInvitation | null>(null);
  const [error, setError] = useState('');
  const [deviceView, setDeviceView] = useState<'desktop' | 'tablet' | 'phone'>('desktop');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!id) return;
    manageApi.get(id)
      .then(({ invitation: loaded }) => setInvitation(loaded))
      .catch((reason) => setError(reason instanceof Error ? reason.message : 'Unable to load preview'));
  }, [id]);

  if (error) return <main className="p-10 text-red-700">{error}</main>;
  if (!invitation) return <main className="p-10">Loading preview...</main>;

  const Template = getTemplateComponent(invitation.templateId);
  const previewUrl = invitationPreviewUrl(invitation);

  const handleCopy = () => {
    navigator.clipboard.writeText(previewUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <main className="min-h-screen bg-[#f7f3ee] px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <Link to="/manage" className="inline-flex items-center gap-2 text-sm font-semibold">
            <ArrowLeft className="h-4 w-4" />
            Dashboard
          </Link>

          {/* Device Switcher */}
          <div className="flex items-center gap-1 rounded-full border border-[#d8c4a8] bg-white p-1 text-xs font-semibold">
            {(['desktop', 'tablet', 'phone'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setDeviceView(mode)}
                className={`rounded-full px-3 py-1.5 capitalize transition ${deviceView === mode ? 'bg-[#2d241e] text-white' : 'text-[#5c4a3d] hover:bg-[#f8f1ea]'}`}
              >
                {mode}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Link to={`/manage/invitations/${id}/edit`} className="inline-flex items-center gap-2 rounded-full border border-[#d8c4a8] bg-white px-4 py-2 text-sm font-semibold hover:bg-[#f8f1ea]">
              Edit
            </Link>
            <a
              href={previewUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-[#2d241e] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#453a33]"
            >
              Open full screen
            </a>
            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-2 rounded-full border border-[#d8c4a8] bg-white px-4 py-2 text-sm font-semibold hover:bg-[#f8f1ea]"
            >
              {copied ? 'Link copied!' : 'Copy preview link'}
            </button>
          </div>
        </div>

        {/* Responsive Frame Container */}
        <div className="mx-auto flex justify-center transition-all duration-300">
          <div
            className={`w-full overflow-hidden rounded-[2rem] border-[8px] border-[#2c2420] bg-white shadow-[0_35px_90px_rgba(44,36,32,0.25)] transition-all duration-300 ${
              deviceView === 'phone'
                ? 'max-w-[420px]'
                : deviceView === 'tablet'
                ? 'max-w-[768px]'
                : 'max-w-5xl'
            }`}
          >
            <div className="max-h-[82vh] overflow-y-auto bg-white">
              <Template preview={deviceView === 'phone'} invitationData={invitation.data} />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export function PublicInvitationPage() {
  const { slug } = useParams<{ slug: string }>();
  const [invitation, setInvitation] = useState<{ templateId: string; data: Record<string, unknown> } | null>(null);
  const isDirectTemplate = Boolean(slug && templates.some((template) => template.id === slug));
  const [loading, setLoading] = useState(!isDirectTemplate);
  const [error, setError] = useState('');

  const searchParams = new URLSearchParams(window.location.search);
  const isPreview = searchParams.get('preview') === '1';

  useEffect(() => {
    if (!slug || isDirectTemplate) return;
    const queryParams = window.location.search;
    fetch(`${import.meta.env.VITE_API_URL ?? 'http://localhost:4000'}/api/invitations/${encodeURIComponent(slug)}${queryParams}`)
      .then(async (response) => {
        if (!response.ok) throw new Error('Invitation not found');
        return response.json() as Promise<{ invitation: { templateId: string; data: Record<string, unknown> } }>;
      })
      .then((payload) => setInvitation(payload.invitation))
      .catch((reason) => setError(reason instanceof Error ? reason.message : 'Unable to load invitation'))
      .finally(() => setLoading(false));
  }, [slug, isDirectTemplate]);

  if (isDirectTemplate && slug) {
    const Template = getTemplateComponent(slug);
    return (
      <div className="min-h-screen w-full">
        <Template preview={isPreview} />
      </div>
    );
  }

  if (loading) return <main className="flex min-h-screen items-center justify-center text-sm text-[#5c4a3d]">Loading invitation...</main>;
  if (error || !invitation) {
    const LegacyTemplate = slug && templates.some((template) => template.id === slug) ? getTemplateComponent(slug) : null;
    return LegacyTemplate ? (
      <div className="min-h-screen w-full">
        <LegacyTemplate preview={isPreview} />
      </div>
    ) : (
      <main className="flex min-h-screen items-center justify-center text-sm text-red-700">{error || 'Invitation not found'}</main>
    );
  }

  const Template = getTemplateComponent(invitation.templateId);
  return (
    <div className="min-h-screen w-full">
      <Template invitationData={invitation.data} preview={isPreview} />
    </div>
  );
}
