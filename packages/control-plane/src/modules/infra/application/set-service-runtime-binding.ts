import type {
  Clock,
} from '../../../core/time/index.js';

import type {
  ServiceInstanceId,
} from '../domain/service-instance.js';

import {
  createServiceRuntimeBinding,
  type ServiceRuntimeBinding,
  type ServiceRuntimeKind,
} from '../domain/service-runtime-binding.js';

import type {
  ServiceInstanceRepository,
} from '../ports/service-instance-repository.port.js';

import type {
  ServiceRuntimeBindingRepository,
} from '../ports/service-runtime-binding-repository.port.js';

export interface SetServiceRuntimeBindingInput {
  serviceInstanceId:
    ServiceInstanceId;

  runtimeKind:
    ServiceRuntimeKind;

  resourceName: string;
}

export class SetServiceRuntimeBinding {
  constructor(
    private readonly instances:
      ServiceInstanceRepository,

    private readonly bindings:
      ServiceRuntimeBindingRepository,

    private readonly clock:
      Clock,
  ) {}

  async execute({
    serviceInstanceId,
    runtimeKind,
    resourceName,
  }: SetServiceRuntimeBindingInput): Promise<
    ServiceRuntimeBinding
  > {
    const instance =
      await this.instances
        .findById(
          serviceInstanceId,
        );

    if (!instance) {
      throw new Error(
        `Service instance not found: ${serviceInstanceId}`,
      );
    }

    const binding =
      createServiceRuntimeBinding({
        serviceInstanceId,
        runtimeKind,
        resourceName,
        createdAt:
          this.clock.now(),
      });

    await this.bindings.save(
      binding,
    );

    return binding;
  }
}
