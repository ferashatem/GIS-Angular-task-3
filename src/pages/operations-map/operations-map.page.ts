import { Component, inject, signal } from '@angular/core';
import { MapViewComponent } from '../../components/map-view/map-view.component';
import { EmployeeFiltersComponent } from '../../components/employee-filters/employee-filters.component';
import { EmployeeListComponent } from '../../components/employee-list/employee-list.component';
import { CoverageToolComponent } from '../../components/coverage-tool/coverage-tool.component';
import { EmployeeStore } from '../../gis/services/employee-store.service';
import { MapService } from '../../gis/services/map.services';

import { UiIconComponent } from '../../components/ui-icon/ui-icon.component';
import { DEPARTMENTS, Employee } from '../../gis/models';

/** Composes the screen. Services own shared state and GIS behavior. */
@Component({
  selector: 'app-operations-map-page',
  imports: [
    UiIconComponent,
    MapViewComponent,
    EmployeeFiltersComponent,
    EmployeeListComponent,
    CoverageToolComponent,
  ],
  templateUrl: './operations-map.page.html',
})
export class OperationsMapPage {
  readonly activeSection = signal('map-workspace');
  readonly departmentCount = DEPARTMENTS.length;
  readonly store = inject(EmployeeStore);
  readonly map = inject(MapService);

  navigate(event: Event, section: string): void {
    event.preventDefault();
    this.activeSection.set(section);
    const target = document.getElementById(section);
    target?.scrollIntoView({ block: 'start' });
    target?.focus({ preventScroll: true });
    if (section === 'map-workspace' && this.map.loadState() === 'ready') {
      void this.map.showAllLocations();
    }
  }

  reset(): void {
    this.store.clearFilters();
    this.map.clearCoverage();
    void this.map.showAllLocations();
  }

  selectEmployee(employee: Employee): void {
    this.activeSection.set('map-workspace');
    document.getElementById('map-panel')?.scrollIntoView({ block: 'nearest' });
    void this.map.selectEmployee(employee);
  }
}
