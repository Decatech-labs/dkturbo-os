import type { ServiceInstance } from '../domain/service-instance.js';
import type { ServiceInstanceRepository } from '../ports/service-instance-repository.port.js';

export class ListServiceInstances {
  constructor(
    private readonly instances: ServiceInstanceRepository,
  ) {}

  async execute(): Promise<ServiceInstance[]> {
    return this.instances.list();
  }
}
