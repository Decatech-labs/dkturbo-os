import type { ActionDefinition } from '../domain/action-definition.js';
import {
  createActionKey,
  type ActionKey,
} from '../domain/action-key.js';

const actionDefinitions = [
  {
    key: createActionKey(
      'service.restart',
    ),
    targetKind:
      'infra.service-instance',
    requiredCapability:
      'service.management',
  },

  {
    key: createActionKey(
      'node.system.info.read',
    ),
    targetKind: 'infra.node',
    requiredCapability:
      'system.metrics',
  },

  {
    key: createActionKey(
      'node.runtime.snapshot.read',
    ),
    targetKind: 'infra.node',
    requiredCapability:
      'system.metrics',
  },
] satisfies ActionDefinition[];

const definitions =
  new Map<ActionKey, ActionDefinition>(
    actionDefinitions.map(
      (definition) => [
        definition.key,
        definition,
      ],
    ),
  );

export class ActionDefinitionNotFoundError
  extends Error
{
  constructor(
    public readonly actionKey:
      ActionKey,
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
    definitions.get(actionKey);

  if (!definition) {
    throw new ActionDefinitionNotFoundError(
      actionKey,
    );
  }

  return definition;
};
