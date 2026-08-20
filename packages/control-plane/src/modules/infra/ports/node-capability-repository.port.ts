import type {
  CapabilityKey,
  NodeCapability,
} from '../domain/node-capability.js';
import type { NodeId } from '../domain/node.js';

export interface NodeCapabilityRepository {
  save(
    capability: NodeCapability,
  ): Promise<void>;

  listByNodeId(
    nodeId: NodeId,
  ): Promise<NodeCapability[]>;

  exists(
    nodeId: NodeId,
    key: CapabilityKey,
  ): Promise<boolean>;
}
