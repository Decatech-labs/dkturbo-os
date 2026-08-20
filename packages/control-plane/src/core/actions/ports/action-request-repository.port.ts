import type {
  ActionRequest,
} from '../domain/action-request.js';

export interface ActionRequestRepository {
  save(
    request: ActionRequest,
  ): Promise<void>;

  list(): Promise<ActionRequest[]>;
}
