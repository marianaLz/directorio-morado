/** Shared button class names — solid, outline, ghost. Hover = lift + shadow, no color change. */

const base =
  "inline-flex items-center justify-center gap-2 rounded-xl border-2 px-5 py-4 text-base font-semibold leading-none transition-all duration-200 ease-out focus:outline-none focus:ring-2 focus:ring-[var(--brand-lilac)] focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none";

/** brand-primary fill, brand-white text */
export const buttonSolidClass = `${base} border-[var(--brand-primary)] bg-[var(--brand-primary)] text-[var(--brand-white)] shadow-md hover:-translate-y-0.5 hover:shadow-xl active:translate-y-0 active:shadow-md`;

/** brand-lilac border + text, transparent fill */
export const buttonOutlineClass = `${base} border-[var(--brand-lilac)] bg-transparent text-[var(--brand-lilac)] shadow-sm hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0 active:shadow-sm`;

/** Compact ghost — subtle gray border, for secondary actions in cards */
export const buttonGhostClass =
  "inline-flex items-center justify-center gap-1.5 rounded-lg border border-[var(--brand-gray)]/20 bg-transparent px-3 py-2 text-sm font-medium leading-none text-[var(--brand-gray)] transition-colors duration-200 ease-out hover:border-[var(--brand-gray)]/35 hover:bg-[var(--brand-lavender)]/50 focus:outline-none focus:ring-2 focus:ring-[var(--brand-lilac)] focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed";
