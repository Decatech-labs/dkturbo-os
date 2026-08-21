import type { ActionDefinition } from '../domain/action-definition.js';
import {
  createActionKey,
  type ActionKey,
} from '../domain/action-key.js';

const definitions: Record<
  string,
  ActionDefinition
> = {
  'service.restart': {
    key: createActionKey(
      'service.restart',
    ),
    targetKind:
      'infra.service-instance',
    requiredCapability:
      'service.management',
  },
};

export class ActionDefinitionNotFoundError
  extends Error
{
  constructor(
    public readonly actionKey: ActionKey,
  ) {
    super(
      `Action definition not found: ${actionKey}`,
    );

    this.name =
      'ActionDefinitionNotFoundError';
  }
}

export const getActionDefinition = (
  actionKey: ActionKey,
): ActionDefinition => {
  const definition =
    definitions[actionKey];

  if (!definition) {
    throw new ActionDefinitionNotFoundError(
      actionKey,
    );
  }

  return definition;
};
