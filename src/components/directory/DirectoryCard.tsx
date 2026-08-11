import type { DirectoryEntry } from "../../types/directory";
import {
  TYPE_TAG_CONFIG,
  META_TAG_CLASS,
  TYPE_TAG_CLASS,
  POPULATION_TAG_CLASS,
} from "../../lib/tagConfig";
import { POPULATION_OPTIONS } from "../../data/formOptions";
import ButtonGhost from "../ui/ButtonGhost";
import { buttonSolidClass } from "../ui/buttonClasses";

const COST_LABELS: Record<string, string> = {
  free: "Gratuito",
  "low cost": "Bajo costo",
  variable: "Variable",
  "consult directly": "Consultar",
};

const COST_ICONS: Record<string, string> = {
  free: "🆓",
  "low cost": "💵",
  variable: "📊",
  "consult directly": "💬",
};

interface Props {
  entry: DirectoryEntry;
}

export default function DirectoryCard({ entry }: Props) {
  const instagramUrl = entry.instagram
    ? `https://instagram.com/${entry.instagram.replace("@", "")}`
    : null;
  const whatsappUrl = entry.whatsapp
    ? `https://wa.me/${entry.whatsapp.replace(/\D/g, "")}`
    : null;
  const isOfficial =
    entry.type.includes("government services") ||
    entry.type.includes("crisis hotline");
  const isEmergency = entry.isEmergency === true;
  const isCrisisHotline = entry.type.includes("crisis hotline");
  const telPhone = entry.phone ? entry.phone.replace(/\D/g, "") : "";

  return (
    <article
      data-entry-id={entry.id}
      className={`directory-card rounded-2xl bg-[var(--brand-white)] p-5 lg:p-6 border ${
        isCrisisHotline
          ? "border-[var(--brand-red)]"
          : "border-[var(--brand-lilac)]"
      }`}
      aria-labelledby={`entry-name-${entry.id}`}
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <h3
          id={`entry-name-${entry.id}`}
          className="text-lg font-semibold leading-tight"
        >
          {entry.name}
        </h3>
        {isOfficial && !isEmergency && (
          <span className={META_TAG_CLASS} aria-label="Recurso oficial">
            <span aria-hidden>🏛</span>
            Oficial
          </span>
        )}
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {entry.type
          .filter((t) => TYPE_TAG_CONFIG[t])
          .map((t) => {
            const config = TYPE_TAG_CONFIG[t];
            return (
              <span
                key={t}
                className={`${TYPE_TAG_CLASS} ${config.bgClass} ${config.textClass}`}
              >
                <span aria-hidden>{config.icon}</span>
                {config.label}
              </span>
            );
          })}
        <span className={META_TAG_CLASS}>
          {COST_ICONS[entry.cost] && (
            <span aria-hidden>{COST_ICONS[entry.cost]}</span>
          )}
          {COST_LABELS[entry.cost] ?? entry.cost}
        </span>
        {entry.online && (
          <span className={META_TAG_CLASS}>
            <span aria-hidden>🌐</span>
            En línea
          </span>
        )}
        {(entry.inPerson ?? !entry.online) && (
          <span className={META_TAG_CLASS}>
            <span aria-hidden>📍</span>
            Presencial
          </span>
        )}
        {Array.isArray(entry.population) &&
          entry.population.length > 0 &&
          entry.population.map((p) => {
            const opt = POPULATION_OPTIONS.find((o) => o.value === p);
            const label = opt?.label ?? p;
            const icon = opt?.icon ?? "";
            return (
              <span key={p} className={POPULATION_TAG_CLASS}>
                {icon && <span aria-hidden>{icon}</span>}
                {label}
              </span>
            );
          })}
      </div>

      {(entry.location || entry.hours) && (
        <div className="mt-4 space-y-1 text-sm text-[var(--brand-gray)]">
          {entry.location && (
            <p className="flex items-start gap-2">
              <span aria-hidden>📍</span>
              <span>{entry.location}</span>
            </p>
          )}
          {entry.hours && (
            <p>
              <span className="font-medium">Horario:</span> {entry.hours}
            </p>
          )}
        </div>
      )}

      <p className="mt-3 text-base leading-relaxed text-[var(--brand-gray)]">
        {entry.description}
      </p>

      <div className="mt-5 flex flex-wrap gap-2">
        {entry.phone &&
          telPhone &&
          (isEmergency ? (
            <a
              href={`tel:${telPhone}`}
              className={`${buttonSolidClass} !bg-[var(--brand-red)] !border-[var(--brand-red)] !px-3 !py-2 !text-sm`}
              aria-label={`Llamar a ${entry.name}: ${entry.phone}`}
            >
              Llamar {entry.phone}
            </a>
          ) : (
            <ButtonGhost
              href={`tel:${telPhone}`}
              aria-label={`Llamar a ${entry.name}: ${entry.phone}`}
            >
              Llamar {entry.phone}
            </ButtonGhost>
          ))}
        {entry.website && (
          <ButtonGhost
            href={entry.website}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Ver sitio web de ${entry.name}`}
          >
            Sitio web
          </ButtonGhost>
        )}
        {instagramUrl && (
          <ButtonGhost
            href={instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Contactar a ${entry.name} por Instagram`}
          >
            Instagram
          </ButtonGhost>
        )}
        {whatsappUrl && (
          <ButtonGhost
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Contactar a ${entry.name} por WhatsApp`}
          >
            <svg
              className="h-4 w-4 shrink-0"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            WhatsApp
          </ButtonGhost>
        )}
      </div>
    </article>
  );
}
