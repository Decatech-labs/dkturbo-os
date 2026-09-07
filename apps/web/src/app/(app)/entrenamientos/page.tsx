import {
  ArrowLeft,
  Dumbbell,
} from 'lucide-react';

import Link from 'next/link';

import {
  requireAccessPermission,
} from '../../../lib/access-server';

export const dynamic =
  'force-dynamic';

export default async function TrainingPage() {
  await requireAccessPermission(
    'app.training.access',
  );

  return (
    <main className="training-page">
      <header className="training-page-header">
        <Link
          href="/"
          className="system-back"
          aria-label="Volver al inicio"
        >
          <ArrowLeft />
        </Link>

        <div>
          <h1>
            Entrenamientos
          </h1>

          <p>
            Registro, progreso y rendimiento.
          </p>
        </div>
      </header>

      <section className="training-empty">
        <div className="training-empty-icon">
          <Dumbbell />
        </div>

        <strong>
          Tu registro empieza aquí
        </strong>

        <span>
          Todavía no hay entrenamientos registrados.
        </span>
      </section>
    </main>
  );
}
