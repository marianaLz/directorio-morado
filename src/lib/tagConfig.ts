/** Colores y estilos de tags: paleta fría distinta del branding (sin lilac/sage/primary/green). */
export const TYPE_TAG_CONFIG: Record<
  string,
  { icon: string; label: string; bgClass: string; textClass: string }
> = {
  'crisis hotline': {
    icon: '📞',
    label: 'Línea de crisis',
    bgClass: 'bg-[var(--tag-crisis-bg)]',
    textClass: 'text-[var(--tag-crisis-text)]',
  },
  'psychological support': {
    icon: '🧠',
    label: 'Psicólogas',
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
    bgClass: 'bg-[var(--tag-reproductive-bg)]',
    textClass: 'text-[var(--tag-reproductive-text)]',
  },
  'government services': {
    icon: '🏛',
    label: 'Recursos gubernamentales',
    bgClass: 'bg-[var(--tag-government-bg)]',
    textClass: 'text-[var(--tag-government-text)]',
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
    bgClass: 'bg-[var(--tag-accompaniment-bg)]',
    textClass: 'text-[var(--tag-accompaniment-text)]',
  },
  'sexual health': {
    icon: '💬',
    label: 'Salud sexual',
    bgClass: 'bg-[var(--tag-sexual-health-bg)]',
    textClass: 'text-[var(--tag-sexual-health-text)]',
  },
  'financial support': {
    icon: '💬',
    label: 'Apoyo financiero',
    bgClass: 'bg-[var(--tag-financial-bg)]',
    textClass: 'text-[var(--tag-financial-text)]',
  },
  'nutrition support': {
    icon: '🌿',
    label: 'Nutriólogas',
    bgClass: 'bg-[var(--tag-nutrition-bg)]',
    textClass: 'text-[var(--tag-nutrition-text)]',
  },
  'medical and health': {
    icon: '🩺',
    label: 'Médicas y Salud',
    bgClass: 'bg-[var(--tag-medical-bg)]',
    textClass: 'text-[var(--tag-medical-text)]',
  },
  'associations and foundations': {
    icon: '🤝',
    label: 'Asociaciones y Fundaciones',
    bgClass: 'bg-[var(--tag-associations-bg)]',
    textClass: 'text-[var(--tag-associations-text)]',
  },
};

export const META_TAG_CLASS =
  'inline-flex items-center gap-1 rounded-lg bg-[var(--tag-meta-bg)] px-2.5 py-1 text-xs font-medium text-[var(--tag-meta-text)]';

export const TYPE_TAG_CLASS =
  'inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-medium';

export const POPULATION_TAG_CLASS = `${TYPE_TAG_CLASS} bg-[var(--tag-population-bg)] text-[var(--tag-population-text)]`;

/** Extra classes for filter buttons — keep base look identical to card tags. */
export const TAG_FILTER_INTERACTIVE =
  'cursor-pointer transition-shadow focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)] focus:ring-offset-2';

export const TAG_FILTER_SELECTED =
  'ring-2 ring-[var(--brand-primary)] ring-offset-2';
