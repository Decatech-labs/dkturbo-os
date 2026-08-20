import type {
  ServiceInstance,
} from '../domain/service-instance.js';

export interface ServiceInstanceRepository {
  save(
    instance: ServiceInstance,
  ): Promise<void>;

  list(): Promise<ServiceInstance[]>;
}
