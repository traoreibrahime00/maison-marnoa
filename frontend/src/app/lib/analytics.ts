import { apiUrl } from './api';

interface TrackEventInput {
  type: string;
  productId?: string;
  value?: number;
  source?: string;
  meta?: Record<string, unknown>;
}

export function trackEvent(input: TrackEventInput): void {
  void fetch(apiUrl('/api/analytics/events'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ...input,
      value: input.value ?? 1,
      source: input.source || 'frontend',
    }),
  }).catch(() => {
    // Analytics is non-blocking by design.
  });
}
