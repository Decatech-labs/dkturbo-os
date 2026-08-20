import type { Kysely } from 'kysely';

import {
  createResourceRef,
} from '../../../resources/index.js';
import type { Database } from '../../../../infrastructure/postgres/database.js';
import type {
  ActionParameters,
  ActionRequest,
  ActionRequestId,
  ActionRequestStatus,
} from '../../domain/action-request.js';
import type { ActionKey } from '../../domain/action-key.js';
import type { ActionRequestRepository } from '../../ports/action-request-repository.port.js';

export class PostgresActionRequestRepository
  implements ActionRequestRepository
{
  constructor(
    private readonly database: Kysely<Database>,
  ) {}

  async save(
    request: ActionRequest,
  ): Promise<void> {
    await this.database
      .insertInto('actions.action_requests')
      .values({
        id: request.id,
        action_key: request.actionKey,
        target_kind: request.target.kind,
        target_id: request.target.id,
        parameters: request.parameters,
        status: request.status,
        requested_at: request.requestedAt,
      })
      .execute();
  }

  async list(): Promise<ActionRequest[]> {
    const rows = await this.database
      .selectFrom('actions.action_requests')
      .selectAll()
      .orderBy('requested_at', 'asc')
      .execute();

    return rows.map((row) => ({
      id: row.id as ActionRequestId,
      actionKey: row.action_key as ActionKey,
      target: createResourceRef({
        kind: row.target_kind,
        id: row.target_id,
      }),
      parameters:
        row.parameters as ActionParameters,
      status:
        row.status as ActionRequestStatus,
      requestedAt: row.requested_at,
    }));
  }
}
