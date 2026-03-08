import type { DirectoryEntry } from '../types/directory';

/** Colores y estilos de tags: misma paleta en filtros y tarjetas. Sin repetición de familia de color. */
export const TYPE_TAG_CONFIG: Record<
  string,
  { icon: string; label: string; bgClass: string; textClass: string }
> = {
  'crisis hotline': {
    icon: '📞',
    label: 'Línea de crisis',
    bgClass: 'bg-red-100',
    textClass: 'text-red-800',
  },
  'psychological support': {
    icon: '🧠',
    label: 'Psicólogas',
    bgClass: 'bg-violet-100',
    textClass: 'text-violet-800',
  },
  'legal support': {
    icon: '⚖️',
    label: 'Apoyo legal',
    bgClass: 'bg-blue-100',
    textClass: 'text-blue-800',
  },
  'abortion accompaniment': {
    icon: '🌿',
    label: 'Aborto seguro',
    bgClass: 'bg-emerald-100',
    textClass: 'text-emerald-800',
  },
  'reproductive rights': {
    icon: '🌿',
    label: 'Derechos reproductivos',
    bgClass: 'bg-teal-100',
    textClass: 'text-teal-800',
  },
  'government services': {
    icon: '🏛',
    label: 'Recursos gubernamentales',
    bgClass: 'bg-slate-100',
    textClass: 'text-slate-700',
  },
  'community support': {
    icon: '👥',
    label: 'Comunidad',
    bgClass: 'bg-amber-100',
    textClass: 'text-amber-800',
  },
  'sexual violence support': {
    icon: '💬',
    label: 'Acompañamiento',
    bgClass: 'bg-rose-100',
    textClass: 'text-rose-800',
  },
  'sexual health': {
    icon: '💬',
    label: 'Salud sexual',
    bgClass: 'bg-cyan-100',
    textClass: 'text-cyan-800',
  },
  'financial support': {
    icon: '💬',
    label: 'Apoyo financiero',
    bgClass: 'bg-orange-100',
    textClass: 'text-orange-800',
  },
  'nutrition support': {
    icon: '🌿',
    label: 'Nutriólogas',
    bgClass: 'bg-lime-100',
    textClass: 'text-lime-800',
  },
  'medical and health': {
    icon: '🩺',
    label: 'Médicas y Salud',
    bgClass: 'bg-sky-100',
    textClass: 'text-sky-800',
  },
  'associations and foundations': {
    icon: '🤝',
    label: 'Asociaciones y Fundaciones',
    bgClass: 'bg-fuchsia-100',
    textClass: 'text-fuchsia-800',
  },
};

/** Card header strip color: purple (general), green (reproductive), blue (mental), gray (government), red (crisis). */
export function getCardStripColor(entry: DirectoryEntry): string {
  if (entry.type.includes('crisis hotline') || entry.isEmergency) return 'var(--emergency-red)';
  if (entry.type.includes('government services')) return 'var(--tag-government-text)';
  if (
    entry.type.includes('abortion accompaniment') ||
    entry.type.includes('reproductive rights')
  )
    return 'var(--green-primary)';
  if (entry.type.includes('psychological support')) return '#2563eb'; // mental health blue
  if (entry.type.includes('nutrition support')) return 'var(--green-primary)';
  if (entry.type.includes('medical and health')) return '#1e40af';
  if (entry.type.includes('associations and foundations')) return 'var(--tag-community-text)';
  return 'var(--brand-purple-accent)';
}
