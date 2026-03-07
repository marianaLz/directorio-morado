import type { DirectoryEntry } from '../types/directory';

export const TYPE_TAG_CONFIG: Record<
  string,
  { icon: string; label: string; bgClass: string; textClass: string }
> = {
  'psychological support': {
    icon: '🧠',
    label: 'Apoyo psicológico',
    bgClass: 'bg-[var(--tag-psychological-bg)]',
    textClass: 'text-[var(--tag-psychological-text)]',
  },
  'legal support': {
    icon: '⚖️',
    label: 'Apoyo legal',
    bgClass: 'bg-[var(--tag-legal-bg)]',
    textClass: 'text-[var(--tag-legal-text)]',
  },
  'abortion accompaniment': {
    icon: '🌿',
    label: 'Aborto seguro',
    bgClass: 'bg-[var(--tag-abortion-bg)]',
    textClass: 'text-[var(--tag-abortion-text)]',
  },
  'reproductive rights': {
    icon: '🌿',
    label: 'Derechos reproductivos',
    bgClass: 'bg-[var(--tag-abortion-bg)]',
    textClass: 'text-[var(--tag-abortion-text)]',
  },
  'government services': {
    icon: '🏛',
    label: 'Recursos gubernamentales',
    bgClass: 'bg-[var(--tag-government-bg)]',
    textClass: 'text-[var(--tag-government-text)]',
  },
  'crisis hotline': {
    icon: '📞',
    label: 'Línea de crisis',
    bgClass: 'bg-[var(--tag-crisis-bg)]',
    textClass: 'text-[var(--tag-crisis-text)]',
  },
  'community support': {
    icon: '👥',
    label: 'Comunidad',
    bgClass: 'bg-[var(--tag-community-bg)]',
    textClass: 'text-[var(--tag-community-text)]',
  },
  'sexual violence support': {
    icon: '💬',
    label: 'Acompañamiento',
    bgClass: 'bg-[var(--tag-general-bg)]',
    textClass: 'text-[var(--tag-general-text)]',
  },
  'sexual health': {
    icon: '💬',
    label: 'Salud sexual',
    bgClass: 'bg-[var(--tag-general-bg)]',
    textClass: 'text-[var(--tag-general-text)]',
  },
  'financial support': {
    icon: '💬',
    label: 'Apoyo financiero',
    bgClass: 'bg-[var(--tag-general-bg)]',
    textClass: 'text-[var(--tag-general-text)]',
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
  return 'var(--brand-purple-accent)';
}
