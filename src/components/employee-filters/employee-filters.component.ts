import { UiIconComponent } from '../ui-icon/ui-icon.component';
import { Component, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DEPARTMENTS, EmployeeFilters, Office } from '../../gis/models';

@Component({
  selector: 'app-employee-filters',
  imports: [FormsModule, UiIconComponent],
  templateUrl: 'employee-filters.component.html',
})
export class EmployeeFiltersComponent {
  readonly filters = input.required<EmployeeFilters>();
  readonly offices = input.required<Office[]>();
  readonly changed = output<Partial<EmployeeFilters>>();
  readonly cleared = output<void>();
  readonly departments = DEPARTMENTS;
}
