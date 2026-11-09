import { UiIconComponent } from '../ui-icon/ui-icon.component';
import { Component, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  COVERAGE_DISTANCES,
  CoverageDistanceKm,
  CoverageRequest,
  CoverageResult,
  Office,
} from '../../gis/models';

@Component({
  selector: 'app-coverage-tool',
  imports: [FormsModule, UiIconComponent],
  templateUrl: 'coverage-tool.component.html',
})
export class CoverageToolComponent {
  readonly offices = input.required<Office[]>();
  readonly result = input<CoverageResult | null>(null);
  readonly busy = input(false);
  readonly visibleCount = input(0);
  readonly applied = output<CoverageRequest>();
  readonly cleared = output<void>();
  readonly distances = COVERAGE_DISTANCES;
  officeId: number | null = null;
  distanceKm: CoverageDistanceKm = 5;
  run(): void {
    if (this.officeId !== null && !this.busy())
      this.applied.emit({ officeId: this.officeId, distanceKm: this.distanceKm });
  }
}
