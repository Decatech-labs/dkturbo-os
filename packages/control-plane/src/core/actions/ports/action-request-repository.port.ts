import type {
  ActionRequest,
  ActionRequestId,
  ActionRequestStatus,
} from '../domain/action-request.js';

export interface ActionRequestRepository {
  save(
    request: ActionRequest,
  ): Promise<void>;

  list(): Promise<ActionRequest[]>;

  findById(
    id: ActionRequestId,
  ): Promise<ActionRequest | null>;

  updateStatus(
    id: ActionRequestId,
    status: ActionRequestStatus,
  ): Promise<void>;
}