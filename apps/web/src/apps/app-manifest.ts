import type {
  LucideIcon,
} from 'lucide-react';

export type AppTone =
  | 'blue'
  | 'yellow'
  | 'peach'
  | 'lavender'
  | 'mint'
  | 'rose';

declare const appIdBrand:
  unique symbol;

export type AppId =
  string & {
    readonly [appIdBrand]:
      'AppId';
  };

export interface DkturboAppManifest {
  id: AppId;

  name: string;

  description: string;

  route: `/${string}`;

  icon: LucideIcon;

  tone: AppTone;

  enabled: boolean;

  showOnHome: boolean;

  order: number;
}

export const createAppId = (
  value: string,
): AppId => {
  const normalized =
    value.trim();

  if (
    !/^[a-z][a-z0-9-]*$/.test(
      normalized,
    )
  ) {
    throw new Error(
      `Invalid app id: ${value}`,
    );
  }

  return normalized as AppId;
};

export const defineApp = (
  manifest:
    DkturboAppManifest,
): DkturboAppManifest =>
  manifest;
