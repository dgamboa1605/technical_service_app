/**
 * Shared domain constants to avoid magic strings across the app.
 */

/** User role values (must match backend) */
export const USER_ROLES = {
  ADMIN: 'admin',
  EMPLOYEE: 'employee',
  TECHNICIAN: 'technician',
} as const;

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];
