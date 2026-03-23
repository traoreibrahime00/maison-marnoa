export interface AnalyticsEventInput {
  type: string;
  productId?: string;
  value: number;
  source?: string;
  meta?: Record<string, unknown>;
}
