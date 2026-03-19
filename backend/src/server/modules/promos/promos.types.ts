export interface PromoCreateInput {
  code: string;
  discount: number;
  maxUses?: number;
  expiresAt?: Date;
}

export interface PromoValidateResult {
  valid: boolean;
  discount: number;
  error?: string;
}
