/**
 * Role-Based Access Control (RBAC) & Trustee Clearance Whitelist
 * Only verified accounts matching ADMIN_EMAILS possess administrative stewardship over the Trustee Desk.
 */

export const ADMIN_EMAILS = [
  "chairperson@kshestra.com",
  "artorgphase1@gmail.com"
];

/**
 * Determine admin status dynamically by checking if an email is present in ADMIN_EMAILS.
 */
export const isEmailAdmin = (email?: string | null): boolean => {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email.toLowerCase().trim());
};
