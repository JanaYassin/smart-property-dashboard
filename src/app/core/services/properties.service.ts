import { Injectable, computed, inject, signal } from '@angular/core';
import { Property, PropertyPayload } from '../models/property.model';
import { SupabaseService } from './supabase.service';

@Injectable({
  providedIn: 'root'
})
export class PropertiesService {
  private readonly supabase = inject(SupabaseService).client;

  private readonly propertiesSignal = signal<Property[]>([]);
  private readonly loadingSignal = signal(false);
  private readonly errorSignal = signal<string | null>(null);

  readonly properties = computed(() => this.propertiesSignal());
  readonly loading = computed(() => this.loadingSignal());
  readonly error = computed(() => this.errorSignal());

  readonly stats = computed(() => {
    const data = this.propertiesSignal();
    const occupied = data.filter((property) => property.status === 'occupied').length;
    const vacant = data.length - occupied;
    const totalRent = data.reduce((sum, property) => sum + Number(property.rent ?? 0), 0);
    return {
      totalProperties: data.length,
      occupied,
      vacant,
      totalRent
    };
  });

  async fetchProperties(): Promise<void> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    const { data, error } = await this.supabase
      .from('properties')
      .select('*')
      .order('created_at', { ascending: false });

    this.loadingSignal.set(false);
    if (error) {
      this.errorSignal.set(error.message);
      return;
    }
    this.propertiesSignal.set((data ?? []) as Property[]);
  }

  async createProperty(payload: PropertyPayload): Promise<boolean> {
    this.errorSignal.set(null);
    const { error } = await this.supabase.from('properties').insert(payload);
    if (error) {
      this.errorSignal.set(error.message);
      return false;
    }
    await this.fetchProperties();
    return true;
  }

  async updateProperty(id: string, payload: PropertyPayload): Promise<boolean> {
    this.errorSignal.set(null);
    const { error } = await this.supabase.from('properties').update(payload).eq('id', id);
    if (error) {
      this.errorSignal.set(error.message);
      return false;
    }
    await this.fetchProperties();
    return true;
  }

  async deleteProperty(id: string): Promise<boolean> {
    this.errorSignal.set(null);
    const { error } = await this.supabase.from('properties').delete().eq('id', id);
    if (error) {
      this.errorSignal.set(error.message);
      return false;
    }
    await this.fetchProperties();
    return true;
  }
}
