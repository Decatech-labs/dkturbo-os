export type AuthorizationOutcome =
  | 'ALLOW'
  | 'DENY'
  | 'STEP_UP_REQUIRED'
  | 'APPROVAL_REQUIRED';

export interface AuthorizationDecision {
  outcome: AuthorizationOutcome;
  reason: string;
}
