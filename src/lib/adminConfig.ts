/**
 * Emails permitidos para el panel administrativo.
 * Solo estos usuarios pueden acceder; no hay registro, solo login con Google.
 * Si añades más correos, actualiza también la lista en firestore.rules (match /directory y /directory_pending).
 */
export const ALLOWED_ADMIN_EMAILS: string[] = [
  'marianaglp15@gmail.com',
  'reblandonmarron@gmail.com',
];

export function isAllowedAdminEmail(email: string | null): boolean {
  if (!email) return false;
  return ALLOWED_ADMIN_EMAILS.includes(email.trim().toLowerCase());
}
