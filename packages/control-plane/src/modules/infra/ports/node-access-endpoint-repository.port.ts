import type { NodeId } from '../domain/node.js';
import type {
  NodeAccessEndpoint,
  NodeAccessTransport,
} from '../domain/node-access-endpoint.js';

export interface NodeAccessEndpointRepository {
  save(
    endpoint: NodeAccessEndpoint,
  ): Promise<void>;

  findPreferred(
    nodeId: NodeId,
    transport: NodeAccessTransport,
  ): Promise<NodeAccessEndpoint | null>;

  listByNodeId(
    nodeId: NodeId,
  ): Promise<NodeAccessEndpoint[]>;
}
