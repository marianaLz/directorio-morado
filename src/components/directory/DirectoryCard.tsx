import type { DirectoryEntry } from '../../types/directory';
import { TYPE_TAG_CONFIG, getCardStripColor } from '../../lib/tagConfig';
import { POPULATION_OPTIONS } from '../../data/formOptions';

const COST_LABELS: Record<string, string> = {
  free: 'Gratuito',
  'low cost': 'Bajo costo',
  variable: 'Variable',
  'consult directly': 'Consultar',
};

const COST_ICONS: Record<string, string> = {
  free: '🆓',
  'low cost': '💵',
  variable: '📊',
  'consult directly': '💬',
};

interface Props {
  entry: DirectoryEntry;
}

export default function DirectoryCard({ entry }: Props) {
  const instagramUrl = entry.instagram
    ? `https://instagram.com/${entry.instagram.replace('@', '')}`
    : null;
  const whatsappUrl = entry.whatsapp
    ? `https://wa.me/${entry.whatsapp.replace(/\D/g, '')}`
    : null;
  const isOfficial =
    entry.type.includes('government services') || entry.type.includes('crisis hotline');
  const isEmergency = entry.isEmergency === true;
  const telPhone = entry.phone ? entry.phone.replace(/\D/g, '') : '';
  const stripColor = getCardStripColor(entry);

  return (
    <article
      data-entry-id={entry.id}
      className="directory-card relative overflow-hidden rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] shadow-[0_4px_12px_rgba(0,0,0,0.08)] transition-shadow hover:shadow-[0_8px_24px_rgba(0,0,0,0.12)]"
      aria-labelledby={`entry-name-${entry.id}`}
    >
      <div
        className="h-1 w-full shrink-0"
        style={{ backgroundColor: stripColor }}
        aria-hidden
      />
      <div className="p-5">
        <div className="flex flex-wrap items-center gap-2">
          {isOfficial && !isEmergency && (
            <span
              className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1.5 text-xs font-medium text-slate-700"
              aria-label="Recurso oficial"
            >
              🏛 Oficial
            </span>
          )}
        </div>
        <h3
          id={`entry-name-${entry.id}`}
          className="mt-3 text-lg font-semibold leading-tight text-[var(--card-text)]"
        >
          {entry.name}
        </h3>
        <div className="mt-2 flex flex-wrap gap-2">
          {entry.type
            .filter((t) => TYPE_TAG_CONFIG[t])
            .map((t) => {
              const config = TYPE_TAG_CONFIG[t];
              return (
                <span
                  key={t}
                  className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1.5 text-xs font-medium ${config.bgClass} ${config.textClass}`}
                >
                  <span aria-hidden>{config.icon}</span>
                  {config.label}
                </span>
              );
            })}
          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1.5 text-xs font-medium text-slate-700">
            {COST_ICONS[entry.cost] && <span aria-hidden>{COST_ICONS[entry.cost]}</span>}
            {COST_LABELS[entry.cost] ?? entry.cost}
          </span>
          {entry.online && (
            <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1.5 text-xs font-medium text-slate-700">
              <span aria-hidden>🌐</span>
              En línea
            </span>
          )}
          {(entry.inPerson ?? !entry.online) && (
            <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1.5 text-xs font-medium text-slate-700">
              <span aria-hidden>📍</span>
              Presencial
            </span>
          )}
          {Array.isArray(entry.population) &&
            entry.population.length > 0 &&
            entry.population.map((p) => {
              const opt = POPULATION_OPTIONS.find((o) => o.value === p);
              const label = opt?.label ?? p;
              const icon = opt?.icon ?? '';
              return (
                <span
                  key={p}
                  className="inline-flex items-center gap-1 rounded-full bg-[var(--tag-population-bg)] px-2.5 py-1.5 text-xs font-medium text-[var(--tag-population-text)]"
                >
                  {icon && <span aria-hidden>{icon}</span>}
                  {label}
                </span>
              );
            })}
        </div>
        {entry.location && (
          <p className="mt-3 flex items-start gap-2 text-sm text-[var(--card-text-muted)]">
            <span aria-hidden>📍</span>
            <span>{entry.location}</span>
          </p>
        )}
        {entry.hours && (
          <p className="mt-1 text-sm text-[var(--card-text-muted)]">
            <span className="font-medium">Horario:</span> {entry.hours}
          </p>
        )}
        <p className="mt-3 text-base leading-[1.6] text-[var(--card-text)]">{entry.description}</p>
        <div className="mt-4 flex flex-wrap gap-3">
          {entry.phone && telPhone && (
            <a
              href={`tel:${telPhone}`}
              className={`inline-flex min-h-[48px] items-center justify-center rounded-xl px-4 py-3 text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-[rgba(0,0,0,0.12)] focus:ring-offset-2 ${
                isEmergency ? '' : 'border border-[rgba(0,0,0,0.12)] text-[#1a1a1a] hover:bg-[#fafafa]'
              }`}
              style={isEmergency ? { backgroundColor: '#b71c1c', color: 'white' } : undefined}
              aria-label={`Llamar a ${entry.name}: ${entry.phone}`}
            >
              Llamar {entry.phone}
            </a>
          )}
          {entry.website && (
            <a
              href={entry.website}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-[48px] items-center justify-center rounded-xl border border-[rgba(0,0,0,0.12)] px-4 py-3 text-sm font-semibold text-[#1a1a1a] transition-colors hover:bg-[#fafafa] focus:outline-none focus:ring-2 focus:ring-[rgba(0,0,0,0.12)] focus:ring-offset-2"
              aria-label={`Ver sitio web de ${entry.name}`}
            >
              Ver sitio web
            </a>
          )}
          {instagramUrl && (
            <a
              href={instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-[48px] items-center justify-center rounded-xl border border-[rgba(0,0,0,0.12)] px-4 py-3 text-sm font-semibold text-[#1a1a1a] transition-colors hover:bg-[#fafafa] focus:outline-none focus:ring-2 focus:ring-[rgba(0,0,0,0.12)] focus:ring-offset-2"
              aria-label={`Contactar a ${entry.name} por Instagram`}
            >
              Contactar por Instagram
            </a>
          )}
          {whatsappUrl && (
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl border border-[rgba(0,0,0,0.12)] px-4 py-3 text-sm font-semibold text-[#1a1a1a] transition-colors hover:bg-[#fafafa] focus:outline-none focus:ring-2 focus:ring-[rgba(0,0,0,0.12)] focus:ring-offset-2"
              aria-label={`Contactar a ${entry.name} por WhatsApp`}
            >
              <svg
                className="h-5 w-5 shrink-0"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              Contactar por WhatsApp
            </a>
          )}
        </div>
      </div>
    </article>
  );
}
