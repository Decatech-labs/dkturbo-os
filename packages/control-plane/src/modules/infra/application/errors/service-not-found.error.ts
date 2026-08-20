import type { ServiceId } from '../../domain/service.js';

export class ServiceNotFoundError extends Error {
  constructor(
    public readonly serviceId: ServiceId,
  ) {
    super(`Service not found: ${serviceId}`);

    this.name = 'ServiceNotFoundError';
  }
}
