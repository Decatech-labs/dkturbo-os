import type { ResourceRef } from '../../resources/index.js';

export interface ResolvedActionTarget {
  node: ResourceRef;
}

export interface ActionTargetResolver {
  resolve(
    target: ResourceRef,
  ): Promise<ResolvedActionTarget>;
}
