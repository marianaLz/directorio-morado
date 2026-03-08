import { useMemo, useState, useEffect } from 'react';
import Fuse from 'fuse.js';
import type { DirectoryEntry } from '../../types/directory';
import { TYPE_TAG_CONFIG } from '../../lib/tagConfig';

const SUPPORT_TYPES = [
  'crisis hotline',
  'abortion accompaniment',
  'psychological support',
  'legal support',
  'community support',
  'sexual violence support',
  'reproductive rights',
  'sexual health',
  'financial support',
  'government services',
  'nutrition support',
  'medical and health',
  'associations and foundations',
] as const;

const COST_OPTIONS: { value: 'free' | 'low cost' | 'variable' | 'consult directly'; label: string; icon: string }[] = [
  { value: 'free', label: 'Gratuito', icon: '🆓' },
  { value: 'low cost', label: 'Bajo costo', icon: '💵' },
  { value: 'variable', label: 'Variable', icon: '📊' },
  { value: 'consult directly', label: 'Consultar', icon: '💬' },
];

const ONLINE_OPTIONS: { value: 'online' | 'inperson'; label: string; icon: string }[] = [
  { value: 'online', label: 'En línea', icon: '🌐' },
  { value: 'inperson', label: 'Presencial', icon: '📍' },
];

interface Props {
  entries: DirectoryEntry[];
  /** Id of the section that contains the static card list. This component only toggles visibility. */
  staticEntriesContainerId: string;
}

const FUSE_OPTIONS = {
  keys: [
    { name: 'name', weight: 0.35 },
    { name: 'city', weight: 0.2 },
    { name: 'state', weight: 0.2 },
    { name: 'country', weight: 0.1 },
    { name: 'description', weight: 0.2 },
    { name: 'type', weight: 0.15 },
  ],
  threshold: 0.4,
  includeScore: false,
};

type SupportType = (typeof SUPPORT_TYPES)[number];
const VALID_TYPES = new Set<SupportType>(SUPPORT_TYPES);

function getInitialTypesFromUrl(): SupportType[] {
  if (typeof window === 'undefined') return [];
  const params = new URLSearchParams(window.location.search);
  const tipos = params.getAll('tipo').map((t) => t.trim()).filter(Boolean);
  return tipos.filter((t): t is SupportType => VALID_TYPES.has(t as SupportType));
}

