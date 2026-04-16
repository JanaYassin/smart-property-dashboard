import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Tenant } from '../../../core/models/tenant.model';
import { TenantsService } from '../../../core/services/tenants.service';

@Component({
  selector: 'app-tenants-page',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatTableModule,
    MatIconModule,
    MatTooltipModule,
    MatChipsModule,
    MatProgressSpinnerModule
  ],
  templateUrl: 'tenants-page.component.html',
  styleUrls: ['tenants-page.component.css']
})
export class TenantsPageComponent {
  private readonly fb = inject(FormBuilder);
  readonly tenantsService = inject(TenantsService);

  readonly editingId = signal<string | null>(null);
  readonly displayedColumns = ['full_name', 'email', 'phone', 'status', 'actions'];

  readonly form = this.fb.nonNullable.group({
    full_name: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', [Validators.required]],
    status: ['active' as 'active' | 'inactive', [Validators.required]]
  });

  constructor() {
    this.tenantsService.fetchTenants();
  }

  statusChipClass(status: string): string {
    return status === 'active' ? 'chip-active' : 'chip-inactive';
  }

  async submit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const payload = this.form.getRawValue();
    if (this.editingId()) {
      await this.tenantsService.updateTenant(this.editingId()!, payload);
    } else {
      await this.tenantsService.createTenant(payload);
    }
    this.resetForm();
  }

  edit(tenant: Tenant): void {
    this.editingId.set(tenant.id);
    this.form.patchValue({
      full_name: tenant.full_name,
      email: tenant.email,
      phone: tenant.phone,
      status: tenant.status
    });
  }

  async remove(id: string): Promise<void> {
    await this.tenantsService.deleteTenant(id);
  }

  resetForm(): void {
    this.editingId.set(null);
    this.form.reset({
      full_name: '',
      email: '',
      phone: '',
      status: 'active'
    });
  }
}
