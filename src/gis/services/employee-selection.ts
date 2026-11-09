import { Employee, EmployeeFilters } from '../models';

/** Pure filtering keeps the list and map driven by exactly the same records. */
export function filterEmployees(
  employees: Employee[],
  filters: EmployeeFilters,
  coverageIds: number[] | null,
): Employee[] {
  const search = filters.searchText.trim().toLocaleLowerCase();
  const inside = coverageIds === null ? null : new Set(coverageIds);
  return employees.filter(
    (employee) =>
      employee.fullName.toLocaleLowerCase().includes(search) &&
      (!filters.department || employee.department === filters.department) &&
      (filters.officeId === null || employee.officeId === filters.officeId) &&
      (inside === null || inside.has(employee.id)),
  );
}
