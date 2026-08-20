import type { Node } from '../domain/node.js';
import type { NodeRepository } from '../ports/node-repository.port.js';

export class ListNodes {
  constructor(
    private readonly nodes: NodeRepository,
  ) {}

  async execute(): Promise<Node[]> {
    return this.nodes.list();
  }
}
