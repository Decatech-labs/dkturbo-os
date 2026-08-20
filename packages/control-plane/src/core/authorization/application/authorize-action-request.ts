import { ActionRequestNotFoundError } from '../../actions/application/errors/action-request-not-found.error.js';
import type { ActionRequestId } from '../../actions/domain/action-request.js';
import type { ActionRequestRepository } from '../../actions/ports/action-request-repository.port.js';
import type { AuthorizationDecision } from '../domain/authorization-decision.js';
import type { ActionAuthorizer } from '../ports/action-authorizer.port.js';

export class AuthorizeActionRequest {
  constructor(
    private readonly requests: ActionRequestRepository,
    private readonly authorizer: ActionAuthorizer,
  ) {}

  async execute(
    actionRequestId: ActionRequestId,
  ): Promise<AuthorizationDecision> {
    const request =
      await this.requests.findById(
        actionRequestId,
      );

    if (!request) {
      throw new ActionRequestNotFoundError(
        actionRequestId,
      );
    }

    return this.authorizer.authorize({
      actor: request.requestedBy,
      actionKey: request.actionKey,
      target: request.target,
    });
  }
}
