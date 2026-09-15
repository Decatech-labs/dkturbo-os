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

import {
  NewBlockControl,
} from './new-block-control';

import {
  AddExerciseControl,
} from './add-exercise-control';

import {
  AddPerformanceEntryControl,
} from './add-performance-entry-control';

import {
  PerformanceEntryTable,
} from './performance-entry-table';

import {
  SessionBlockList,
} from './session-block-list';

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

  const nextBlockPosition =
    blocks.length === 0
      ? 0
      : Math.max(
          ...blocks.map(
            ({
              block,
            }) =>
              block.position,
          ),
        ) + 1;

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

                <SessionBlockList

          athleteId={
            athleteId
          }

          sessionId={
            sessionId
          }

          canWrite={
            canWrite
          }

          blocks={

            blocks.map(

              ({
                block,
                exercises,
              }) => ({

                id:
                  block.id,

                position:
                  block.position,

                title:
                  block.title ??
                  'Bloque de entrenamiento',

                notes:
                  block.notes,

                exerciseCount:
                  exercises.length,

              }),

            )

          }

        >

          {blocks.map(

            ({
              block,
              exercises,
            }) => (

              <div

                key={
                  block.id
                }

                className="training-session-exercises"

              >

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

                            {
                              sessionExercise.plannedNotes
                            }

                          </p>

                        )}

                        {performanceEntries.length > 0 && (

                          <PerformanceEntryTable

                            athleteId={
                              athleteId
                            }

                            sessionExerciseId={
                              sessionExercise.id
                            }

                            metricProfile={
                              catalogItem.metricProfile
                            }

                            entries={
                              performanceEntries
                            }

                            canWrite={
                              canWrite
                            }

                          />

                        )}

                        {canWrite && (

                          <AddPerformanceEntryControl

                            athleteId={
                              athleteId
                            }

                            sessionExerciseId={
                              sessionExercise.id
                            }

                            metricProfile={
                              catalogItem.metricProfile
                            }

                            position={

                              performanceEntries.length ===
                              0
                                ? 0
                                : Math.max(

                                    ...performanceEntries.map(
                                      entry =>
                                        entry.position,
                                    ),

                                  ) + 1

                            }

                          />

                        )}

                        <div className="training-session-exercise-footer">

                          {catalogItem.origin ===
                            'CUSTOM' && (

                            <span className="training-custom-badge">

                              Personalizado

                            </span>

                          )}

                          <span>

                            {
                              performanceEntries.length
                            }{' '}

                            {
                              performanceEntries.length ===
                              1
                                ? 'registro'
                                : 'registros'
                            }

                          </span>

                        </div>

                      </div>

                    </article>

                  ),

                )}

                {canWrite && (

                  <AddExerciseControl

                    athleteId={
                      athleteId
                    }

                    blockId={
                      block.id
                    }

                    position={

                      exercises.length ===
                      0
                        ? 0
                        : Math.max(

                            ...exercises.map(
                              ({
                                sessionExercise,
                              }) =>
                                sessionExercise.position,
                            ),

                          ) + 1

                    }

                  />

                )}

              </div>

            ),

          )}

        </SessionBlockList>

        {canWrite && (
          <NewBlockControl
            athleteId={
              athleteId
            }
            sessionId={
              sessionId
            }
            position={
              nextBlockPosition
            }
          />
        )}

      </section>

    </main>
  );
}
