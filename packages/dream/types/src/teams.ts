export interface Team {
  id: string;
  name: string;
  slug: string;
  organizationId: string;
  ownerId: string;
  parentTeamId?: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export type TeamMemberRole = 'owner' | 'admin' | 'member';

export interface TeamMember {
  id: string;
  teamId: string;
  userId: string;
  role: TeamMemberRole;
  joinedAt: Date;
  invitedBy?: string;
}

export interface TeamCreateInput {
  name: string;
  slug: string;
  organizationId: string;
  ownerId: string;
  parentTeamId?: string;
  metadata?: Record<string, unknown>;
}
