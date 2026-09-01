import {
  ActionExecutionNotFoundError,
} from './execute-action-execution.js';

import type {
  ActionExecution,
  ActionExecutionId,
} from '../domain/action-execution.js';

import type {
  ActionExecutionRepository,
} from '../ports/action-execution-repository.port.js';

export class GetActionExecution {
  constructor(
    private readonly executions:
      ActionExecutionRepository,
  ) {}

  async execute(
    id:
      ActionExecutionId,
  ): Promise<
    ActionExecution
  > {
    const execution =
      await this.executions
        .findById(id);

    if (!execution) {
      throw new ActionExecutionNotFoundError(
        id,
      );
    }

    return execution;
  }
}
