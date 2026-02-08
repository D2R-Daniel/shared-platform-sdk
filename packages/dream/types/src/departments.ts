export interface Department {
  id: string;
  name: string;
  organizationId: string;
  headUserId?: string;
  parentDepartmentId?: string;
  path: string;
  level: number;
  memberCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface DepartmentCreateInput {
  name: string;
  organizationId: string;
  headUserId?: string;
  parentDepartmentId?: string;
}
