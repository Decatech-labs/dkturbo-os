import type { ActionCapabilityChecker } from '../../../core/actions/ports/action-capability-checker.port.js';
import type { ResourceRef } from '../../../core/resources/index.js';
import {
  createCapabilityKey,
} from '../domain/node-capability.js';
import type { NodeId } from '../domain/node.js';
import type { NodeCapabilityRepository } from '../ports/node-capability-repository.port.js';

export class InfraActionCapabilityChecker
  implements ActionCapabilityChecker
{
  constructor(
    private readonly capabilities:
      NodeCapabilityRepository,
  ) {}

  async hasCapability(
    node: ResourceRef,
    capability: string,
  ): Promise<boolean> {
    if (node.kind !== 'infra.node') {
      return false;
    }

    return this.capabilities.exists(
      node.id as NodeId,
      createCapabilityKey(capability),
    );
  }
}
