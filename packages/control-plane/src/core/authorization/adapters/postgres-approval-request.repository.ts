import type { Kysely } from 'kysely';

import {
  createActorRef,
  type ActorRef,
} from '../../actors/index.js';
import type {
  ActionRequestId,
} from '../../actions/domain/action-request.js';
import type { Database } from '../../../infrastructure/postgres/database.js';
import type {
  ApprovalRequest,
  ApprovalRequestId,
  ApprovalRequestStatus,
} from '../domain/approval-request.js';
import type { ApprovalRequestRepository } from '../ports/approval-request-repository.port.js';

export class PostgresApprovalRequestRepository
  implements ApprovalRequestRepository
{
  constructor(
    private readonly database: Kysely<Database>,
  ) {}

  async save(
    approval: ApprovalRequest,
  ): Promise<void> {
    await this.database
      .insertInto(
        'authz.approval_requests',
      )
      .values({
        id: approval.id,
        action_request_id:
          approval.actionRequestId,
        status: approval.status,
        requested_at: approval.requestedAt,
        decided_at: approval.decidedAt,
        decided_by_kind:
          approval.decidedBy?.kind ?? null,
        decided_by_id:
          approval.decidedBy?.id ?? null,
      })
      .execute();
  }

  private map(row: {
    id: string;
    action_request_id: string;
    status: string;
    requested_at: Date;
    decided_at: Date | null;
    decided_by_kind: string | null;
    decided_by_id: string | null;
  }): ApprovalRequest {
    return {
      id: row.id as ApprovalRequestId,
      actionRequestId:
        row.action_request_id as ActionRequestId,
      status:
        row.status as ApprovalRequestStatus,
      requestedAt: row.requested_at,
      decidedAt: row.decided_at,
      decidedBy:
        row.decided_by_kind &&
        row.decided_by_id
          ? createActorRef({
              kind:
                row.decided_by_kind,
              id: row.decided_by_id,
            })
          : null,
    };
  }

  async findById(
    id: ApprovalRequestId,
  ): Promise<ApprovalRequest | null> {
    const row = await this.database
      .selectFrom(
        'authz.approval_requests',
      )
      .selectAll()
      .where('id', '=', id)
      .executeTakeFirst();

    return row ? this.map(row) : null;
  }

  async findByActionRequestId(
    actionRequestId: ActionRequestId,
  ): Promise<ApprovalRequest | null> {
    const row = await this.database
      .selectFrom(
        'authz.approval_requests',
      )
      .selectAll()
      .where(
        'action_request_id',
        '=',
        actionRequestId,
      )
      .executeTakeFirst();

    return row ? this.map(row) : null;
  }

  async decide(
    id: ApprovalRequestId,
    status: 'APPROVED' | 'REJECTED',
    decidedBy: ActorRef,
    decidedAt: Date,
  ): Promise<void> {
    await this.database
      .updateTable(
        'authz.approval_requests',
      )
      .set({
        status,
        decided_at: decidedAt,
        decided_by_kind:
          decidedBy.kind,
        decided_by_id:
          decidedBy.id,
      })
      .where('id', '=', id)
      .execute();
  }

  async listPending(): Promise<
    ApprovalRequest[]
  > {
    const rows =
      await this.database
        .selectFrom(
          'authz.approval_requests',
        )
        .selectAll()
        .where(
          'status',
          '=',
          'PENDING',
        )
        .orderBy(
          'requested_at',
          'asc',
        )
        .execute();

    return rows.map(
      (row) =>
        this.map(row),
    );
  }
}
