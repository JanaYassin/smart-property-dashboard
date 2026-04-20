import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { Payment } from '../../../../core/models/payment.model';

export interface PaymentFormDialogData {
  mode: 'create' | 'edit';
  payment?: Payment;
}

export interface PaymentFormDialogResult {
  id?: string;
  payload: {
    tenant_name: string;
    property_name: string;
    amount: number;
    status: 'paid' | 'pending' | 'overdue';
    paid_on: string | null;
  };
}

@Component({
  selector: 'app-payment-form-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule
  ],
  templateUrl: './payment-form-dialog.component.html',
  styleUrl: './payment-form-dialog.component.css'
})
export class PaymentFormDialogComponent {
  private readonly fb = inject(FormBuilder);
  private readonly dialogRef = inject(MatDialogRef<PaymentFormDialogComponent>);
  readonly data = inject<PaymentFormDialogData>(MAT_DIALOG_DATA);

  readonly form = this.fb.nonNullable.group({
    tenant_name: [this.data.payment?.tenant_name ?? '', [Validators.required]],
    property_name: [this.data.payment?.property_name ?? '', [Validators.required]],
    amount: [this.data.payment?.amount ?? 0, [Validators.required, Validators.min(1)]],
    status: [this.data.payment?.status ?? ('pending' as 'paid' | 'pending' | 'overdue'), [Validators.required]],
    paid_on: [this.data.payment?.paid_on ?? '']
  });

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const payload = this.form.getRawValue();
    this.dialogRef.close({
      id: this.data.payment?.id,
      payload: {
        ...payload,
        paid_on: payload.paid_on || null
      }
    } as PaymentFormDialogResult);
  }
}
