export interface Payment {
  id: string;
  created_at?: string;
  tenant_name: string;
  property_name: string;
  amount: number;
  status: 'paid' | 'pending' | 'overdue';
  paid_on?: string | null;
}

export type PaymentPayload = Omit<Payment, 'id' | 'created_at'>;
