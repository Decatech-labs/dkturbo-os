export type ActorKind = string & {
  readonly __brand: 'ActorKind';
};

export interface ActorRef {
  kind: ActorKind;
  id: string;
}

const ACTOR_KIND_PATTERN =
  /^[a-z][a-z0-9]*(?:[.-][a-z0-9]+)*$/;

export const createActorRef = ({
  kind,
  id,
}: {
  kind: string;
  id: string;
}): ActorRef => {
  const normalizedKind = kind.trim().toLowerCase();
  const normalizedId = id.trim();

  if (!ACTOR_KIND_PATTERN.test(normalizedKind)) {
    throw new Error(`Invalid actor kind: ${kind}`);
  }

  if (normalizedId.length === 0) {
    throw new Error('Actor id cannot be empty');
  }

  return {
    kind: normalizedKind as ActorKind,
    id: normalizedId,
  };
};
