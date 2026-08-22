import type {
  AppId,
  DkturboAppManifest,
} from './app-manifest';

import {
  automationsApp,
} from './automations/manifest';

import {
  familyApp,
} from './family/manifest';

import {
  filesApp,
} from './files/manifest';

import {
  photosApp,
} from './photos/manifest';

import {
  securityApp,
} from './security/manifest';

import {
  systemApp,
} from './system/manifest';

const registeredApps =
  [
    systemApp,
    familyApp,
    filesApp,
    photosApp,
    automationsApp,
    securityApp,
  ] satisfies
    readonly DkturboAppManifest[];

const registry =
  new Map<
    AppId,
    DkturboAppManifest
  >();

for (
  const app of registeredApps
) {
  if (
    registry.has(app.id)
  ) {
    throw new Error(
      `Duplicate app id: ${app.id}`,
    );
  }

  registry.set(
    app.id,
    app,
  );
}

export const getApps = (
): readonly DkturboAppManifest[] =>
  [...registry.values()]
    .filter(
      (app) =>
        app.enabled,
    )
    .sort(
      (a, b) =>
        a.order -
        b.order,
    );

export const getHomeApps = (
): readonly DkturboAppManifest[] =>
  getApps().filter(
    (app) =>
      app.showOnHome,
  );

export const getAppById = (
  appId: AppId,
):
  | DkturboAppManifest
  | null =>
  registry.get(appId) ??
  null;
