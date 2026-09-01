import type {
  ApprovalRequest,
} from '../domain/approval-request.js';

import type {
  ApprovalRequestRepository,
} from '../ports/approval-request-repository.port.js';

export class ListPendingApprovalRequests {
  constructor(
    private readonly approvals:
      ApprovalRequestRepository,
  ) {}

  async execute(): Promise<
    ApprovalRequest[]
  > {
    return this.approvals
      .listPending();
  }
}
