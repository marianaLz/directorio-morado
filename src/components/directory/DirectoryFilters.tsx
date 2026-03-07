import { useMemo, useState, useEffect } from 'react';
import Fuse from 'fuse.js';
import type { DirectoryEntry } from '../../types/directory';

const SUPPORT_TYPES = [
  'abortion accompaniment',
  'psychological support',
  'legal support',
  'community support',
  'sexual violence support',
  'reproductive rights',
  'sexual health',
  'financial support',
  'government services',
  'crisis hotline',
] as const;

const POPULATION_OPTIONS = [
  'women',
  'girls',
  'survivors of sexual violence',
  'men survivors',
  'general public',
] as const;

const COST_OPTIONS = ['free', 'low cost', 'variable', 'consult directly'] as const;

const TYPE_LABELS: Record<string, string> = {
  'abortion accompaniment': 'Acompañamiento en aborto',
  'psychological support': 'Apoyo psicológico',
  'legal support': 'Apoyo legal',
  'community support': 'Apoyo comunitario',
  'sexual violence support': 'Violencia sexual',
  'reproductive rights': 'Derechos reproductivos',
  'sexual health': 'Salud sexual',
  'financial support': 'Apoyo financiero',
  'government services': 'Servicios gubernamentales',
  'crisis hotline': 'Línea de crisis',
};

const POP_LABELS: Record<string, string> = {
  women: 'Mujeres',
  girls: 'Niñas',
  'survivors of sexual violence': 'Sobrevivientes de violencia sexual',
  'men survivors': 'Hombres sobrevivientes',
  'general public': 'Público general',
};

const COST_LABELS: Record<string, string> = {
  free: 'Gratuito',
  'low cost': 'Bajo costo',
  variable: 'Variable',
  'consult directly': 'Consultar',
};

interface Props {
  entries: DirectoryEntry[];
  /** Id of the section that contains the static card list. This component only toggles visibility. */
  staticEntriesContainerId: string;
}

