import type { ResourceRef } from '../../resources/index.js';
import type { Clock } from '../../time/index.js';
import {
  createActionRequest,
  type ActionParameters,
  type ActionRequest,
} from '../domain/action-request.js';
import type { ActionRequestRepository } from '../ports/action-request-repository.port.js';

export interface RequestActionInput {
  actionKey: string;
  target: ResourceRef;
  parameters?: ActionParameters;
}

export class RequestAction {
  constructor(
    private readonly requests: ActionRequestRepository,
    private readonly clock: Clock,
  ) {}

  async execute(
    input: RequestActionInput,
  ): Promise<ActionRequest> {
    const request = createActionRequest({
      ...input,
      requestedAt: this.clock.now(),
    });

    await this.requests.save(request);

    return request;
  }
}
