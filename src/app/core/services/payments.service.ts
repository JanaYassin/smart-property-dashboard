import { Injectable, computed, inject, signal } from '@angular/core';
import { Payment, PaymentPayload } from '../models/payment.model';
import { SupabaseService } from './supabase.service';

@Injectable({
  providedIn: 'root'
})
export class PaymentsService {
  private readonly supabase = inject(SupabaseService).client;

  private readonly paymentsSignal = signal<Payment[]>([]);
  private readonly loadingSignal = signal(false);
  private readonly errorSignal = signal<string | null>(null);

  readonly payments = computed(() => this.paymentsSignal());
  readonly loading = computed(() => this.loadingSignal());
  readonly error = computed(() => this.errorSignal());

  async fetchPayments(): Promise<void> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    const { data, error } = await this.supabase
      .from('payments')
      .select('*')
      .order('created_at', { ascending: false });

    this.loadingSignal.set(false);
    if (error) {
      this.errorSignal.set(error.message);
      return;
    }
    this.paymentsSignal.set((data ?? []) as Payment[]);
  }

  async createPayment(payload: PaymentPayload): Promise<boolean> {
    this.errorSignal.set(null);
    const { error } = await this.supabase.from('payments').insert(payload);
    if (error) {
      this.errorSignal.set(error.message);
      return false;
    }
    await this.fetchPayments();
    return true;
  }

  async updatePayment(id: string, payload: PaymentPayload): Promise<boolean> {
    this.errorSignal.set(null);
    const { error } = await this.supabase.from('payments').update(payload).eq('id', id);
    if (error) {
      this.errorSignal.set(error.message);
      return false;
    }
    await this.fetchPayments();
    return true;
  }

  async deletePayment(id: string): Promise<boolean> {
    this.errorSignal.set(null);
    const { error } = await this.supabase.from('payments').delete().eq('id', id);
    if (error) {
      this.errorSignal.set(error.message);
      return false;
    }
    await this.fetchPayments();
    return true;
  }
}
