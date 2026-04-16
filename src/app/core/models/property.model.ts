export interface Property {
  id: string;
  created_at?: string;
  name: string;
  address: string;
  type: string;
  rent: number;
  status: 'vacant' | 'occupied';
}

export type PropertyPayload = Omit<Property, 'id' | 'created_at'>;
