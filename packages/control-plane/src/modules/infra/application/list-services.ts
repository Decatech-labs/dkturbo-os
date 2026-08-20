import type { Service } from '../domain/service.js';
import type { ServiceRepository } from '../ports/service-repository.port.js';

export class ListServices {
  constructor(
    private readonly services: ServiceRepository,
  ) {}

  async execute(): Promise<Service[]> {
    return this.services.list();
  }
}
