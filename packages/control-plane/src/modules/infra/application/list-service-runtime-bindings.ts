import type {
  ServiceRuntimeBinding,
} from '../domain/service-runtime-binding.js';

import type {
  ServiceRuntimeBindingRepository,
} from '../ports/service-runtime-binding-repository.port.js';

export class ListServiceRuntimeBindings {
  constructor(
    private readonly bindings:
      ServiceRuntimeBindingRepository,
  ) {}

  async execute(): Promise<
    ServiceRuntimeBinding[]
  > {
    return this.bindings.list();
  }
}
