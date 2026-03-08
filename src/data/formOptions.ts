/**
 * Opciones para el formulario de solicitud de nuevo recurso (coinciden con directory).
 */
import type { SupportType, PopulationType, CostType } from '../types/directory';
import { TYPE_TAG_CONFIG } from '../lib/tagConfig';

export const SUPPORT_TYPES: SupportType[] = [
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
];

export const POPULATION_OPTIONS: { value: PopulationType; label: string; icon: string }[] = [
  { value: 'women', label: 'Mujeres', icon: '👩' },
  { value: 'girls', label: 'Niñas, niños y adolescentes', icon: '👧' },
  { value: 'survivors of sexual violence', label: 'Sobrevivientes de violencia sexual', icon: '💜' },
  { value: 'men survivors', label: 'Hombres sobrevivientes', icon: '👨' },
  { value: 'general public', label: 'Público general', icon: '👥' },
];

export const COST_OPTIONS: { value: CostType; label: string }[] = [
  { value: 'free', label: 'Gratuito' },
  { value: 'low cost', label: 'Bajo costo' },
  { value: 'variable', label: 'Variable' },
  { value: 'consult directly', label: 'Consultar directamente' },
];

/** Países de Latinoamérica (y Caribe) + Otro. value para datos, label para mostrar. */
export const COUNTRY_OPTIONS: { value: string; label: string }[] = [
  { value: 'Mexico', label: 'México' },
  { value: 'Guatemala', label: 'Guatemala' },
  { value: 'Belice', label: 'Belice' },
  { value: 'El Salvador', label: 'El Salvador' },
  { value: 'Honduras', label: 'Honduras' },
  { value: 'Nicaragua', label: 'Nicaragua' },
  { value: 'Costa Rica', label: 'Costa Rica' },
  { value: 'Panama', label: 'Panamá' },
  { value: 'Cuba', label: 'Cuba' },
  { value: 'Republica Dominicana', label: 'República Dominicana' },
  { value: 'Haiti', label: 'Haití' },
  { value: 'Jamaica', label: 'Jamaica' },
  { value: 'Puerto Rico', label: 'Puerto Rico' },
  { value: 'Trinidad y Tobago', label: 'Trinidad y Tobago' },
  { value: 'Colombia', label: 'Colombia' },
  { value: 'Venezuela', label: 'Venezuela' },
  { value: 'Ecuador', label: 'Ecuador' },
  { value: 'Peru', label: 'Perú' },
  { value: 'Bolivia', label: 'Bolivia' },
  { value: 'Chile', label: 'Chile' },
  { value: 'Argentina', label: 'Argentina' },
  { value: 'Uruguay', label: 'Uruguay' },
  { value: 'Paraguay', label: 'Paraguay' },
  { value: 'Brasil', label: 'Brasil' },
  { value: 'Guyana', label: 'Guyana' },
  { value: 'Surinam', label: 'Surinam' },
  { value: 'Otro', label: 'Otro' },
];

export function getSupportTypeLabel(t: string): string {
  return TYPE_TAG_CONFIG[t]?.label ?? t;
}
