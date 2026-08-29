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

const getFirstName = (
  name: string,
): string =>
  name
    .trim()
    .split(/\s+/)[0] ??
  name;

export default async function HomePage() {
  const [
    apps,
    session,
  ] = await Promise.all([
    Promise.resolve(
      getHomeApps(),
    ),

    requireCurrentSession(),
  ]);

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
