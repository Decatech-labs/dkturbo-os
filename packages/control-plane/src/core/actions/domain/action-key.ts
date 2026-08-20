export type ActionKey = string & {
  readonly __brand: 'ActionKey';
};

const ACTION_KEY_PATTERN =
  /^[a-z][a-z0-9]*(?:\.[a-z0-9]+)*$/;

export const createActionKey = (
  value: string,
): ActionKey => {
  const normalized = value.trim().toLowerCase();

  if (!ACTION_KEY_PATTERN.test(normalized)) {
    throw new Error(
      `Invalid action key: ${value}`,
    );
  }

  return normalized as ActionKey;
};
