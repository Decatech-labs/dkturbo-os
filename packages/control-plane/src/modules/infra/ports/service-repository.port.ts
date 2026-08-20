import type { Service } from '../domain/service.js';

export interface ServiceRepository {
  save(service: Service): Promise<void>;
  list(): Promise<Service[]>;
}
