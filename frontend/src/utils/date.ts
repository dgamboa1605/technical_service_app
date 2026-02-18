/**
 * Shared date formatting utilities.
 * Single source for locale and format consistency across the app.
 */

/**
 * Formats an ISO date string for display (date only).
 * Returns "-" for null/undefined/empty.
 */
export function formatDate(value?: string | null, locale = 'es-ES'): string {
  if (value == null || value === '') return '-';
  return new Date(value).toLocaleDateString(locale);
}

/**
 * Formats an ISO date string for display (date and time).
 * Returns "-" for null/undefined/empty.
 */
export function formatDateTime(value?: string | null, locale = 'es-ES'): string {
  if (value == null || value === '') return '-';
  return new Date(value).toLocaleString(locale);
}

/**
 * Date-only options for more control (e.g. WorkOrderInvoice).
 */
export function formatDateWithOptions(
  value: string,
  options: Intl.DateTimeFormatOptions = {},
  locale = 'es-ES'
): string {
  return new Date(value).toLocaleDateString(locale, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    ...options,
  });
}
