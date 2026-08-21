import type {
  ServiceInstance,
  ServiceInstanceId,
} from '../domain/service-instance.js';

export interface ServiceInstanceRepository {
  save(
    instance: ServiceInstance,
  ): Promise<void>;

  list(): Promise<ServiceInstance[]>;

  findById(
    id: ServiceInstanceId,
  ): Promise<ServiceInstance | null>;
}