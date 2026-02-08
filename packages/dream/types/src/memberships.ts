export interface OrganizationMembership {
  id: string;
  userId: string;
  organizationId: string;
  joinedAt: Date;
  invitedBy?: string;
}

export interface RoleAssignment {
  id: string;
  membershipId: string;
  roleId: string;
  isActive: boolean;
  assignedBy: string;
  assignedAt: Date;
}
