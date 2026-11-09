import { computed, Injectable, signal } from '@angular/core';
import { CoverageResult, Employee, EmployeeFilters, EMPTY_FILTERS, Office } from '../models';
import { filterEmployees } from './employee-selection';

/** Application state only: no ArcGIS objects or DOM operations belong here. */
@Injectable({ providedIn: 'root' })
export class EmployeeStore {
  readonly employees = signal<Employee[]>([]);
  readonly offices = signal<Office[]>([]);
  readonly filters = signal<EmployeeFilters>({ ...EMPTY_FILTERS });
  readonly coverage = signal<CoverageResult | null>(null);
  readonly selectedId = signal<number | null>(null);
  readonly visibleEmployees = computed(() =>
    filterEmployees(this.employees(), this.filters(), this.coverage()?.employeeIds ?? null),
  );

  updateFilters(changes: Partial<EmployeeFilters>): void {
    this.filters.update((current) => ({ ...current, ...changes }));
  }

  clearFilters(): void {
    this.filters.set({ ...EMPTY_FILTERS });
  }
}
