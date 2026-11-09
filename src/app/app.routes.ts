import { Routes } from '@angular/router';
export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('../pages/operations-map/operations-map.page').then(
        (module) => module.OperationsMapPage,
      ),
  },
  { path: '**', redirectTo: '' },
];
