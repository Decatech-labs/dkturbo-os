import type { ActorRef } from '../../actors/index.js';
import type { PrepareActionExecution } from '../../actions/application/prepare-action-execution.js';
import type { ActionRequestRepository } from '../../actions/ports/action-request-repository.port.js';
import type {
  UserId,
} from '../../identity/domain/user.js';
import type { UserRepository } from '../../identity/ports/user-repository.port.js';
import type { Clock } from '../../time/index.js';
import type {
  ApprovalRequestId,
} from '../domain/approval-request.js';
import type { ApprovalRequestRepository } from '../ports/approval-request-repository.port.js';

export interface DecideApprovalInput {
  approvalRequestId: ApprovalRequestId;
  decision: 'APPROVE' | 'REJECT';
  decidedBy: ActorRef;
}

export class DecideApprovalRequest {
  constructor(
    private readonly approvals:
      ApprovalRequestRepository,
    private readonly requests:
      ActionRequestRepository,
    private readonly users:
      UserRepository,
    private readonly prepareExecution:
      PrepareActionExecution,
    private readonly clock: Clock,
  ) {}

  async execute(
    input: DecideApprovalInput,
  ) {
    if (
      input.decidedBy.kind !== 'user'
    ) {
      throw new Error(
        'Only a user can decide an approval request',
      );
    }

    const decider =
      await this.users.findById(
        input.decidedBy.id as UserId,
      );

    if (
      !decider ||
      decider.role !== 'owner'
    ) {
      throw new Error(
        'Only the owner can decide an approval request',
      );
    }

    const approval =
      await this.approvals.findById(
        input.approvalRequestId,
      );

    if (!approval) {
      throw new Error(
        'Approval request not found',
      );
    }

    if (
      approval.status !== 'PENDING'
    ) {
      throw new Error(
        'Approval request already decided',
      );
    }

    const request =
      await this.requests.findById(
        approval.actionRequestId,
      );

    if (!request) {
      throw new Error(
        'Action request not found',
      );
    }

    if (
      input.decision === 'REJECT'
    ) {
      await this.approvals.decide(
        approval.id,
        'REJECTED',
        input.decidedBy,
        this.clock.now(),
      );

      await this.requests.updateStatus(
        request.id,
        'DENIED',
      );

      return {
        outcome: 'REJECTED' as const,
      };
    }

    const execution =
      await this.prepareExecution.execute(
        request,
      );

    await this.approvals.decide(
      approval.id,
      'APPROVED',
      input.decidedBy,
      this.clock.now(),
    );

    await this.requests.updateStatus(
      request.id,
      'READY',
    );

    return {
      outcome: 'APPROVED' as const,
      execution,
    };
  }
}
