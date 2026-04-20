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
import { Tenant } from '../../../core/models/tenant.model';
import { TenantsService } from '../../../core/services/tenants.service';
import { TenantFormDialogComponent } from '../components/tenant-form-dialog/tenant-form-dialog.component';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-tenants-page',
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
  templateUrl: 'tenants-page.component.html',
  styleUrls: ['tenants-page.component.css']
})
export class TenantsPageComponent {
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);
  readonly tenantsService = inject(TenantsService);
  readonly displayedColumns = ['full_name', 'email', 'phone', 'status', 'actions'];
  readonly searchText = signal('');
  readonly statusFilter = signal<'all' | 'active' | 'inactive'>('all');
  readonly filteredTenants = computed(() => {
    const all = this.tenantsService.tenants();
    const search = this.searchText().trim().toLowerCase();
    const status = this.statusFilter();
    return all.filter((tenant) => {
      const matchesStatus = status === 'all' || tenant.status === status;
      if (!matchesStatus) return false;
      if (!search) return true;
      const haystack = `${tenant.full_name} ${tenant.email} ${tenant.phone}`.toLowerCase();
      return haystack.includes(search);
    });
  });

  constructor() {
    this.tenantsService.fetchTenants();
  }

  statusChipClass(status: string): string {
    return status === 'active' ? 'chip-active' : 'chip-inactive';
  }

  openCreateDialog(): void {
    const dialogRef = this.dialog.open(TenantFormDialogComponent, {
      width: '560px',
      data: { mode: 'create' }
    });
    dialogRef.afterClosed().subscribe(async (result) => {
      if (!result) return;
      const success = await this.tenantsService.createTenant(result.payload);
      this.showResultMessage(success, 'Tenant created successfully');
    });
  }

  edit(tenant: Tenant): void {
    const dialogRef = this.dialog.open(TenantFormDialogComponent, {
      width: '560px',
      data: { mode: 'edit', tenant }
    });
    dialogRef.afterClosed().subscribe(async (result) => {
      if (!result?.id) return;
      const success = await this.tenantsService.updateTenant(result.id, result.payload);
      this.showResultMessage(success, 'Tenant updated successfully');
    });
  }

  async remove(tenant: Tenant): Promise<void> {
    const confirmRef = this.dialog.open(ConfirmDialogComponent, {
      width: '420px',
      data: {
        title: 'Delete tenant',
        message: `Are you sure you want to delete "${tenant.full_name}"?`,
        confirmLabel: 'Delete'
      }
    });
    const confirmed = await firstValueFrom(confirmRef.afterClosed());
    if (!confirmed) return;

    const success = await this.tenantsService.deleteTenant(tenant.id);
    this.showResultMessage(success, 'Tenant deleted successfully');
  }

  private showResultMessage(success: boolean, successMessage: string): void {
    if (success) {
      this.snackBar.open(successMessage, 'Close', {
        duration: 2500,
        panelClass: ['snackbar-success']
      });
    } else {
      this.snackBar.open(this.tenantsService.error() ?? 'Something went wrong', 'Close', {
        duration: 3500,
        panelClass: ['snackbar-error']
      });
    }
  }
}
