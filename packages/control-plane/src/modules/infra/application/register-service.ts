import {
  createService,
  type Service,
} from '../domain/service.js';
import type { Clock } from '../../../core/time/index.js';
import type { ServiceRepository } from '../ports/service-repository.port.js';

export interface RegisterServiceInput {
  key: string;
  name: string;
}

export class RegisterService {
  constructor(
    private readonly services: ServiceRepository,
    private readonly clock: Clock,
  ) {}

  async execute(
    input: RegisterServiceInput,
  ): Promise<Service> {
    const service = createService({
      ...input,
      createdAt: this.clock.now(),
    });

    await this.services.save(service);

    return service;
  }
}
