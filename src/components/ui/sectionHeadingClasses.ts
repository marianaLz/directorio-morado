export type BrandColor =
  | 'primary'
  | 'lilac'
  | 'lavender'
  | 'green'
  | 'red'
  | 'sage'
  | 'gray'
  | 'white'
  | 'black';

const BRAND_VAR: Record<BrandColor, string> = {
  primary: 'var(--brand-primary)',
  lilac: 'var(--brand-lilac)',
  lavender: 'var(--brand-lavender)',
  green: 'var(--brand-green)',
  red: 'var(--brand-red)',
  sage: 'var(--brand-sage)',
  gray: 'var(--brand-gray)',
  white: 'var(--brand-white)',
  black: 'var(--brand-black)',
};

export function brandColorVar(color: BrandColor = 'primary'): string {
  return BRAND_VAR[color];
}

export const sectionPaddingClass = 'py-16 sm:py-32';

export const sectionTitleBaseClass =
  'text-3xl lg:text-4xl font-bold text-center';

export const sectionSubtitleBaseClass =
  'mt-4 text-center text-base lg:text-lg mx-auto';
