import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { memoriesApi, type EventInfo } from '../lib/memoriesApi';
import { MemoriesSection } from '../components/memories/MemoriesSection';

export function MemoriesPage() {
  const { token } = useParams<{ token: string }>();
  const [event, setEvent] = useState<EventInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) return;
    memoriesApi
      .getEvent(token)
      .then((result) => setEvent(result.event))
      .catch((reason) =>
        setError(reason instanceof Error ? reason.message : 'Unable to load event'),
      )
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#fffdf9] text-sm text-[#5c4a3d]">
        Loading event memories...
      </main>
    );
  }

  if (error || !event || !token) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#fffdf9] text-sm text-red-700">
        {error || 'Event not found'}
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-[#fffdf9]">
      <header className="mx-auto max-w-4xl px-4 pb-4 pt-10 text-center sm:px-6">
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#8a6a4a]">
          {event.eventType}
        </p>
        <h1 className="mt-3 font-serif text-4xl text-[#2d241e] sm:text-5xl">
          {event.clientName}
        </h1>
        <p className="mt-3 text-sm text-[#5c4a3d]">Event Memories</p>
      </header>

      <MemoriesSection memoriesEnabled={event.memoriesEnabled} memoriesToken={token} />
    </div>
  );
}

export default MemoriesPage;
