import {
  ArrowUpRight,
} from 'lucide-react';

import Link from 'next/link';

import type {
  DkturboAppManifest,
} from '../apps/app-manifest';

export interface AppCardProps {
  app:
    DkturboAppManifest;
}

export const AppCard = ({
  app,
}: AppCardProps) => {
  const Icon =
    app.icon;

  return (
    <Link
      href={app.route}
      className={`space-card space-card-${app.tone}`}
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
          {app.name}
        </h2>

        <p className="space-card-description">
          {app.description}
        </p>
      </div>
    </Link>
  );
};
