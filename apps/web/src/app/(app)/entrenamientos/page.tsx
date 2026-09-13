import {
  ArrowLeft,
  ArrowUpRight,
  Dumbbell,
  UserRound,
} from 'lucide-react';

import Link from 'next/link';

import {
  requireAccessPermission,
} from '../../../lib/access-server';

import {
  getTrainingAthletes,
} from '../../../lib/training-api';

import {
  redirect,
} from 'next/navigation';

export const dynamic =
  'force-dynamic';

export default async function TrainingPage() {

  await requireAccessPermission(
    'app.training.access',
  );

  const athletes =
    await getTrainingAthletes();

  if (
    athletes.length ===
    1
  ) {
    redirect(
      `/entrenamientos/${athletes[0]!.athlete.id}`,
    );
  }

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
            Planificación, ejecución y progreso deportivo.
          </p>
        </div>

      </header>

      {athletes.length === 0
        ? (
          <section className="training-empty">

            <div className="training-empty-icon">
              <Dumbbell />
            </div>

            <strong>
              No tienes atletas asignados
            </strong>

            <span>
              Cuando tengas acceso a un perfil deportivo aparecerá aquí.
            </span>

          </section>
        )
        : (
          <section className="training-athletes">

            <div className="training-section-heading">
              <h2>
                Atletas
              </h2>

              <span>
                {athletes.length}
              </span>
            </div>

            <div className="training-athlete-grid">

              {athletes.map(
                ({
                  athlete,
                  accessRole,
                }) => (
                  <Link
                    key={
                      athlete.id
                    }
                    href={
                      `/entrenamientos/${athlete.id}`
                    }
                    className="training-athlete-card"
                  >
                    <div className="training-athlete-icon">
                      <UserRound />
                    </div>

                    <div className="training-athlete-content">
                      <strong>
                        {athlete.displayName}
                      </strong>

                      <span>
                        {accessRole === 'SELF'
                          ? 'Tu perfil de entrenamiento'
                          : accessRole === 'COACH'
                            ? 'Perfil como entrenador'
                            : 'Perfil de solo lectura'}
                      </span>
                    </div>

                    <div className="training-athlete-arrow">
                      <ArrowUpRight />
                    </div>
                  </Link>
                ),
              )}

            </div>

          </section>
        )}

    </main>
  );
}
