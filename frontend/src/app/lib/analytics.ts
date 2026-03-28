import { useEffect } from 'react';
import { useLocation } from 'react-router';
import { apiUrl } from './api';

interface TrackEventInput {
  type: string;
  productId?: string;
  value?: number;
  source?: string;
  meta?: Record<string, unknown>;
}

export function trackEvent(input: TrackEventInput): void {
  void fetch(apiUrl('/api/track/events'), {
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

export function usePageTracking() {
  const location = useLocation();

  useEffect(() => {
    if (!sessionStorage.getItem('mn_session_tracked')) {
      sessionStorage.setItem('mn_session_tracked', '1');
      trackEvent({ type: 'SESSION_START' });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    trackEvent({ type: 'PAGE_VIEW', meta: { path: location.pathname } });
  }, [location.pathname]);
}
