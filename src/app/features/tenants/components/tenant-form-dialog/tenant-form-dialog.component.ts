import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { Tenant } from '../../../../core/models/tenant.model';

export interface TenantFormDialogData {
  mode: 'create' | 'edit';
  tenant?: Tenant;
}

export interface TenantFormDialogResult {
  id?: string;
  payload: {
    full_name: string;
    email: string;
    phone: string;
    status: 'active' | 'inactive';
  };
}

@Component({
  selector: 'app-tenant-form-dialog',
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
  templateUrl: './tenant-form-dialog.component.html',
  styleUrl: './tenant-form-dialog.component.css'
})
export class TenantFormDialogComponent {
  private readonly fb = inject(FormBuilder);
  private readonly dialogRef = inject(MatDialogRef<TenantFormDialogComponent>);
  readonly data = inject<TenantFormDialogData>(MAT_DIALOG_DATA);

  readonly form = this.fb.nonNullable.group({
    full_name: [this.data.tenant?.full_name ?? '', [Validators.required]],
    email: [this.data.tenant?.email ?? '', [Validators.required, Validators.email]],
    phone: [this.data.tenant?.phone ?? '', [Validators.required]],
    status: [this.data.tenant?.status ?? ('active' as 'active' | 'inactive'), [Validators.required]]
  });

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.dialogRef.close({
      id: this.data.tenant?.id,
      payload: this.form.getRawValue()
    } as TenantFormDialogResult);
  }
}
