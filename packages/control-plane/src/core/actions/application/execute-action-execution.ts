import type {
  Clock,
} from '../../time/clock.port.js';
import type {
  ActionExecution,
  ActionExecutionId,
} from '../domain/action-execution.js';
import type {
  ActionExecutionGateway,
} from '../ports/action-execution-gateway.port.js';
import type {
  ActionExecutionRepository,
} from '../ports/action-execution-repository.port.js';
import type {
  ActionRequestRepository,
} from '../ports/action-request-repository.port.js';

export class ActionExecutionNotFoundError
  extends Error
{
  constructor(
    readonly executionId:
      ActionExecutionId,
  ) {
    super(
      `Action execution not found: ${executionId}`,
    );
  }
}

export class ActionExecutionNotPendingError
  extends Error
{
  constructor(
    readonly execution:
      ActionExecution,
  ) {
    super(
      `Action execution ${execution.id} is ${execution.status}`,
    );
  }
}

export class ExecuteActionExecution {
  constructor(
    private readonly executions:
      ActionExecutionRepository,

    private readonly actionRequests:
      ActionRequestRepository,

    private readonly gateway:
      ActionExecutionGateway,

    private readonly clock:
      Clock,
  ) {}

  async execute(
    executionId: ActionExecutionId,
  ): Promise<ActionExecution> {
    const execution =
      await this.executions.findById(
        executionId,
      );

    if (!execution) {
      throw new ActionExecutionNotFoundError(
        executionId,
      );
    }

    if (
      execution.status !==
      'PENDING'
    ) {
      throw new ActionExecutionNotPendingError(
        execution,
      );
    }

    const actionRequest =
      await this.actionRequests.findById(
        execution.actionRequestId,
      );

    if (!actionRequest) {
      throw new Error(
        `Action request not found for execution ${execution.id}`,
      );
    }

    const startedAt =
      this.clock.now();

    await this.executions.markRunning(
      execution.id,
      startedAt,
    );

    try {
      const result =
        await this.gateway.execute({
          actionKey:
            actionRequest.actionKey,

          nodeId:
            execution.nodeId,

          parameters:
            actionRequest.parameters,
        });

      const finishedAt =
        this.clock.now();

      await this.executions.markSucceeded(
        execution.id,
        result,
        finishedAt,
      );
    } catch (error) {
      const finishedAt =
        this.clock.now();

      const message =
        error instanceof Error
          ? error.message
          : 'Unknown execution error';

      await this.executions.markFailed(
        execution.id,
        'execution_failed',
        message,
        finishedAt,
      );
    }

    const updated =
      await this.executions.findById(
        execution.id,
      );

    if (!updated) {
      throw new Error(
        `Action execution disappeared: ${execution.id}`,
      );
    }

    return updated;
  }
}
