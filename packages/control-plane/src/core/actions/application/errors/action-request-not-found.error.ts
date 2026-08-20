import type { ActionRequestId } from '../../domain/action-request.js';

export class ActionRequestNotFoundError extends Error {
  constructor(
    public readonly actionRequestId: ActionRequestId,
  ) {
    super(
      `Action request not found: ${actionRequestId}`,
    );

    this.name = 'ActionRequestNotFoundError';
  }
}
