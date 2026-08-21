import type { ResourceRef } from '../../resources/index.js';

export interface ActionCapabilityChecker {
  hasCapability(
    node: ResourceRef,
    capability: string,
  ): Promise<boolean>;
}
