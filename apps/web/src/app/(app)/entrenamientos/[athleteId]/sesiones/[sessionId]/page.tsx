import Link from 'next/link';

import {
  getTrainingSessionDetail,
} from '../../../../../../lib/training-api';

import {
  requireAccessPermission,
} from '../../../../../../lib/access-server';

import {
  ArrowLeft,
} from 'lucide-react';

interface PageProps {
  params: Promise<{
    athleteId: string;
    sessionId: string;
  }>;
}

const sessionTypeLabel = (
  type: string,
): string => {
  const labels: Record<
    string,
    string
  > = {
    STRENGTH: 'Fuerza',
    RUNNING: 'Carrera',
    SWIMMING: 'Natación',
    CYCLING: 'Ciclismo',
    POLE_VAULT: 'Pértiga',
    JUMPS: 'Saltos',
    THROWS: 'Lanzamientos',
    TECHNIQUE: 'Técnica',
    REHAB: 'Rehabilitación',
    MOBILITY: 'Movilidad',
    OTHER: 'Otro',
  };

  return (
    labels[type] ??
    type
  );
};

const formatDistance = (
  value: number | null,
): string | null =>
  value === null
    ? null
    : `${value} m`;

const formatDuration = (
  value: number | null,
): string | null => {
  if (value === null) {
    return null;
  }

  const totalSeconds =
    Math.round(
      value / 1000,
    );

  const minutes =
    Math.floor(
      totalSeconds / 60,
    );

  const seconds =
    totalSeconds % 60;

  return `${minutes}:${String(
    seconds,
  ).padStart(2, '0')}`;
};

const formatMetric = (
  label: string,
  planned: string | number | null,
  actual: string | number | null,
) => {
  if (
    planned === null &&
    actual === null
  ) {
    return null;
  }

  return {
    label,
    planned:
      planned ?? '—',
    actual:
      actual ?? '—',
  };
};

