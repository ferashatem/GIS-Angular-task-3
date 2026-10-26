export type Department = 'Engineering' | 'Sales' | 'Human Resources' | 'Operations';

export interface Employee {
  id: number;
  fullName: string;
  jobTitle: string;
  department: Department;
  email: string;
  phoneNumber: string;
  latitude: number;
  longitude: number;
  officeId: number;
}