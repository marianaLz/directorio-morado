import { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import type { DirectoryEntry } from '../../types/directory';
import DirectoryFilters from './DirectoryFilters';
import DirectoryCard from './DirectoryCard';

const DIRECTORY_COLLECTION = 'directory';

function docToEntry(doc: { id: string; data: () => Record<string, unknown> }): DirectoryEntry {
  const data = doc.data();
  const { updatedAt: _, ...rest } = data;
  return {
    id: doc.id,
    ...rest,
    name: (rest.name as string) ?? '',
    location: (rest.location as string) ?? '',
    country: (rest.country as string) ?? '',
    state: (rest.state as string) ?? '',
    city: (rest.city as string) ?? '',
    type: Array.isArray(rest.type) ? (rest.type as DirectoryEntry['type']) : [],
    cost: (rest.cost as DirectoryEntry['cost']) ?? 'consult directly',
    population: Array.isArray(rest.population) ? (rest.population as DirectoryEntry['population']) : [],
    online: Boolean(rest.online),
    inPerson: rest.inPerson === true ? true : (rest.inPerson === false ? false : undefined),
    description: (rest.description as string) ?? '',
  } as DirectoryEntry;
}

export default function DirectoryFromFirestore() {
  const [entries, setEntries] = useState<DirectoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const snap = await getDocs(collection(db, DIRECTORY_COLLECTION));
        if (cancelled) return;
        const list = snap.docs.map((d) => docToEntry({ id: d.id, data: () => d.data() }));
        setEntries(list);
        setError(null);
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : 'Error al cargar el directorio');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div
        className="rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] p-12 text-center text-[var(--card-text-muted)]"
        role="status"
        aria-live="polite"
      >
        Cargando directorio…
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="rounded-xl border border-red-200 bg-red-50 p-6 text-center text-red-800"
        role="alert"
      >
        <p className="font-medium">No se pudo cargar el directorio.</p>
        <p className="mt-1 text-sm">{error}</p>
      </div>
    );
  }

  const sortedEntries = [...entries].sort(
    (a, b) => (b.isEmergency ? 1 : 0) - (a.isEmergency ? 1 : 0)
  );

  return (
    <>
      <DirectoryFilters
        entries={sortedEntries}
        staticEntriesContainerId="directory-entries"
      />
      <section
        id="directory-entries"
        className="mt-8 space-y-6"
        aria-label="Listado de recursos del directorio"
      >
        {sortedEntries.map((entry) => (
          <DirectoryCard key={entry.id} entry={entry} />
        ))}
      </section>
    </>
  );
}