export default async function TrainingSessionPage(
  {
    params,
  }: PageProps,
) {
  await requireAccessPermission(
    'app.training.access',
  );

  const {
    athleteId,
    sessionId,
  } = await params;

  const detail =
    await getTrainingSessionDetail(
      athleteId,
      sessionId,
    );

  const {
    session,
    blocks,
    canWrite,
    accessRole,
  } = detail;

  return (
    <main className="training-page training-session-page">

      <header className="training-page-header training-session-header">

        <Link
          href={
            `/entrenamientos/${athleteId}`
          }
          className="system-back"
          aria-label="Volver a semanas"
        >
          <ArrowLeft />
        </Link>

        <div className="training-session-heading">

          <div className="training-session-heading-meta">

            <span>
              {sessionTypeLabel(
                session.type,
              )}
            </span>

            <span>
              {accessRole}
            </span>

            {!canWrite && (
              <span>
                Solo lectura
              </span>
            )}

          </div>

          <h1>
            {session.title ??
              sessionTypeLabel(
                session.type,
              )}
          </h1>

          <div className="training-session-summary">

            {session.plannedStartTime && (
              <span>
                {session.plannedStartTime}
              </span>
            )}

            {session.plannedDurationMinutes && (
              <span>
                {
                  session.plannedDurationMinutes
                } min
              </span>
            )}

          </div>

        </div>

      </header>

      <section className="training-session-blocks">

        {blocks.length === 0 ? (

          <div className="training-session-empty">
            Esta sesión todavía no tiene bloques.
          </div>

        ) : (

          blocks.map(
            ({
              block,
              exercises,
            }) => (

              <section
                key={block.id}
                className="training-session-block"
              >

                <header className="training-session-block-header">

                  <div>

                    <span className="training-session-block-index">
                      Bloque {block.position + 1}
                    </span>

                    <h2>
                      {block.title ??
                        'Bloque de entrenamiento'}
                    </h2>

                  </div>

                  <span>
                    {exercises.length}
                    {' '}
                    {exercises.length === 1
                      ? 'ejercicio'
                      : 'ejercicios'}
                  </span>

                </header>

                {block.notes && (
                  <p className="training-session-block-notes">
                    {block.notes}
                  </p>
                )}

                <div className="training-session-exercises">

                  {exercises.map(
                    ({
                      sessionExercise,
                      catalogItem,
                      performanceEntries,
                    }) => (

                      <article
                        key={
                          sessionExercise.id
                        }
                        className="training-session-exercise"
                      >

                        <div className="training-session-exercise-main">

                          <div className="training-session-exercise-name">

                            <strong>
                              {
                                catalogItem.name
                              }
                            </strong>

                            <span>
                              {
                                catalogItem.metricProfile
                              }
                            </span>

                          </div>

                          {sessionExercise.plannedNotes && (
                            <p>
                              {
                                sessionExercise.plannedNotes
                              }
                            </p>
                          )}

                        </div>

                        <div className="training-session-exercise-body">

                          {sessionExercise.plannedNotes && (
                            <p className="training-session-exercise-plan-note">
                              {sessionExercise.plannedNotes}
                            </p>
                          )}

                          {performanceEntries.length > 0 && (
                            <div className="training-performance-list">

                              <div className="training-performance-header">
                                <span />
                                <span>
                                  Planificado
                                </span>
                                <span>
                                  Realizado
                                </span>
                              </div>

                              {performanceEntries.map(
                                (
                                  entry,
                                  entryIndex,
                                ) => {
                                  const rows = [
                                    formatMetric(
                                      'Distancia',
                                      formatDistance(
                                        entry.plannedDistanceM,
                                      ),
                                      formatDistance(
                                        entry.actualDistanceM,
                                      ),
                                    ),

                                    formatMetric(
                                      'Tiempo',
                                      formatDuration(
                                        entry.plannedDurationMs,
                                      ),
                                      formatDuration(
                                        entry.actualDurationMs,
                                      ),
                                    ),

                                    formatMetric(
                                      'RPE',
                                      entry.plannedRpe,
                                      entry.actualRpe,
                                    ),

                                    formatMetric(
                                      'Descanso',
                                      entry.plannedRestSeconds === null
                                        ? null
                                        : `${entry.plannedRestSeconds} s`,
                                      entry.actualRestSeconds === null
                                        ? null
                                        : `${entry.actualRestSeconds} s`,
                                    ),
                                  ].filter(
                                    (
                                      row,
                                    ): row is {
                                      label: string;
                                      planned:
                                        string | number;
                                      actual:
                                        string | number;
                                    } =>
                                      row !== null,
                                  );

                                  return (
                                    <div
                                      key={entry.id}
                                      className="training-performance-entry"
                                    >

                                      {performanceEntries.length > 1 && (
                                        <div className="training-performance-entry-title">
                                          Serie {entryIndex + 1}
                                        </div>
                                      )}

                                      {rows.map(
                                        row => (
                                          <div
                                            key={row.label}
                                            className="training-performance-row"
                                          >
                                            <span>
                                              {row.label}
                                            </span>

                                            <strong>
                                              {row.planned}
                                            </strong>

                                            <strong>
                                              {row.actual}
                                            </strong>
                                          </div>
                                        ),
                                      )}

                                      {(
                                        entry.plannedNotes ||
                                        entry.actualNotes
                                      ) && (
                                        <div className="training-performance-notes">

                                          <div>
                                            <span>
                                              Plan
                                            </span>

                                            <p>
                                              {
                                                entry.plannedNotes ??
                                                '—'
                                              }
                                            </p>
                                          </div>

                                          <div>
                                            <span>
                                              Real
                                            </span>

                                            <p>
                                              {
                                                entry.actualNotes ??
                                                '—'
                                              }
                                            </p>
                                          </div>

                                        </div>
                                      )}

                                    </div>
                                  );
                                },
                              )}

                            </div>
                          )}

                          <div className="training-session-exercise-footer">

                            {catalogItem.origin ===
                              'CUSTOM' && (
                              <span className="training-custom-badge">
                                Personalizado
                              </span>
                            )}

                            <span>
                              {performanceEntries.length}
                              {' '}
                              {performanceEntries.length ===
                              1
                                ? 'registro'
                                : 'registros'}
                            </span>

                          </div>

                        </div>

                      </article>
                    ),
                  )}

                </div>

              </section>
            ),
          )

        )}

      </section>

    </main>
  );
}
