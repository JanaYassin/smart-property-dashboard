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
import { Property } from '../../../core/models/property.model';
import { PropertiesService } from '../../../core/services/properties.service';
import { PropertyFormDialogComponent } from '../components/property-form-dialog/property-form-dialog.component';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-properties-page',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatChipsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatTableModule,
    MatIconModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ],
  templateUrl: './properties-page.component.html',
  styleUrl: './properties-page.component.css'
})
export class PropertiesPageComponent {
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);
  readonly propertiesService = inject(PropertiesService);
  readonly displayedColumns = ['name', 'address', 'type', 'rent', 'status', 'actions'];
  readonly searchText = signal('');
  readonly statusFilter = signal<'all' | 'vacant' | 'occupied'>('all');
  readonly filteredProperties = computed(() => {
    const all = this.propertiesService.properties();
    const search = this.searchText().trim().toLowerCase();
    const status = this.statusFilter();
    return all.filter((property) => {
      const matchesStatus = status === 'all' || property.status === status;
      if (!matchesStatus) return false;
      if (!search) return true;
      const haystack = `${property.name} ${property.address} ${property.type}`.toLowerCase();
      return haystack.includes(search);
    });
  });

  constructor() {
    this.propertiesService.fetchProperties();
  }

  statusChipClass(status: string): string {
    return status === 'occupied' ? 'chip-occupied' : 'chip-vacant';
  }

  openCreateDialog(): void {
    const dialogRef = this.dialog.open(PropertyFormDialogComponent, {
      width: '560px',
      data: { mode: 'create' }
    });

    dialogRef.afterClosed().subscribe(async (result) => {
      if (!result) return;
      const success = await this.propertiesService.createProperty(result.payload);
      this.showResultMessage(success, 'Property created successfully');
    });
  }

  edit(property: Property): void {
    const dialogRef = this.dialog.open(PropertyFormDialogComponent, {
      width: '560px',
      data: { mode: 'edit', property }
    });

    dialogRef.afterClosed().subscribe(async (result) => {
      if (!result?.id) return;
      const success = await this.propertiesService.updateProperty(result.id, result.payload);
      this.showResultMessage(success, 'Property updated successfully');
    });
  }

  async remove(property: Property): Promise<void> {
    const confirmRef = this.dialog.open(ConfirmDialogComponent, {
      width: '420px',
      data: {
        title: 'Delete property',
        message: `Are you sure you want to delete "${property.name}"?`,
        confirmLabel: 'Delete'
      }
    });

    const confirmed = await firstValueFrom(confirmRef.afterClosed());
    if (!confirmed) return;

    const success = await this.propertiesService.deleteProperty(property.id);
    this.showResultMessage(success, 'Property deleted successfully');
  }

  private showResultMessage(success: boolean, successMessage: string): void {
    if (success) {
      this.snackBar.open(successMessage, 'Close', {
        duration: 2500,
        panelClass: ['snackbar-success']
      });
    } else {
      this.snackBar.open(this.propertiesService.error() ?? 'Something went wrong', 'Close', {
        duration: 3500,
        panelClass: ['snackbar-error']
      });
    }
  }
}
