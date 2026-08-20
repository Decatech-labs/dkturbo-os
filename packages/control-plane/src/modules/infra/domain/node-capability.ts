import type { NodeId } from './node.js';

export type CapabilityKey = string & {
  readonly __brand: 'CapabilityKey';
};

export interface NodeCapability {
  nodeId: NodeId;
  key: CapabilityKey;
  registeredAt: Date;
}

const CAPABILITY_KEY_PATTERN =
  /^[a-z][a-z0-9]*(?:\.[a-z0-9]+)*$/;

export const createCapabilityKey = (
  value: string,
): CapabilityKey => {
  const normalized = value.trim().toLowerCase();

  if (!CAPABILITY_KEY_PATTERN.test(normalized)) {
    throw new Error(
      `Invalid capability key: ${value}`,
    );
  }

  return normalized as CapabilityKey;
};

export const createNodeCapability = (
  nodeId: NodeId,
  key: CapabilityKey,
  registeredAt: Date,
): NodeCapability => ({
  nodeId,
  key,
  registeredAt,
});
