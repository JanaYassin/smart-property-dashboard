import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Session } from '@supabase/supabase-js';
import { SupabaseService } from './supabase.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly supabase = inject(SupabaseService).client;
  private readonly router = inject(Router);

  private readonly sessionSignal = signal<Session | null>(null);
  private readonly loadingSignal = signal(false);
  private readonly errorSignal = signal<string | null>(null);

  readonly session = computed(() => this.sessionSignal());
  readonly user = computed(() => this.sessionSignal()?.user ?? null);
  readonly isAuthenticated = computed(() => !!this.user());
  readonly loading = computed(() => this.loadingSignal());
  readonly error = computed(() => this.errorSignal());

  constructor() {
    this.bootstrapSession();
  }

  private async bootstrapSession(): Promise<void> {
    const { data, error } = await this.supabase.auth.getSession();
    if (error) {
      this.errorSignal.set(error.message);
    } else {
      this.sessionSignal.set(data.session);
    }

    this.supabase.auth.onAuthStateChange((_event, session) => {
      this.sessionSignal.set(session);
    });
  }

  async hasActiveSession(): Promise<boolean> {
    if (this.isAuthenticated()) {
      return true;
    }
    const { data, error } = await this.supabase.auth.getSession();
    if (error) {
      this.errorSignal.set(error.message);
      return false;
    }
    this.sessionSignal.set(data.session);
    return !!data.session;
  }

  async login(email: string, password: string): Promise<boolean> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    const { error } = await this.supabase.auth.signInWithPassword({ email, password });
    this.loadingSignal.set(false);
    if (error) {
      this.errorSignal.set(error.message);
      return false;
    }
    return true;
  }

  async register(email: string, password: string): Promise<boolean> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    const { error } = await this.supabase.auth.signUp({ email, password });
    this.loadingSignal.set(false);
    if (error) {
      this.errorSignal.set(error.message);
      return false;
    }
    return true;
  }

  async logout(): Promise<void> {
    await this.supabase.auth.signOut();
    await this.router.navigateByUrl('/auth/login');
  }
}
