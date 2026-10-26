import { Department } from './employee.model';

export type CoverageDistanceKm = 2 | 5 | 10;

export const COVERAGE_DISTANCES: readonly CoverageDistanceKm[] = [2, 5, 10];

export interface EmployeeFilters {
  searchText: string;
  department: Department | null;
  officeId: number | null;
}

export const EMPTY_FILTERS: EmployeeFilters = {
  searchText: '',
  department: null,
  officeId: null,
};

export interface CoverageRequest {
  officeId: number;
  distanceKm: CoverageDistanceKm;
}

export interface CoverageResult {
  officeName: string;
  distanceKm: CoverageDistanceKm;
  employeeIds: number[];
}

export type LoadState = 'loading' | 'ready' | 'error';