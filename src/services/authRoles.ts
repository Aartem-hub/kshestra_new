/**
 * Role-Based Access Control (RBAC) & Administrative Clearance Verification
 * Only verified administrative accounts possess stewardship over the administration desk.
 */

export const ADMIN_EMAILS = [
  "chairperson@kshestra.com",
  "artorgphase1@gmail.com",
  "beingenious01@gmail.com"
];

/**
 * Determine admin status dynamically by checking if an email is present in ADMIN_EMAILS.
 */
export const isEmailAdmin = (email?: string | null): boolean => {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email.toLowerCase().trim());
};
