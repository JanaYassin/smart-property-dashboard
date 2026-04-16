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
import { Payment } from '../../../core/models/payment.model';
import { PaymentsService } from '../../../core/services/payments.service';

@Component({
  selector: 'app-payments-page',
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
  templateUrl: './payments-page.component.html',
  styleUrls: ['./payments-page.component.css']
})
export class PaymentsPageComponent {
  private readonly fb = inject(FormBuilder);
  readonly paymentsService = inject(PaymentsService);

  readonly editingId = signal<string | null>(null);
  readonly displayedColumns = ['tenant_name', 'property_name', 'amount', 'status', 'paid_on', 'actions'];

  readonly form = this.fb.nonNullable.group({
    tenant_name: ['', [Validators.required]],
    property_name: ['', [Validators.required]],
    amount: [0, [Validators.required, Validators.min(1)]],
    status: ['pending' as 'paid' | 'pending' | 'overdue', [Validators.required]],
    paid_on: ['' as string | null]
  });

  constructor() {
    this.paymentsService.fetchPayments();
  }

  statusChipClass(status: string): string {
    if (status === 'paid') return 'chip-paid';
    if (status === 'overdue') return 'chip-overdue';
    return 'chip-pending';
  }

  async submit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const raw = this.form.getRawValue();
    const payload = {
      ...raw,
      paid_on: raw.paid_on ? raw.paid_on : null
    };

    if (this.editingId()) {
      await this.paymentsService.updatePayment(this.editingId()!, payload);
    } else {
      await this.paymentsService.createPayment(payload);
    }
    this.resetForm();
  }

  edit(payment: Payment): void {
    this.editingId.set(payment.id);
    this.form.patchValue({
      tenant_name: payment.tenant_name,
      property_name: payment.property_name,
      amount: payment.amount,
      status: payment.status,
      paid_on: payment.paid_on ?? ''
    });
  }

  async remove(id: string): Promise<void> {
    await this.paymentsService.deletePayment(id);
  }

  resetForm(): void {
    this.editingId.set(null);
    this.form.reset({
      tenant_name: '',
      property_name: '',
      amount: 0,
      status: 'pending',
      paid_on: ''
    });
  }
}