export default function DirectoryFilters({ entries, staticEntriesContainerId }: Props) {
  const [search, setSearch] = useState('');
  const [country, setCountry] = useState<string>('');
  const [types, setTypes] = useState<SupportType[]>(getInitialTypesFromUrl);
  const [cost, setCost] = useState<'free' | 'low cost' | 'variable' | 'consult directly' | ''>('');
  const [online, setOnline] = useState<'online' | 'inperson' | ''>('');

  const countries = useMemo(() => {
    const set = new Set(entries.map((e) => e.country).filter(Boolean));
    return Array.from(set).sort();
  }, [entries]);

  const filtered = useMemo(() => {
    let list = entries;
    if (country) list = list.filter((e) => e.country === country);
    if (types.length > 0) list = list.filter((e) => types.some((t) => e.type.includes(t)));
    if (cost) list = list.filter((e) => e.cost === cost);
    if (online === 'online') list = list.filter((e) => e.online);
    if (online === 'inperson') list = list.filter((e) => !e.online);

    const q = search.trim();
    if (!q) return list;
    const fuse = new Fuse(list, FUSE_OPTIONS);
    const results = fuse.search(q);
    return results.map((r) => r.item);
  }, [entries, search, country, types, cost, online]);

  const filteredIds = useMemo(() => new Set(filtered.map((e) => e.id)), [filtered]);

  useEffect(() => {
    if (!staticEntriesContainerId) return;
    const container = document.getElementById(staticEntriesContainerId);
    if (!container) return;
    container.querySelectorAll('[data-entry-id]').forEach((el) => {
      const id = el.getAttribute('data-entry-id');
      const visible = id ? filteredIds.has(id) : true;
      el.toggleAttribute('hidden', !visible);
      el.setAttribute('aria-hidden', visible ? 'false' : 'true');
    });
  }, [staticEntriesContainerId, filteredIds]);

  const toggleType = (t: SupportType) => {
    setTypes((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]));
  };

  const toggleCost = (value: (typeof COST_OPTIONS)[number]['value']) => {
    setCost((prev) => (prev === value ? '' : value));
  };

  const toggleOnline = (value: 'online' | 'inperson') => {
    setOnline((prev) => (prev === value ? '' : value));
  };

  const clearFilters = () => {
    setSearch('');
    setCountry('');
    setTypes([]);
    setCost('');
    setOnline('');
  };

  const hasActiveFilters =
    search.trim() !== '' || country !== '' || types.length > 0 || cost !== '' || online !== '';

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] p-4 shadow-[0_4px_12px_rgba(0,0,0,0.08)]">
        {/* Search + País en una fila */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
          <label htmlFor="directory-search" className="sr-only">
            Buscar por nombre, ciudad o tipo de apoyo
          </label>
          <input
            id="directory-search"
            type="search"
            placeholder="Buscar por tipo de apoyo, ciudad o organización..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="min-h-[44px] flex-1 rounded-xl border border-[var(--card-border)] bg-white px-4 py-2.5 text-base text-[var(--card-text)] placeholder-[var(--card-text-muted)] focus:border-[var(--brand-purple-accent)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-purple-accent)] focus:ring-offset-2"
            aria-describedby="search-hint"
            autoComplete="off"
          />
          <div className="flex items-center gap-3">
            <label htmlFor="filter-country" className="text-sm font-medium text-[var(--card-text-muted)] shrink-0">
              País
            </label>
            <select
              id="filter-country"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="min-h-[44px] w-full rounded-xl border border-[var(--card-border)] bg-white px-3 py-2.5 text-base text-[var(--card-text)] focus:border-[var(--brand-purple-accent)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-purple-accent)] sm:w-auto sm:min-w-[140px]"
            >
              <option value="">Todos</option>
              {countries.map((c) => (
                <option key={c} value={c}>
                  {c === 'Mexico' ? 'México' : c}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Tipo de apoyo: tags como en las tarjetas */}
        <div className="mt-4">
          <span className="sr-only">Filtrar por tipo de apoyo</span>
          <div className="flex flex-wrap gap-2">
            {SUPPORT_TYPES.map((t) => {
              const config = TYPE_TAG_CONFIG[t];
              if (!config) return null;
              const selected = types.includes(t);
              return (
                <button
                  key={t}
                  type="button"
                  onClick={(e) => {
                    toggleType(t);
                    (e.currentTarget as HTMLButtonElement).blur();
                  }}
                  className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1.5 text-xs font-medium transition-all focus:outline-none focus:ring-2 focus:ring-[var(--brand-purple-accent)] focus:ring-offset-2 ${config.bgClass} ${config.textClass} ${selected ? 'ring-2 ring-[var(--brand-purple-accent)] ring-offset-2' : 'opacity-90 hover:opacity-100'}`}
                  aria-pressed={selected}
                  aria-label={selected ? `Quitar filtro ${config.label}` : `Filtrar por ${config.label}`}
                >
                  <span aria-hidden>{config.icon}</span>
                  {config.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Costo */}
        <div className="mt-3">
          <span className="sr-only">Filtrar por costo</span>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-[var(--card-text-muted)] shrink-0">Costo:</span>
            {COST_OPTIONS.map((opt) => {
              const selected = cost === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={(e) => {
                    toggleCost(opt.value);
                    (e.currentTarget as HTMLButtonElement).blur();
                  }}
                  className={`inline-flex items-center gap-1.5 rounded-full bg-[var(--tag-government-bg)] px-2.5 py-1.5 text-xs font-medium text-[var(--tag-government-text)] transition-all focus:outline-none focus:ring-2 focus:ring-[var(--brand-purple-accent)] focus:ring-offset-2 ${selected ? 'ring-2 ring-[var(--brand-purple-accent)] ring-offset-2' : 'opacity-80 hover:opacity-100'}`}
                  aria-pressed={selected}
                  aria-label={selected ? `Quitar filtro ${opt.label}` : `Filtrar por ${opt.label}`}
                >
                  <span aria-hidden>{opt.icon}</span>
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Modalidad: En línea / Presencial */}
        <div className="mt-2">
          <span className="sr-only">Filtrar por modalidad</span>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-[var(--card-text-muted)] shrink-0">Modalidad:</span>
            {ONLINE_OPTIONS.map((opt) => {
              const selected = online === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={(e) => {
                    toggleOnline(opt.value);
                    (e.currentTarget as HTMLButtonElement).blur();
                  }}
                  className={`inline-flex items-center gap-1.5 rounded-full bg-[var(--tag-general-bg)] px-2.5 py-1.5 text-xs font-medium text-[var(--tag-general-text)] transition-all focus:outline-none focus:ring-2 focus:ring-[var(--brand-purple-accent)] focus:ring-offset-2 ${selected ? 'ring-2 ring-[var(--brand-purple-accent)] ring-offset-2' : 'opacity-80 hover:opacity-100'}`}
                  aria-pressed={selected}
                  aria-label={selected ? `Quitar filtro ${opt.label}` : `Filtrar por ${opt.label}`}
                >
                  <span aria-hidden>{opt.icon}</span>
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Contador + Limpiar */}
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
          <p id="search-hint" className="text-sm text-[var(--card-text-muted)]" role="status">
            {filtered.length} resultado{filtered.length !== 1 ? 's' : ''}.
          </p>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="text-sm font-medium text-[var(--brand-purple-accent)] hover:underline focus:outline-none focus:ring-2 focus:ring-[var(--brand-purple-accent)] focus:ring-offset-2 rounded"
            >
              Limpiar filtros
            </button>
          )}
        </div>
      </div>

      <section className="space-y-4" aria-label="Resultados del directorio">
        {filtered.length === 0 && (
          <p
            className="rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] p-8 text-center text-base text-[var(--card-text-muted)]"
            role="status"
          >
            No encontramos resultados. Prueba otro tipo de apoyo o quita filtros.
          </p>
        )}
      </section>
    </div>
  );
}
