import type {
  ActionRequest,
} from '../domain/action-request.js';
import type { ActionRequestRepository } from '../ports/action-request-repository.port.js';

export class ListActionRequests {
  constructor(
    private readonly requests: ActionRequestRepository,
  ) {}

  async execute(): Promise<ActionRequest[]> {
    return this.requests.list();
  }
}
