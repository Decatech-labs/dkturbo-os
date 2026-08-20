import type { AuthorizationDecision } from '../domain/authorization-decision.js';
import type {
  ActionAuthorizer,
  AuthorizeActionInput,
} from '../ports/action-authorizer.port.js';

export class DenyByDefaultActionAuthorizer
  implements ActionAuthorizer
{
  async authorize(
    _input: AuthorizeActionInput,
  ): Promise<AuthorizationDecision> {
    return {
      outcome: 'DENY',
      reason: 'authorization_policy_not_configured',
    };
  }
}
