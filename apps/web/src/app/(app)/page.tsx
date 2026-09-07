import {
  Bell,
  Search,
} from 'lucide-react';

import {
  getHomeApps,
} from '../../apps/registry';

import {
  AppCard,
} from '../../components/app-card';

import {
  requireCurrentSession,
} from '../../lib/auth-server';

import type {
  AccessPermissionKey,
  DkturboAppId,
} from '@dkturbo/contracts';

import {
  getCurrentAccessProfile,
  hasAccessPermission,
} from '../../lib/access-server';

const getFirstName = (
  name: string,
): string =>
  name
    .trim()
    .split(/\s+/)[0] ??
  name;

const appAccessPermission:
  Partial<
    Record<
      DkturboAppId,
      AccessPermissionKey
    >
  > = {
    system:
      'app.system.access',

    family:
      'app.family.access',

    files:
      'app.files.access',

    photos:
      'app.photos.access',

    automations:
      'app.automations.access',

    security:
      'app.security.access',
  };

export default async function HomePage() {
  const [
    allApps,
    session,
    access,
  ] =
    await Promise.all([
      Promise.resolve(
        getHomeApps(),
      ),

      requireCurrentSession(),

      getCurrentAccessProfile(),
    ]);

  const apps =
    access
      ? allApps.filter(
          (
            app,
          ) => {
            const permission =
              appAccessPermission[
                app.id as
                  DkturboAppId
              ];

            if (!permission) {
              return false;
            }

            return hasAccessPermission(
              access,
              permission,
            );
          },
        )
      : [];

  return (
    <main className="home">
      <header className="home-header">
        <div>
          <div className="home-welcome">
            Bienvenido
          </div>

          <h1 className="home-user">
            {getFirstName(
              session.user.name,
            )}
          </h1>
        </div>

        <div className="home-actions">
          <button
            type="button"
            className="circle-button"
            aria-label="Buscar"
          >
            <Search />
          </button>

          <button
            type="button"
            className="circle-button"
            aria-label="Notificaciones"
          >
            <Bell />
          </button>
        </div>
      </header>

      <section className="spaces-grid">
        {apps.map(
          (app) => (
            <AppCard
              key={app.id}
              app={app}
            />
          ),
        )}
      </section>
    </main>
  );
}
