import type { Clock } from '../../time/index.js';
import {
  createActionExecution,
  type ActionExecution,
} from '../domain/action-execution.js';
import type { ActionRequest } from '../domain/action-request.js';
import type { ActionCapabilityChecker } from '../ports/action-capability-checker.port.js';
import type { ActionExecutionRepository } from '../ports/action-execution-repository.port.js';
import type { ActionTargetResolver } from '../ports/action-target-resolver.port.js';
import { getActionDefinition } from './get-action-definition.js';

export class RequiredCapabilityMissingError
  extends Error
{
  constructor(
    public readonly capability: string,
  ) {
    super(
      `Required capability missing: ${capability}`,
    );

    this.name =
      'RequiredCapabilityMissingError';
  }
}

export class PrepareActionExecution {
  constructor(
    private readonly targetResolver:
      ActionTargetResolver,
    private readonly capabilityChecker:
      ActionCapabilityChecker,
    private readonly executions:
      ActionExecutionRepository,
    private readonly clock: Clock,
  ) {}

  async execute(
    request: ActionRequest,
  ): Promise<ActionExecution> {
    const definition =
      getActionDefinition(
        request.actionKey,
      );

    if (
      request.target.kind !==
      definition.targetKind
    ) {
      throw new Error(
        'Action target kind mismatch',
      );
    }

    const resolved =
      await this.targetResolver.resolve(
        request.target,
      );

    const supported =
      await this.capabilityChecker.hasCapability(
        resolved.node,
        definition.requiredCapability,
      );

    if (!supported) {
      throw new RequiredCapabilityMissingError(
        definition.requiredCapability,
      );
    }

    const execution =
      createActionExecution({
        actionRequestId: request.id,
        nodeId: resolved.node.id,
        requiredCapability:
          definition.requiredCapability,
        createdAt: this.clock.now(),
      });

    await this.executions.save(
      execution,
    );

    return execution;
  }
}
