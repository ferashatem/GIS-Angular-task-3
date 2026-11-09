import UniqueValueRenderer from '@arcgis/core/renderers/UniqueValueRenderer';
import SimpleRenderer from '@arcgis/core/renderers/SimpleRenderer';
import SimpleMarkerSymbol from '@arcgis/core/symbols/SimpleMarkerSymbol';
import { DEPARTMENTS } from '../models/employee.model';

import { DEPARTMENT_COLORS } from './department-colors';

const employeeSymbol = (color: string) =>
  new SimpleMarkerSymbol({
    style: 'circle',
    color,
    size: 11,
    outline: { color: 'white', width: 1.5 },
  });

export function createEmployeeRenderer(): UniqueValueRenderer {
  return new UniqueValueRenderer({
    field: 'department',
    legendOptions: {
      title: 'Department',
    },
    uniqueValueInfos: DEPARTMENTS.map((department) => ({
      value: department,
      symbol: employeeSymbol(DEPARTMENT_COLORS[department]),
      label: department,
    })),
    defaultSymbol: employeeSymbol('#9ca3af'),
    defaultLabel: 'Other',
  });
}

export function createOfficeRenderer(): SimpleRenderer {
  return new SimpleRenderer({
    label: 'Office',
    symbol: new SimpleMarkerSymbol({
      style: 'diamond',
      color: '#ffcc00',
      size: 20,
      outline: { color: '#ffffff', width: 2 },
    }),
  });
}