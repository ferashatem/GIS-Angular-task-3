import { describe, expect, it } from 'vitest';
import { filterEmployees } from './employee-selection';
import { Employee, EMPTY_FILTERS } from '../models';
const employees = [
  { id: 1, fullName: 'Ahmed Samir', department: 'Engineering', officeId: 1 },
  { id: 2, fullName: 'Sara Ali', department: 'Sales', officeId: 2 },
  { id: 3, fullName: 'Ahmed Ali', department: 'Engineering', officeId: 2 },
] as Employee[];
describe('employee selection', () => {
  it('combines normalized name, department, office and coverage constraints', () => {
    expect(
      filterEmployees(
        employees,
        { searchText: ' AHMED ', department: 'Engineering', officeId: 2 },
        [1, 3],
      ).map((item) => item.id),
    ).toEqual([3]);
  });
  it('distinguishes no coverage from an active coverage area with zero employees', () => {
    expect(filterEmployees(employees, EMPTY_FILTERS, null)).toHaveLength(3);
    expect(filterEmployees(employees, EMPTY_FILTERS, [])).toEqual([]);
  });
});
