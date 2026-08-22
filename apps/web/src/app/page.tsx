import {
  Bell,
  Search,
} from 'lucide-react';

import {
  getHomeApps,
} from '../apps/registry';

import {
  AppCard,
} from '../components/app-card';

export default function HomePage() {
  const apps =
    getHomeApps();

  return (
    <main className="home">
      <header className="home-header">
        <div>
          <div className="home-welcome">
            Bienvenido
          </div>

          <h1 className="home-user">
            Owner
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

          <button
            type="button"
            className="profile-button"
            aria-label="Perfil"
          >
            DK
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
