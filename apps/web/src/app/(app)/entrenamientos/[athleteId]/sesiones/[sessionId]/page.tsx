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

import {
  SessionHeaderEditor,
  type TrainingSessionType,
} from './session-header-editor';

import {
  TrainingMobileEditToggle,
} from '../../../training-mobile-edit-toggle';

interface PageProps {
  params: Promise<{
    athleteId:
      string;
    sessionId:
      string;
  }>;
  searchParams:
    Promise<{
      from?:
        string;
      weekId?:
        string;
    }>;
}

export default async function TrainingSessionPage(
  {
    params,
    searchParams,
  }: PageProps,
) {
  await requireAccessPermission(
    'app.training.access',
  );

  const {
    athleteId,
    sessionId,
  } = await params;

    const {
    from,
    weekId,
  } = await searchParams;

  const backHref =
    from ===
      'week' &&
    weekId
      ? `/entrenamientos/${athleteId}/semanas/${weekId}`
      : `/entrenamientos/${athleteId}`;

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
    <main
      className="training-page training-session-page"
      data-session-type={
        session.type
      }
    >

      <header className="training-page-header training-session-header">

        <Link
          href={
            backHref
          }
          className="system-back"
          aria-label={
            from ===
              'week'
              ? 'Volver a la semana'
              : 'Volver al mes'
          }
        >
          <ArrowLeft />
        </Link>

        <div className="training-plan-desktop-only">

          <SessionHeaderEditor
            athleteId={
              athleteId
            }
            sessionId={
              sessionId
            }
            dayId={
              session.dayId
            }
            type={
              session.type as TrainingSessionType
            }
            title={
              session.title
            }
            plannedStartTime={
              session.plannedStartTime
            }
            plannedDurationMinutes={
              session.plannedDurationMinutes
            }
            plannedNotes={
              session.plannedNotes
            }
            plannedRpe={
              session.plannedRpe
            }
            accessRole={
              accessRole
            }
            canWrite={
              canWrite
            }
            backHref={
              backHref
            }
          />

        </div>

        <div className="training-plan-mobile-readonly">

          <div className="training-session-heading">

            <div className="training-session-heading-meta">

              <span>
                {accessRole}
              </span>

              <span>
                Modo entrenamiento
              </span>

            </div>

            <h1>
              {
                session.title
              }
            </h1>

            <div className="training-session-summary">

              {session.plannedStartTime && (
                <span>
                  {
                    session.plannedStartTime
                  }
                </span>
              )}

              {session.plannedDurationMinutes !==
                null && (
                <span>
                  {
                    session.plannedDurationMinutes
                  } min
                </span>
              )}

              {session.plannedRpe !==
                null && (
                <span>
                  RPE {
                    session.plannedRpe
                  }
                </span>
              )}

            </div>

            {session.plannedNotes && (
              <p>
                {
                  session.plannedNotes
                }
              </p>
            )}

          </div>

        </div>

      </header>

      <TrainingMobileEditToggle
        canWrite={
          canWrite
        }
      />

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

          exerciseContent={
            blocks.flatMap(
              ({
                exercises,
              }) =>
                [...exercises]

                  .sort(
                    (
                      a,
                      b,
                    ) =>
                      a.sessionExercise.position -
                      b.sessionExercise.position,
                  )

                  .map(
                    ({
                      sessionExercise,
                      catalogItem,
                      performanceEntries,
                    }) => (

                      <div
                        key={
                          sessionExercise.id
                        }
                        className="training-session-exercise-body"
                      >

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

                            <div className="training-plan-desktop-only">

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

                    ),
                  ),
            )
          }
          blockControls={
            blocks.map(
              ({
                block,
                exercises,
              }) =>
                canWrite ? (

                  <div
                    key={
                      block.id
                    }
                    className="training-plan-desktop-only"
                  >

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

                  </div>

                ) : null
            )
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

                exercises:
                  exercises.map(
                    ({
                      sessionExercise,
                      catalogItem,
                    }) => ({

                      id:
                        sessionExercise.id,

                      blockId:
                        sessionExercise.blockId,

                      position:
                        sessionExercise.position,

                      name:
                        catalogItem.name,

                      metricProfile:
                        catalogItem.metricProfile,

                      plannedNotes:
                        sessionExercise.plannedNotes,

                    }),
                  ),

              }),
            )
          }

        />

        {canWrite && (

          <div className="training-plan-desktop-only">

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

          </div>

        )}

      </section>

    </main>
  );
}
