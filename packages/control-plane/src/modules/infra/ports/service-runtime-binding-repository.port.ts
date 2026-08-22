import type {
  ServiceInstanceId,
} from '../domain/service-instance.js';

import type {
  ServiceRuntimeBinding,
} from '../domain/service-runtime-binding.js';

export interface ServiceRuntimeBindingRepository {
  save(
    binding:
      ServiceRuntimeBinding,
  ): Promise<void>;

  findByServiceInstanceId(
    serviceInstanceId:
      ServiceInstanceId,
  ): Promise<
    ServiceRuntimeBinding | null
  >;

  list(): Promise<
    ServiceRuntimeBinding[]
  >;
}
