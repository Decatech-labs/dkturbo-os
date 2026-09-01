import {
  ActionRequestNotFoundError,
} from './errors/action-request-not-found.error.js';

import type {
  ActionRequest,
  ActionRequestId,
} from '../domain/action-request.js';

import type {
  ActionRequestRepository,
} from '../ports/action-request-repository.port.js';

export class GetActionRequest {
  constructor(
    private readonly requests:
      ActionRequestRepository,
  ) {}

  async execute(
    id: ActionRequestId,
  ): Promise<ActionRequest> {
    const request =
      await this.requests
        .findById(id);

    if (!request) {
      throw new ActionRequestNotFoundError(
        id,
      );
    }

    return request;
  }
}
