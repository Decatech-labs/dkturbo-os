import type { Kysely } from 'kysely';

import type { Database } from '../../../../infrastructure/postgres/database.js';
import type { ActionExecution } from '../../domain/action-execution.js';
import type { ActionExecutionRepository } from '../../ports/action-execution-repository.port.js';

export class PostgresActionExecutionRepository
  implements ActionExecutionRepository
{
  constructor(
    private readonly database: Kysely<Database>,
  ) {}

  async save(
    execution: ActionExecution,
  ): Promise<void> {
    await this.database
      .insertInto(
        'actions.action_executions',
      )
      .values({
        id: execution.id,
        action_request_id:
          execution.actionRequestId,
        node_id: execution.nodeId,
        required_capability:
          execution.requiredCapability,
        status: execution.status,
        created_at: execution.createdAt,
      })
      .execute();
  }
}
