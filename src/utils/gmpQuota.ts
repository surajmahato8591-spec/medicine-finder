export const GOOGLE_MAPS_API_KEY = (import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '').trim();

export const hasGoogleMapsKey = Boolean(
  GOOGLE_MAPS_API_KEY &&
  GOOGLE_MAPS_API_KEY !== 'VITE_GOOGLE_MAPS_API_KEY' &&
  GOOGLE_MAPS_API_KEY.length >= 20
);

export function dispatchGmpQuotaExceeded(): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('gmp-quota-exceeded'));
  }
}

export function checkGmpQuotaError(error: unknown): boolean {
  const msg = String(
    (error as any)?.message ||
    (error as any)?.status ||
    (error as any)?.code ||
    error ||
    ''
  );
  if (
    msg.includes('429') ||
    msg.includes('RESOURCE_EXHAUSTED') ||
    msg.includes('OVER_QUERY_LIMIT') ||
    msg.includes('OverQuotaMapError') ||
    msg.includes('QuotaExceededError')
  ) {
    dispatchGmpQuotaExceeded();
    return true;
  }
  return false;
}
