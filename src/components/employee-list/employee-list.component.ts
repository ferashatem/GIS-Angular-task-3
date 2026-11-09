import { UiIconComponent } from '../ui-icon/ui-icon.component';
import { Component, input, output } from '@angular/core';
import { Employee, Office } from '../../gis/models';
import { DEPARTMENT_COLORS } from '../../gis/config/department-colors';

@Component({
  selector: 'app-employee-list',
  imports: [UiIconComponent],
  templateUrl: 'employee-list.component.html',
})
export class EmployeeListComponent {
  readonly employees = input.required<Employee[]>();
  readonly offices = input.required<Office[]>();
  readonly total = input(0);
  readonly selectedId = input<number | null>(null);
  readonly selected = output<Employee>();
  readonly colors = DEPARTMENT_COLORS;
  initials(name: string): string {
    return name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part.charAt(0))
      .join('');
  }

  officeName(id: number): string {
    return this.offices().find((office) => office.id === id)?.name ?? 'Unknown office';
  }
}
