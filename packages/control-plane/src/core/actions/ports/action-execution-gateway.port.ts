import type { ActionKey } from '../domain/action-key.js';
import type {
  ActionExecutionResult,
} from '../domain/action-execution.js';
import type {
  ActionParameters,
} from '../domain/action-request.js';
import type {
  ResourceRef,
} from '../../resources/index.js';

export interface ExecuteActionInput {
  actionKey: ActionKey;
  nodeId: string;
  parameters: ActionParameters;
  target: ResourceRef;
}

export interface ActionExecutionGateway {
  execute(
    input: ExecuteActionInput,
  ): Promise<ActionExecutionResult>;
}
