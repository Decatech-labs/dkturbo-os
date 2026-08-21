import type {
  ActionExecution,
  ActionExecutionId,
  ActionExecutionResult,
} from '../domain/action-execution.js';

export interface ActionExecutionRepository {
  save(
    execution: ActionExecution,
  ): Promise<void>;

  findById(
    id: ActionExecutionId,
  ): Promise<ActionExecution | null>;

  markRunning(
    id: ActionExecutionId,
    startedAt: Date,
  ): Promise<void>;

  markSucceeded(
    id: ActionExecutionId,
    result: ActionExecutionResult,
    finishedAt: Date,
  ): Promise<void>;

  markFailed(
    id: ActionExecutionId,
    errorCode: string,
    errorMessage: string,
    finishedAt: Date,
  ): Promise<void>;
}
