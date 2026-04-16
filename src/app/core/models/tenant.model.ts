export interface Tenant {
  id: string;
  created_at?: string;
  full_name: string;
  email: string;
  phone: string;
  status: 'active' | 'inactive';
}

export type TenantPayload = Omit<Tenant, 'id' | 'created_at'>;
