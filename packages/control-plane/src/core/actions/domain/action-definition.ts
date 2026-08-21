import type { ActionKey } from './action-key.js';

export interface ActionDefinition {
  key: ActionKey;
  targetKind: string;
  requiredCapability: string;
}
