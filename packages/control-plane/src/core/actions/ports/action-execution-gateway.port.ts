import type { ActionKey } from '../domain/action-key.js';
import type {
  ActionExecutionResult,
} from '../domain/action-execution.js';
import type {
  ActionParameters,
} from '../domain/action-request.js';

export interface ExecuteActionInput {
  actionKey: ActionKey;
  nodeId: string;
  parameters: ActionParameters;
}

export interface ActionExecutionGateway {
  execute(
    input: ExecuteActionInput,
  ): Promise<ActionExecutionResult>;
}
