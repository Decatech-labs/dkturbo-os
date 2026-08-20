import type {
  Node,
  NodeId,
} from '../domain/node.js';

export interface NodeRepository {
  save(node: Node): Promise<void>;
  list(): Promise<Node[]>;
  findById(id: NodeId): Promise<Node | null>;
}
