import { Injectable, computed, inject, signal } from '@angular/core';
import { Tenant, TenantPayload } from '../models/tenant.model';
import { SupabaseService } from './supabase.service';

@Injectable({
  providedIn: 'root'
})
export class TenantsService {
  private readonly supabase = inject(SupabaseService).client;

  private readonly tenantsSignal = signal<Tenant[]>([]);
  private readonly loadingSignal = signal(false);
  private readonly errorSignal = signal<string | null>(null);

  readonly tenants = computed(() => this.tenantsSignal());
  readonly loading = computed(() => this.loadingSignal());
  readonly error = computed(() => this.errorSignal());

  async fetchTenants(): Promise<void> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    const { data, error } = await this.supabase
      .from('tenants')
      .select('*')
      .order('created_at', { ascending: false });

    this.loadingSignal.set(false);
    if (error) {
      this.errorSignal.set(error.message);
      return;
    }
    this.tenantsSignal.set((data ?? []) as Tenant[]);
  }

  async createTenant(payload: TenantPayload): Promise<boolean> {
    this.errorSignal.set(null);
    const { error } = await this.supabase.from('tenants').insert(payload);
    if (error) {
      this.errorSignal.set(error.message);
      return false;
    }
    await this.fetchTenants();
    return true;
  }

  async updateTenant(id: string, payload: TenantPayload): Promise<boolean> {
    this.errorSignal.set(null);
    const { error } = await this.supabase.from('tenants').update(payload).eq('id', id);
    if (error) {
      this.errorSignal.set(error.message);
      return false;
    }
    await this.fetchTenants();
    return true;
  }

  async deleteTenant(id: string): Promise<boolean> {
    this.errorSignal.set(null);
    const { error } = await this.supabase.from('tenants').delete().eq('id', id);
    if (error) {
      this.errorSignal.set(error.message);
      return false;
    }
    await this.fetchTenants();
    return true;
  }
}
