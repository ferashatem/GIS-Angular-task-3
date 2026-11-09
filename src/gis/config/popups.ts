import PopupTemplate from '@arcgis/core/PopupTemplate';
import { Office } from '../models';

export function createEmployeePopup(offices: Office[]) {
  const decodeArgs = offices.map((o) => `${o.id}, ${JSON.stringify(o.name)}`).join(', ');

  return new PopupTemplate({
    title: '{fullName}',
    expressionInfos: [
      {
        name: 'officeName',
        title: 'Office',
        expression: `Decode($feature.officeId, ${decodeArgs}, 'unknown')`,
      },
    ],
    content: [
      {
        type: 'fields',
        fieldInfos: [
          { fieldName: 'jobTitle', label: 'Job title' },
          { fieldName: 'department', label: 'Department' },
          { fieldName: 'expression/officeName', label: 'Office' },
          { fieldName: 'email', label: 'Email' },
          { fieldName: 'phoneNumber', label: 'Phone' },
          { fieldName: 'latitude', label: 'Latitude', format: { places: 5 } },
          { fieldName: 'longitude', label: 'Longitude', format: { places: 5 } },
        ],
      },
    ],
  });
}

export function createOfficePopup(): PopupTemplate {
  return new PopupTemplate({
    title: '{name}',
    content: [
      {
        type: 'fields',
        fieldInfos: [
          { fieldName: 'area', label: 'Area' },
          { fieldName: 'latitude', label: 'Latitude', format: { places: 5 } },
          { fieldName: 'longitude', label: 'Longitude', format: { places: 5 } },
        ],
      },
    ],
  });
}
