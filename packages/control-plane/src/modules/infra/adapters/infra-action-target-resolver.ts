import type { ActionTargetResolver } from '../../../core/actions/ports/action-target-resolver.port.js';
import {
  createResourceRef,
  type ResourceRef,
} from '../../../core/resources/index.js';
import type { NodeId } from '../domain/node.js';
import type { ServiceInstanceId } from '../domain/service-instance.js';
import type { NodeRepository } from '../ports/node-repository.port.js';
import type { ServiceInstanceRepository } from '../ports/service-instance-repository.port.js';

export class InfraActionTargetResolver
  implements ActionTargetResolver
{
  constructor(
    private readonly nodes:
      NodeRepository,

    private readonly instances:
      ServiceInstanceRepository,
  ) {}

  async resolve(
    target: ResourceRef,
  ) {
    if (
      target.kind === 'infra.node'
    ) {
      const node =
        await this.nodes.findById(
          target.id as NodeId,
        );

      if (!node) {
        throw new Error(
          `Node not found: ${target.id}`,
        );
      }

      return {
        node:
          createResourceRef({
            kind: 'infra.node',
            id: node.id,
          }),
      };
    }

    if (
      target.kind ===
      'infra.service-instance'
    ) {
      const instance =
        await this.instances.findById(
          target.id as ServiceInstanceId,
        );

      if (!instance) {
        throw new Error(
          `Service instance not found: ${target.id}`,
        );
      }

      return {
        node:
          createResourceRef({
            kind: 'infra.node',
            id: instance.nodeId,
          }),
      };
    }

    throw new Error(
      `Unsupported action target: ${target.kind}`,
    );
  }
}
