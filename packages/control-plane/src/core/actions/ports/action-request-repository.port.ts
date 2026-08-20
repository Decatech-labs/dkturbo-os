import type {
  ActionRequest,
  ActionRequestId,
} from '../domain/action-request.js';

export interface ActionRequestRepository {
  save(
    request: ActionRequest,
  ): Promise<void>;

  list(): Promise<ActionRequest[]>;

  findById(
    id: ActionRequestId,
  ): Promise<ActionRequest | null>;
}