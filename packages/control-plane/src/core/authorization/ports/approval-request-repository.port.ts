import type { ActorRef } from '../../actors/index.js';
import type { ActionRequestId } from '../../actions/domain/action-request.js';
import type {
  ApprovalRequest,
  ApprovalRequestId,
  ApprovalRequestStatus,
} from '../domain/approval-request.js';

export interface ApprovalRequestRepository {
  save(
    approval: ApprovalRequest,
  ): Promise<void>;

  findById(
    id: ApprovalRequestId,
  ): Promise<ApprovalRequest | null>;

  findByActionRequestId(
    actionRequestId: ActionRequestId,
  ): Promise<ApprovalRequest | null>;

  decide(
    id: ApprovalRequestId,
    status: Extract<
      ApprovalRequestStatus,
      'APPROVED' | 'REJECTED'
    >,
    decidedBy: ActorRef,
    decidedAt: Date,
  ): Promise<void>;

  listPending(): Promise<
    ApprovalRequest[]
  >;
}