import type { LucideIcon } from 'lucide-react';

import {
  ArrowUpRight,
  Bell,
  Bot,
  Folder,
  ImageIcon,
  Search,
  Server,
  Shield,
  Users,
} from 'lucide-react';

interface SpaceItem {
  title: string;
  description: string;
  icon: LucideIcon;
  tone:
    | 'blue'
    | 'yellow'
    | 'peach'
    | 'lavender'
    | 'mint'
    | 'rose';
}

const spaces: SpaceItem[] = [
  {
    title: 'Sistema',
    description:
      'Servidor, red y estado de casa.',
    icon: Server,
    tone: 'blue',
  },
  {
    title: 'Familia',
    description:
      'Personas, permisos y acceso.',
    icon: Users,
    tone: 'lavender',
  },
  {
    title: 'Archivos',
    description:
      'Documentos, copias y almacenamiento.',
    icon: Folder,
    tone: 'yellow',
  },
  {
    title: 'Fotos',
    description:
      'Biblioteca familiar y recuerdos.',
    icon: ImageIcon,
    tone: 'peach',
  },
  {
    title: 'Automatizaciones',
    description:
      'Rutinas, acciones y tareas automáticas.',
    icon: Bot,
    tone: 'mint',
  },
  {
    title: 'Seguridad',
    description:
      'Protección, accesos y revisiones.',
    icon: Shield,
    tone: 'rose',
  },
];

const SpaceCard = ({
  item,
}: {
  item: SpaceItem;
}) => {
  const Icon = item.icon;

  return (
    <button
      type="button"
      className={`space-card space-card-${item.tone}`}
    >
      <div className="space-card-top">
        <div className="space-card-icon">
          <Icon />
        </div>

        <div className="space-card-arrow">
          <ArrowUpRight />
        </div>
      </div>

      <div className="space-card-content">
        <h2 className="space-card-title">
          {item.title}
        </h2>

        <p className="space-card-description">
          {item.description}
        </p>
      </div>
    </button>
  );
};

export default function HomePage() {
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
        {spaces.map((item) => (
          <SpaceCard
            key={item.title}
            item={item}
          />
        ))}
      </section>
    </main>
  );
}
