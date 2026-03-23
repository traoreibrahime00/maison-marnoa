export interface AppointmentCreateInput {
  ref: string;
  service: string;
  serviceLabel: string;
  date: string;       // ISO "2025-01-15"
  slot: string;       // "10:00"
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  notes?: string;
}
