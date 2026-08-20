export type ResourceKind = string & {
  readonly __brand: 'ResourceKind';
};

export interface ResourceRef {
  kind: ResourceKind;
  id: string;
}

const RESOURCE_KIND_PATTERN =
  /^[a-z][a-z0-9]*(?:[.-][a-z0-9]+)*$/;

export const createResourceKind = (
  value: string,
): ResourceKind => {
  const normalized = value.trim().toLowerCase();

  if (!RESOURCE_KIND_PATTERN.test(normalized)) {
    throw new Error(
      `Invalid resource kind: ${value}`,
    );
  }

  return normalized as ResourceKind;
};

export interface CreateResourceRefInput {
  kind: string;
  id: string;
}

export const createResourceRef = ({
  kind,
  id,
}: CreateResourceRefInput): ResourceRef => {
  const normalizedId = id.trim();

  if (normalizedId.length === 0) {
    throw new Error(
      'Resource id cannot be empty',
    );
  }

  return {
    kind: createResourceKind(kind),
    id: normalizedId,
  };
};

export const resourceRefsEqual = (
  left: ResourceRef,
  right: ResourceRef,
): boolean => {
  return (
    left.kind === right.kind &&
    left.id === right.id
  );
};

export const serializeResourceRef = (
  ref: ResourceRef,
): string => {
  return `${ref.kind}:${ref.id}`;
};
