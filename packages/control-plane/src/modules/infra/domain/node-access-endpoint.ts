import { randomUUID } from 'node:crypto';

import type { NodeId } from './node.js';

export type NodeAccessEndpointId =
  string & {
    readonly __brand:
      'NodeAccessEndpointId';
  };

export type NodeAccessTransport =
  'ssh';

export interface NodeAccessEndpoint {
  id: NodeAccessEndpointId;
  nodeId: NodeId;
  transport: NodeAccessTransport;
  label: string;
  host: string;
  port: number;
  username: string;
  priority: number;
  enabled: boolean;
  createdAt: Date;
}

export const createNodeAccessEndpoint = (
  input: {
    nodeId: NodeId;
    transport: NodeAccessTransport;
    label: string;
    host: string;
    port?: number;
    username: string;
    priority?: number;
    enabled?: boolean;
    createdAt: Date;
  },
): NodeAccessEndpoint => {
  const label = input.label.trim();
  const host = input.host.trim();
  const username =
    input.username.trim();

  const port = input.port ?? 22;

  if (!label) {
    throw new Error(
      'Node access endpoint label is required',
    );
  }

  if (!host) {
    throw new Error(
      'Node access endpoint host is required',
    );
  }

  if (!username) {
    throw new Error(
      'Node access endpoint username is required',
    );
  }

  if (
    !Number.isInteger(port) ||
    port < 1 ||
    port > 65535
  ) {
    throw new Error(
      'Invalid node access endpoint port',
    );
  }

  return {
    id:
      randomUUID() as NodeAccessEndpointId,

    nodeId: input.nodeId,
    transport: input.transport,
    label,
    host,
    port,
    username,

    priority:
      input.priority ?? 100,

    enabled:
      input.enabled ?? true,

    createdAt: input.createdAt,
  };
};
