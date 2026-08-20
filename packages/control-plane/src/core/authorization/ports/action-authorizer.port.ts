import type { ActorRef } from '../../actors/index.js';
import type { ActionKey } from '../../actions/domain/action-key.js';
import type { ResourceRef } from '../../resources/index.js';
import type { AuthorizationDecision } from '../domain/authorization-decision.js';

export interface AuthorizeActionInput {
  actor: ActorRef;
  actionKey: ActionKey;
  target: ResourceRef;
}

export interface ActionAuthorizer {
  authorize(
    input: AuthorizeActionInput,
  ): Promise<AuthorizationDecision>;
}
