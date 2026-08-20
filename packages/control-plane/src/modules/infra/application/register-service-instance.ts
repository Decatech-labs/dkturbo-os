import { NodeNotFoundError } from './errors/node-not-found.error.js';
import { ServiceNotFoundError } from './errors/service-not-found.error.js';
import {
  createServiceInstance,
  type ServiceInstance,
} from '../domain/service-instance.js';
import type { NodeId } from '../domain/node.js';
import type { ServiceId } from '../domain/service.js';
import type { Clock } from '../../../core/time/index.js';
import type { NodeRepository } from '../ports/node-repository.port.js';
import type { ServiceInstanceRepository } from '../ports/service-instance-repository.port.js';
import type { ServiceRepository } from '../ports/service-repository.port.js';

export interface RegisterServiceInstanceInput {
  key: string;
  serviceId: ServiceId;
  nodeId: NodeId;
  environment: string;
}

export class RegisterServiceInstance {
  constructor(
    private readonly nodes: NodeRepository,
    private readonly services: ServiceRepository,
    private readonly instances: ServiceInstanceRepository,
    private readonly clock: Clock,
  ) {}

  async execute(
    input: RegisterServiceInstanceInput,
  ): Promise<ServiceInstance> {
    const service = await this.services.findById(
      input.serviceId,
    );

    if (!service) {
      throw new ServiceNotFoundError(
        input.serviceId,
      );
    }

    const node = await this.nodes.findById(
      input.nodeId,
    );

    if (!node) {
      throw new NodeNotFoundError(
        input.nodeId,
      );
    }

    const instance = createServiceInstance({
      ...input,
      createdAt: this.clock.now(),
    });

    await this.instances.save(instance);

    return instance;
  }
}
