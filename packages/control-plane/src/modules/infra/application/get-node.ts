import type {
  Node,
  NodeId,
} from '../domain/node.js';
import type { NodeRepository } from '../ports/node-repository.port.js';
import { NodeNotFoundError } from './errors/node-not-found.error.js';

export class GetNode {
  constructor(
    private readonly nodes: NodeRepository,
  ) {}

  async execute(id: NodeId): Promise<Node> {
    const node = await this.nodes.findById(id);

    if (!node) {
      throw new NodeNotFoundError(id);
    }

    return node;
  }
}
