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
import { Property } from '../../../core/models/property.model';
import { PropertiesService } from '../../../core/services/properties.service';

@Component({
  selector: 'app-properties-page',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatChipsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatTableModule,
    MatIconModule,
    MatTooltipModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './properties-page.component.html',
  styleUrl: './properties-page.component.css'
})
export class PropertiesPageComponent {
  private readonly fb = inject(FormBuilder);
  readonly propertiesService = inject(PropertiesService);
  readonly editingId = signal<string | null>(null);
  readonly displayedColumns = ['name', 'address', 'type', 'rent', 'status', 'actions'];

  readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required]],
    address: ['', [Validators.required]],
    type: ['Apartment', [Validators.required]],
    rent: [0, [Validators.required, Validators.min(1)]],
    status: ['vacant' as 'vacant' | 'occupied', [Validators.required]]
  });

  constructor() {
    this.propertiesService.fetchProperties();
  }

  statusChipClass(status: string): string {
    return status === 'occupied' ? 'chip-occupied' : 'chip-vacant';
  }

  async submit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const payload = this.form.getRawValue();
    if (this.editingId()) {
      await this.propertiesService.updateProperty(this.editingId()!, payload);
    } else {
      await this.propertiesService.createProperty(payload);
    }
    this.resetForm();
  }

  edit(property: Property): void {
    this.editingId.set(property.id);
    this.form.patchValue({
      name: property.name,
      address: property.address,
      type: property.type,
      rent: property.rent,
      status: property.status
    });
  }

  async remove(propertyId: string): Promise<void> {
    await this.propertiesService.deleteProperty(propertyId);
  }

  resetForm(): void {
    this.editingId.set(null);
    this.form.reset({
      name: '',
      address: '',
      type: 'Apartment',
      rent: 0,
      status: 'vacant'
    });
  }
}
