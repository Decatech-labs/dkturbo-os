import { randomUUID } from 'node:crypto';

export type NodeId = string & {
  readonly __brand: 'NodeId';
};

export interface Node {
  id: NodeId;
  name: string;
  hostname: string;
  createdAt: Date;
}

export interface CreateNodeInput {
  name: string;
  hostname: string;
}

export const createNode = ({
  name,
  hostname,
}: CreateNodeInput): Node => {
  const normalizedName = name.trim();
  const normalizedHostname = hostname.trim();

  if (normalizedName.length === 0) {
    throw new Error('Node name cannot be empty');
  }

  if (normalizedHostname.length === 0) {
    throw new Error('Node hostname cannot be empty');
  }

  return {
    id: randomUUID() as NodeId,
    name: normalizedName,
    hostname: normalizedHostname,
    createdAt: new Date(),
  };
};
