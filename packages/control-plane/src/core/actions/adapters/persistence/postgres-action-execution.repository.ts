import type { Kysely } from 'kysely';

import type { Database } from '../../../../infrastructure/postgres/database.js';
import type {
  ActionExecution,
  ActionExecutionId,
  ActionExecutionResult,
  ActionExecutionStatus,
} from '../../domain/action-execution.js';
import type { ActionRequestId } from '../../domain/action-request.js';
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
        started_at: execution.startedAt,
        finished_at: execution.finishedAt,
        result: execution.result,
        error_code: execution.errorCode,
        error_message:
          execution.errorMessage,
      })
      .execute();
  }

  async findById(
    id: ActionExecutionId,
  ): Promise<ActionExecution | null> {
    const row = await this.database
      .selectFrom(
        'actions.action_executions',
      )
      .selectAll()
      .where('id', '=', id)
      .executeTakeFirst();

    if (!row) {
      return null;
    }

    return {
      id: row.id as ActionExecutionId,

      actionRequestId:
        row.action_request_id as ActionRequestId,

      nodeId: row.node_id,

      requiredCapability:
        row.required_capability,

      status:
        row.status as ActionExecutionStatus,

      createdAt: row.created_at,
      startedAt: row.started_at,
      finishedAt: row.finished_at,

      result:
        row.result as
          | ActionExecutionResult
          | null,

      errorCode: row.error_code,

      errorMessage:
        row.error_message,
    };
  }

  async markRunning(
    id: ActionExecutionId,
    startedAt: Date,
  ): Promise<void> {
    await this.database
      .updateTable(
        'actions.action_executions',
      )
      .set({
        status: 'RUNNING',
        started_at: startedAt,
      })
      .where('id', '=', id)
      .execute();
  }

  async markSucceeded(
    id: ActionExecutionId,
    result: ActionExecutionResult,
    finishedAt: Date,
  ): Promise<void> {
    await this.database
      .updateTable(
        'actions.action_executions',
      )
      .set({
        status: 'SUCCEEDED',
        result,
        finished_at: finishedAt,
        error_code: null,
        error_message: null,
      })
      .where('id', '=', id)
      .execute();
  }

  async markFailed(
    id: ActionExecutionId,
    errorCode: string,
    errorMessage: string,
    finishedAt: Date,
  ): Promise<void> {
    await this.database
      .updateTable(
        'actions.action_executions',
      )
      .set({
        status: 'FAILED',
        finished_at: finishedAt,
        error_code: errorCode,
        error_message: errorMessage,
      })
      .where('id', '=', id)
      .execute();
  }
}
