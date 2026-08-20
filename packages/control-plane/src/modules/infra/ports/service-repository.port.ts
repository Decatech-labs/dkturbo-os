import type {
  Service,
  ServiceId,
} from '../domain/service.js';

export interface ServiceRepository {
  save(service: Service): Promise<void>;
  list(): Promise<Service[]>;
  findById(
    id: ServiceId,
  ): Promise<Service | null>;
}
