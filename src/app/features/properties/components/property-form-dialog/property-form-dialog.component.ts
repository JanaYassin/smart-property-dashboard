import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { Property } from '../../../../core/models/property.model';

export interface PropertyFormDialogData {
  mode: 'create' | 'edit';
  property?: Property;
}

export interface PropertyFormDialogResult {
  id?: string;
  payload: {
    name: string;
    address: string;
    type: string;
    rent: number;
    status: 'vacant' | 'occupied';
  };
}

@Component({
  selector: 'app-property-form-dialog',
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
  templateUrl: './property-form-dialog.component.html',
  styleUrl: './property-form-dialog.component.css'
})
export class PropertyFormDialogComponent {
  private readonly fb = inject(FormBuilder);
  private readonly dialogRef = inject(MatDialogRef<PropertyFormDialogComponent>);
  readonly data = inject<PropertyFormDialogData>(MAT_DIALOG_DATA);

  readonly form = this.fb.nonNullable.group({
    name: [this.data.property?.name ?? '', [Validators.required]],
    address: [this.data.property?.address ?? '', [Validators.required]],
    type: [this.data.property?.type ?? 'Apartment', [Validators.required]],
    rent: [this.data.property?.rent ?? 0, [Validators.required, Validators.min(1)]],
    status: [this.data.property?.status ?? ('vacant' as 'vacant' | 'occupied'), [Validators.required]]
  });

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.dialogRef.close({
      id: this.data.property?.id,
      payload: this.form.getRawValue()
    } as PropertyFormDialogResult);
  }
}
