import type { ActionExecution } from '../domain/action-execution.js';

export interface ActionExecutionRepository {
  save(
    execution: ActionExecution,
  ): Promise<void>;
}
