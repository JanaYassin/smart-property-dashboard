import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { firstValueFrom } from 'rxjs';
import { Payment } from '../../../core/models/payment.model';
import { PaymentsService } from '../../../core/services/payments.service';
import { PaymentFormDialogComponent } from '../components/payment-form-dialog/payment-form-dialog.component';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-payments-page',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatTableModule,
    MatIconModule,
    MatTooltipModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ],
  templateUrl: './payments-page.component.html',
  styleUrls: ['./payments-page.component.css']
})
export class PaymentsPageComponent {
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);
  readonly paymentsService = inject(PaymentsService);
  readonly displayedColumns = ['tenant_name', 'property_name', 'amount', 'status', 'paid_on', 'actions'];
  readonly searchText = signal('');
  readonly statusFilter = signal<'all' | 'pending' | 'paid' | 'overdue'>('all');
  readonly filteredPayments = computed(() => {
    const all = this.paymentsService.payments();
    const search = this.searchText().trim().toLowerCase();
    const status = this.statusFilter();
    return all.filter((payment) => {
      const matchesStatus = status === 'all' || payment.status === status;
      if (!matchesStatus) return false;
      if (!search) return true;
      const haystack = `${payment.tenant_name} ${payment.property_name}`.toLowerCase();
      return haystack.includes(search);
    });
  });

  constructor() {
    this.paymentsService.fetchPayments();
  }

  statusChipClass(status: string): string {
    if (status === 'paid') return 'chip-paid';
    if (status === 'overdue') return 'chip-overdue';
    return 'chip-pending';
  }

  openCreateDialog(): void {
    const dialogRef = this.dialog.open(PaymentFormDialogComponent, {
      width: '600px',
      data: { mode: 'create' }
    });
    dialogRef.afterClosed().subscribe(async (result) => {
      if (!result) return;
      const success = await this.paymentsService.createPayment(result.payload);
      this.showResultMessage(success, 'Payment created successfully');
    });
  }

  edit(payment: Payment): void {
    const dialogRef = this.dialog.open(PaymentFormDialogComponent, {
      width: '600px',
      data: { mode: 'edit', payment }
    });
    dialogRef.afterClosed().subscribe(async (result) => {
      if (!result?.id) return;
      const success = await this.paymentsService.updatePayment(result.id, result.payload);
      this.showResultMessage(success, 'Payment updated successfully');
    });
  }

  async remove(payment: Payment): Promise<void> {
    const confirmRef = this.dialog.open(ConfirmDialogComponent, {
      width: '420px',
      data: {
        title: 'Delete payment',
        message: `Are you sure you want to delete payment for "${payment.tenant_name}"?`,
        confirmLabel: 'Delete'
      }
    });
    const confirmed = await firstValueFrom(confirmRef.afterClosed());
    if (!confirmed) return;
    const success = await this.paymentsService.deletePayment(payment.id);
    this.showResultMessage(success, 'Payment deleted successfully');
  }

  private showResultMessage(success: boolean, successMessage: string): void {
    if (success) {
      this.snackBar.open(successMessage, 'Close', {
        duration: 2500,
        panelClass: ['snackbar-success']
      });
    } else {
      this.snackBar.open(this.paymentsService.error() ?? 'Something went wrong', 'Close', {
        duration: 3500,
        panelClass: ['snackbar-error']
      });
    }
  }
}