const FUSE_OPTIONS: Fuse.IFuseOptions<DirectoryEntry> = {
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

export default function DirectoryFilters({ entries, staticEntriesContainerId }: Props) {
  const [search, setSearch] = useState('');
  const [country, setCountry] = useState<string>('');
  const [state, setState] = useState<string>('');
  const [city, setCity] = useState<string>('');
  const [types, setTypes] = useState<string[]>([]);
  const [population, setPopulation] = useState<string[]>([]);
  const [cost, setCost] = useState<string>('');
  const [online, setOnline] = useState<string>(''); // '' | 'online' | 'inperson'

  const countries = useMemo(() => {
    const set = new Set(entries.map((e) => e.country).filter(Boolean));
    return Array.from(set).sort();
  }, [entries]);

  const states = useMemo(() => {
    if (!country) return [];
    const set = new Set(
      entries.filter((e) => e.country === country).map((e) => e.state).filter(Boolean)
    );
    return Array.from(set).sort();
  }, [entries, country]);

  const cities = useMemo(() => {
    if (!state && !country) return [];
    const filtered = country
      ? entries.filter((e) => e.country === country)
      : entries;
    const byState = state ? filtered.filter((e) => e.state === state) : filtered;
    const set = new Set(byState.map((e) => e.city).filter(Boolean));
    return Array.from(set).sort();
  }, [entries, country, state]);

  const filtered = useMemo(() => {
    let list = entries;
    if (country) list = list.filter((e) => e.country === country);
    if (state) list = list.filter((e) => e.state === state);
    if (city) list = list.filter((e) => e.city === city);
    if (types.length > 0) list = list.filter((e) => types.some((t) => e.type.includes(t)));
    if (population.length > 0) list = list.filter((e) => population.some((p) => e.population.includes(p)));
    if (cost) list = list.filter((e) => e.cost === cost);
    if (online === 'online') list = list.filter((e) => e.online);
    if (online === 'inperson') list = list.filter((e) => !e.online);

    const q = search.trim();
    if (!q) return list;
    const fuse = new Fuse(list, FUSE_OPTIONS);
    const results = fuse.search(q);
    return results.map((r) => r.item);
  }, [entries, search, country, state, city, types, population, cost, online]);

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

  const toggleType = (t: string) => {
    setTypes((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]));
  };
  const togglePopulation = (p: string) => {
    setPopulation((prev) => (prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]));
  };

  const clearFilters = () => {
    setSearch('');
    setCountry('');
    setState('');
    setCity('');
    setTypes([]);
    setPopulation([]);
    setCost('');
    setOnline('');
  };

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] p-4 shadow-[0_4px_12px_rgba(0,0,0,0.08)]">
        <label htmlFor="directory-search" className="sr-only">
          Buscar por nombre, ciudad o tipo de apoyo
        </label>
        <input
          id="directory-search"
          type="search"
          placeholder="Buscar apoyo, ciudad o organización..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full min-h-[48px] rounded-xl border border-[var(--card-border)] bg-white px-4 py-3 text-base text-[var(--card-text)] placeholder-[var(--card-text-muted)] focus:border-[var(--brand-purple-accent)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-purple-accent)] focus:ring-offset-2"
          aria-describedby="search-hint"
          autoComplete="off"
        />
        <p id="search-hint" className="mt-2 text-sm text-[var(--card-text-muted)]" role="status">
          {filtered.length} resultado{filtered.length !== 1 ? 's' : ''}.
        </p>
      </div>

      <details className="rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] shadow-[0_4px_12px_rgba(0,0,0,0.08)]">
        <summary className="list-none cursor-pointer px-4 py-3 text-base font-semibold text-[var(--card-text)] hover:bg-gray-50 rounded-xl select-none min-h-[48px] flex items-center">
          Más filtros (ubicación, tipo, costo)
        </summary>
        <div className="px-4 pb-4 pt-2 border-t border-[var(--card-border)]">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <label htmlFor="filter-country" className="block text-xs font-medium text-[var(--card-text-muted)]">
              País
            </label>
            <select
              id="filter-country"
              value={country}
              onChange={(e) => {
                setCountry(e.target.value);
                setState('');
                setCity('');
              }}
              className="mt-1 w-full min-h-[48px] rounded-xl border border-[var(--card-border)] bg-white px-3 py-2 text-base text-[var(--card-text)] focus:border-[var(--brand-purple-accent)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-purple-accent)]"
            >
              <option value="">Todos</option>
              {countries.map((c) => (
                <option key={c} value={c}>
                  {c === 'Mexico' ? 'México' : c}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="filter-state" className="block text-xs font-medium text-[var(--card-text-muted)]">
              Estado
            </label>
            <select
              id="filter-state"
              value={state}
              onChange={(e) => {
                setState(e.target.value);
                setCity('');
              }}
              className="mt-1 w-full min-h-[48px] rounded-xl border border-[var(--card-border)] bg-white px-3 py-2 text-base text-[var(--card-text)] focus:border-[var(--brand-purple-accent)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-purple-accent)]"
            >
              <option value="">Todos</option>
              {states.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="filter-city" className="block text-xs font-medium text-[var(--card-text-muted)]">
              Ciudad
            </label>
            <select
              id="filter-city"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="mt-1 w-full min-h-[48px] rounded-xl border border-[var(--card-border)] bg-white px-3 py-2 text-base text-[var(--card-text)] focus:border-[var(--brand-purple-accent)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-purple-accent)]"
            >
              <option value="">Todas</option>
              {cities.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <span className="block text-xs font-medium text-[var(--card-text-muted)] mb-1">Modalidad</span>
            <select
              value={online}
              onChange={(e) => setOnline(e.target.value)}
              className="w-full min-h-[48px] rounded-xl border border-[var(--card-border)] bg-white px-3 py-2 text-base text-[var(--card-text)] focus:border-[var(--brand-purple-accent)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-purple-accent)]"
              aria-label="En línea o presencial"
            >
              <option value="">Todas</option>
              <option value="online">En línea</option>
              <option value="inperson">Presencial</option>
            </select>
          </div>
          <div>
            <label htmlFor="filter-cost" className="block text-xs font-medium text-[var(--card-text-muted)]">
              Costo
            </label>
            <select
              id="filter-cost"
              value={cost}
              onChange={(e) => setCost(e.target.value)}
              className="mt-1 w-full min-h-[48px] rounded-xl border border-[var(--card-border)] bg-white px-3 py-2 text-base text-[var(--card-text)] focus:border-[var(--brand-purple-accent)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-purple-accent)]"
            >
              <option value="">Cualquiera</option>
              {COST_OPTIONS.map((c) => (
                <option key={c} value={c}>{COST_LABELS[c]}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-4">
          <span className="block text-xs font-medium text-[var(--card-text-muted)] mb-2">Tipo de apoyo</span>
          <div className="flex flex-wrap gap-2">
            {SUPPORT_TYPES.map((t) => (
              <label key={t} className="inline-flex items-center gap-2 cursor-pointer min-h-[44px] px-2 py-1 rounded-xl hover:bg-gray-50">
                <input
                  type="checkbox"
                  checked={types.includes(t)}
                  onChange={() => toggleType(t)}
                  className="h-5 w-5 rounded border-gray-300 text-[var(--brand-purple-accent)] focus:ring-[var(--brand-purple-accent)] flex-shrink-0"
                />
                <span className="text-base text-[var(--card-text)]">{TYPE_LABELS[t]}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="mt-4">
          <span className="block text-xs font-medium text-[var(--card-text-muted)] mb-2">Población</span>
          <div className="flex flex-wrap gap-2">
            {POPULATION_OPTIONS.map((p) => (
              <label key={p} className="inline-flex items-center gap-2 cursor-pointer min-h-[44px] px-2 py-1 rounded-xl hover:bg-gray-50">
                <input
                  type="checkbox"
                  checked={population.includes(p)}
                  onChange={() => togglePopulation(p)}
                  className="h-5 w-5 rounded border-gray-300 text-[var(--brand-purple-accent)] focus:ring-[var(--brand-purple-accent)] flex-shrink-0"
                />
                <span className="text-base text-[var(--card-text)]">{POP_LABELS[p]}</span>
              </label>
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={clearFilters}
          className="mt-4 min-h-[48px] px-4 py-2 rounded-xl text-base font-medium text-[var(--card-text)] hover:bg-gray-100 border border-[var(--card-border)]"
        >
          Limpiar filtros
        </button>
        </div>
      </details>

      <section
        className="space-y-4"
        aria-label="Resultados del directorio"
      >
        {filtered.length === 0 && (
          <p className="rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] p-8 text-center text-base text-[var(--card-text-muted)]" role="status">
            No encontramos resultados, intenta buscar por ciudad o tipo de apoyo.
          </p>
        )}
      </section>
    </div>
  );
}
