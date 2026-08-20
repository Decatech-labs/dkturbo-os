import {
  createNode,
  type Node,
} from '../domain/node.js';
import type { NodeRepository } from '../ports/node-repository.port.js';

export interface RegisterNodeInput {
  name: string;
  hostname: string;
}

export class RegisterNode {
  constructor(
    private readonly nodes: NodeRepository,
  ) {}

  async execute(input: RegisterNodeInput): Promise<Node> {
    const node = createNode(input);

    await this.nodes.save(node);

    return node;
  }
}
