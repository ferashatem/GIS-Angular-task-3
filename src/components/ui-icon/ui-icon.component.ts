import { Component, input } from '@angular/core';

const ICON_PATHS = {
  map: 'm3 6 6-3 6 3 6-3v15l-6 3-6-3-6 3V6Zm6-3v15m6-12v15',
  people:
    'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2m20 0v-2a4 4 0 0 0-3-3.87M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm8-7.87a4 4 0 0 1 0 7.75',
  office: 'M4 21V5l8-3v19m0-13h8v13M2 21h20M7 7h2M7 11h2M7 15h2m6-3h2m-2 4h2',
  target:
    'M22 12h-4M6 12H2M12 2v4m0 12v4m8-10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-5 0a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z',
  search: 'm21 21-4.5-4.5M19 10.5a8.5 8.5 0 1 1-17 0 8.5 8.5 0 0 1 17 0Z',
  arrow: 'M7 17 17 7M7 7h10v10',
  layers: 'm12 3 10 5-10 5L2 8l10-5Zm-10 9 10 5 10-5M2 16l10 5 10-5',
  pin: 'M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Zm-5 0a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z',
  chevron: 'm9 5 7 7-7 7',
  reset: 'M3 11a9 9 0 1 1 2.5 7M3 4v7h7',
  compass: 'm16 8-2 6-6 2 2-6 6-2Zm6 4a10 10 0 1 1-20 0 10 10 0 0 1 20 0Z',
} as const;
export type IconName = keyof typeof ICON_PATHS;

/** One small icon vocabulary, shared by all presentation components. */
@Component({
  selector: 'app-ui-icon',
  template: `<svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="1.6"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
    focusable="false"
  >
    <path [attr.d]="paths[name()]" />
  </svg>`,
  styles:
    ':host { display: inline-flex; width: 20px; height: 20px; flex-shrink: 0; } svg { width: 100%; height: 100%; }',
})
export class UiIconComponent {
  readonly name = input.required<IconName>();
  readonly paths = ICON_PATHS;
}
