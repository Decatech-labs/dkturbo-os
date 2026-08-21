import {
  createApprovalRequest,
  type ApprovalRequest,
} from '../../authorization/domain/approval-request.js';
import type { ActionAuthorizer } from '../../authorization/ports/action-authorizer.port.js';
import type { ApprovalRequestRepository } from '../../authorization/ports/approval-request-repository.port.js';
import type { Clock } from '../../time/index.js';
import type { ActionExecution } from '../domain/action-execution.js';
import type { ActionRequestId } from '../domain/action-request.js';
import type { ActionRequestRepository } from '../ports/action-request-repository.port.js';
import { ActionRequestNotFoundError } from './errors/action-request-not-found.error.js';
import type { PrepareActionExecution } from './prepare-action-execution.js';

export type ProcessActionRequestResult =
  | {
      outcome: 'DENIED';
    }
  | {
      outcome: 'STEP_UP_REQUIRED';
    }
  | {
      outcome: 'APPROVAL_REQUIRED';
      approval: ApprovalRequest;
    }
  | {
      outcome: 'READY';
      execution: ActionExecution;
    };

export class ProcessActionRequest {
  constructor(
    private readonly requests:
      ActionRequestRepository,
    private readonly authorizer:
      ActionAuthorizer,
    private readonly approvals:
      ApprovalRequestRepository,
    private readonly prepareExecution:
      PrepareActionExecution,
    private readonly clock: Clock,
  ) {}

  async execute(
    id: ActionRequestId,
  ): Promise<ProcessActionRequestResult> {
    const request =
      await this.requests.findById(id);

    if (!request) {
      throw new ActionRequestNotFoundError(id);
    }

    const decision =
      await this.authorizer.authorize({
        actor: request.requestedBy,
        actionKey: request.actionKey,
        target: request.target,
      });

    if (decision.outcome === 'DENY') {
      await this.requests.updateStatus(
        id,
        'DENIED',
      );

      return {
        outcome: 'DENIED',
      };
    }

    if (
      decision.outcome ===
      'STEP_UP_REQUIRED'
    ) {
      return {
        outcome: 'STEP_UP_REQUIRED',
      };
    }

    if (
      decision.outcome ===
      'APPROVAL_REQUIRED'
    ) {
      let approval =
        await this.approvals.findByActionRequestId(
          id,
        );

      if (!approval) {
        approval =
          createApprovalRequest(
            id,
            this.clock.now(),
          );

        await this.approvals.save(
          approval,
        );
      }

      await this.requests.updateStatus(
        id,
        'AWAITING_APPROVAL',
      );

      return {
        outcome: 'APPROVAL_REQUIRED',
        approval,
      };
    }

    const execution =
      await this.prepareExecution.execute(
        request,
      );

    await this.requests.updateStatus(
      id,
      'READY',
    );

    return {
      outcome: 'READY',
      execution,
    };
  }
}
