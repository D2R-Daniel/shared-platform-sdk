export type InvitationType = 'organization' | 'team' | 'product';
export type InvitationStatus = 'pending' | 'accepted' | 'expired' | 'revoked';

export interface Invitation {
  id: string;
  organizationId: string;
  inviterId: string;
  inviteeEmail: string;
  type: InvitationType;
  teamId?: string;
  roleId: string;
  status: InvitationStatus;
  token: string;
  expiresAt: Date;
  acceptedAt?: Date;
  createdAt: Date;
}
