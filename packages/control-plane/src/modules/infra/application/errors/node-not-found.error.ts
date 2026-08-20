import type { NodeId } from '../../domain/node.js';

export class NodeNotFoundError extends Error {
  constructor(
    public readonly nodeId: NodeId,
  ) {
    super(`Node not found: ${nodeId}`);

    this.name = 'NodeNotFoundError';
  }
}
