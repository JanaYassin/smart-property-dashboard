import { CommonModule, CurrencyPipe } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { PropertiesService } from '../../../core/services/properties.service';

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [
    CommonModule,
    CurrencyPipe,
    MatCardModule,
    MatIconModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatTableModule
  ],
  templateUrl: './dashboard-page.component.html',
  styleUrl: './dashboard-page.component.css'
})
export class DashboardPageComponent {
  readonly propertiesService = inject(PropertiesService);

  readonly occupancyRate = computed(() => {
    const stats = this.propertiesService.stats();
    if (!stats.totalProperties) {
      return 0;
    }
    return Math.round((stats.occupied / stats.totalProperties) * 100);
  });

  readonly recentProperties = computed(() => this.propertiesService.properties().slice(0, 5));
  readonly displayedColumns = ['name', 'type', 'status', 'rent'];

  constructor() {
    this.propertiesService.fetchProperties();
  }
}
