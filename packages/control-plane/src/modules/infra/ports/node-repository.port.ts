import type { Node } from '../domain/node.js';

export interface NodeRepository {
  save(node: Node): Promise<void>;
  list(): Promise<Node[]>;
}
