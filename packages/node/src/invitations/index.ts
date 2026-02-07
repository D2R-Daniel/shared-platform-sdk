/**
 * Invitations module for user onboarding and team invites.
 */

export { InvitationClient } from './client';
export type { InvitationClientConfig } from './client';

export type {
  Invitation,
  InvitationSummary,
  InvitationStatus,
  InvitationType,
  ValidatedInvitation,
  CreateInvitationRequest,
  BulkInvitationRequest,
  BulkInvitationResult,
  BulkInvitationFailure,
  AcceptInvitationRequest,
  AcceptInvitationResponse,
  ResendInvitationRequest,
  CleanupRequest,
  CleanupResult,
  InvitationListResponse,
  ListInvitationsParams,
  Pagination,
} from './types';

export {
  InvitationError,
  InvitationNotFoundError,
  TokenNotFoundError,
  TokenExpiredError,
  TokenRevokedError,
  InvitationAlreadyAcceptedError,
  ActiveInvitationExistsError,
  ResendCooldownError,
} from './errors';
