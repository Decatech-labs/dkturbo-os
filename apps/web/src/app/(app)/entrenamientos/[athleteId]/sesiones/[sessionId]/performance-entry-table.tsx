'use client';

import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';

import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';

import {
  CSS,
} from '@dnd-kit/utilities';

import {
  GripVertical,
} from 'lucide-react';

import {
  useEffect,
  useState,
} from 'react';

import styles from './performance-entry-table.module.css';

import {
  PerformanceEntryActions,
} from './performance-entry-actions';

interface PerformanceEntry {
  id:
    string;

  position:
    number;

  plannedReps:
    number | null;

  actualReps:
    number | null;

  plannedLoadKg:
    number | null;

  actualLoadKg:
    number | null;

  plannedDistanceM:
    number | null;

  actualDistanceM:
    number | null;

  plannedDurationMs:
    number | null;

  actualDurationMs:
    number | null;

  plannedResultM:
    number | null;

  actualResultM:
    number | null;

  plannedHeightM:
    number | null;

  actualHeightM:
    number | null;

  plannedRpe:
    number | null;

  actualRpe:
    number | null;

  plannedRir:
    number | null;

  actualRir:
    number | null;

  plannedRestSeconds:
    number | null;

  actualRestSeconds:
    number | null;

  plannedNotes:
    string | null;

  actualNotes:
    string | null;
}

type MetricProfile =
  | 'STRENGTH'
  | 'INTERVAL'
  | 'CONTINUOUS'
  | 'ATTEMPT_DISTANCE'
  | 'ATTEMPT_HEIGHT'
  | 'REHAB'
  | 'GENERIC';

interface PerformanceEntryTableProps {
  athleteId:
    string;

  sessionExerciseId:
    string;

  metricProfile:
    MetricProfile;

  entries:
    PerformanceEntry[];

  canWrite:
    boolean;
}

interface Column {
  key:
    string;

  label:
    string;

  planned:
    (
      entry:
        PerformanceEntry,
    ) => string | null;

  actual:
    (
      entry:
        PerformanceEntry,
    ) => string | null;
}

interface SortableRowProps {
  athleteId:
    string;

  sessionExerciseId:
    string;

  metricProfile:
    MetricProfile;

  entry:
    PerformanceEntry;

  index:
    number;

  duplicatePosition:
    number;

  columns:
    Column[];

  canWrite:
    boolean;
}

const formatNumber =
  (
    value:
      number | null,
  ): string | null =>
    value === null
      ? null
      : String(
          value,
        );

const formatKg =
  (
    value:
      number | null,
  ): string | null =>
    value === null
      ? null
      : `${value} kg`;

const formatMeters =
  (
    value:
      number | null,
  ): string | null =>
    value === null
      ? null
      : `${value} m`;

const formatSeconds =
  (
    totalSeconds:
      number | null,
  ): string | null => {

    if (
      totalSeconds === null
    ) {
      return null;
    }

    const rounded =
      Math.round(
        totalSeconds,
      );

    const hours =
      Math.floor(
        rounded /
          3600,
      );

    const minutes =
      Math.floor(
        (
          rounded %
          3600
        ) /
          60,
      );

    const seconds =
      rounded %
      60;

    if (
      hours > 0
    ) {
      return `${hours}:${String(
        minutes,
      ).padStart(
        2,
        '0',
      )}:${String(
        seconds,
      ).padStart(
        2,
        '0',
      )}`;
    }

    return `${minutes}:${String(
      seconds,
    ).padStart(
      2,
      '0',
    )}`;
  };

const formatDuration =
  (
    milliseconds:
      number | null,
  ): string | null =>
    milliseconds === null
      ? null
      : formatSeconds(
          milliseconds /
            1000,
        );

const columnsFor =
  (
    profile:
      MetricProfile,
  ): Column[] => {

    switch (
      profile
    ) {
      case 'STRENGTH':
        return [
          {
            key:
              'reps',
            label:
              'REPS',
            planned:
              entry =>
                formatNumber(
                  entry.plannedReps,
                ),
            actual:
              entry =>
                formatNumber(
                  entry.actualReps,
                ),
          },
          {
            key:
              'load',
            label:
              'CARGA',
            planned:
              entry =>
                formatKg(
                  entry.plannedLoadKg,
                ),
            actual:
              entry =>
                formatKg(
                  entry.actualLoadKg,
                ),
          },
          {
            key:
              'rir',
            label:
              'RIR',
            planned:
              entry =>
                formatNumber(
                  entry.plannedRir,
                ),
            actual:
              entry =>
                formatNumber(
                  entry.actualRir,
                ),
          },
          {
            key:
              'rpe',
            label:
              'RPE',
            planned:
              entry =>
                formatNumber(
                  entry.plannedRpe,
                ),
            actual:
              entry =>
                formatNumber(
                  entry.actualRpe,
                ),
          },
          {
            key:
              'rest',
            label:
              'RECUP.',
            planned:
              entry =>
                formatSeconds(
                  entry.plannedRestSeconds,
                ),
            actual:
              entry =>
                formatSeconds(
                  entry.actualRestSeconds,
                ),
          },
        ];

      case 'INTERVAL':
        return [
          {
            key:
              'distance',
            label:
              'DIST.',
            planned:
              entry =>
                formatMeters(
                  entry.plannedDistanceM,
                ),
            actual:
              entry =>
                formatMeters(
                  entry.actualDistanceM,
                ),
          },
          {
            key:
              'duration',
            label:
              'TIEMPO',
            planned:
              entry =>
                formatDuration(
                  entry.plannedDurationMs,
                ),
            actual:
              entry =>
                formatDuration(
                  entry.actualDurationMs,
                ),
          },
          {
            key:
              'rpe',
            label:
              'RPE',
            planned:
              entry =>
                formatNumber(
                  entry.plannedRpe,
                ),
            actual:
              entry =>
                formatNumber(
                  entry.actualRpe,
                ),
          },
          {
            key:
              'rest',
            label:
              'RECUP.',
            planned:
              entry =>
                formatSeconds(
                  entry.plannedRestSeconds,
                ),
            actual:
              entry =>
                formatSeconds(
                  entry.actualRestSeconds,
                ),
          },
        ];

      case 'CONTINUOUS':
        return [
          {
            key:
              'distance',
            label:
              'DIST.',
            planned:
              entry =>
                formatMeters(
                  entry.plannedDistanceM,
                ),
            actual:
              entry =>
                formatMeters(
                  entry.actualDistanceM,
                ),
          },
          {
            key:
              'duration',
            label:
              'DURACIÓN',
            planned:
              entry =>
                formatDuration(
                  entry.plannedDurationMs,
                ),
            actual:
              entry =>
                formatDuration(
                  entry.actualDurationMs,
                ),
          },
          {
            key:
              'rpe',
            label:
              'RPE',
            planned:
              entry =>
                formatNumber(
                  entry.plannedRpe,
                ),
            actual:
              entry =>
                formatNumber(
                  entry.actualRpe,
                ),
          },
        ];

      case 'ATTEMPT_DISTANCE':
        return [
          {
            key:
              'result',
            label:
              'RESULTADO',
            planned:
              entry =>
                formatMeters(
                  entry.plannedResultM,
                ),
            actual:
              entry =>
                formatMeters(
                  entry.actualResultM,
                ),
          },
          {
            key:
              'rpe',
            label:
              'RPE',
            planned:
              entry =>
                formatNumber(
                  entry.plannedRpe,
                ),
            actual:
              entry =>
                formatNumber(
                  entry.actualRpe,
                ),
          },
          {
            key:
              'rest',
            label:
              'RECUP.',
            planned:
              entry =>
                formatSeconds(
                  entry.plannedRestSeconds,
                ),
            actual:
              entry =>
                formatSeconds(
                  entry.actualRestSeconds,
                ),
          },
        ];

      case 'ATTEMPT_HEIGHT':
        return [
          {
            key:
              'height',
            label:
              'ALTURA',
            planned:
              entry =>
                formatMeters(
                  entry.plannedHeightM,
                ),
            actual:
              entry =>
                formatMeters(
                  entry.actualHeightM,
                ),
          },
          {
            key:
              'rpe',
            label:
              'RPE',
            planned:
              entry =>
                formatNumber(
                  entry.plannedRpe,
                ),
            actual:
              entry =>
                formatNumber(
                  entry.actualRpe,
                ),
          },
          {
            key:
              'rest',
            label:
              'RECUP.',
            planned:
              entry =>
                formatSeconds(
                  entry.plannedRestSeconds,
                ),
            actual:
              entry =>
                formatSeconds(
                  entry.actualRestSeconds,
                ),
          },
        ];

      case 'REHAB':
        return [
          {
            key:
              'reps',
            label:
              'REPS',
            planned:
              entry =>
                formatNumber(
                  entry.plannedReps,
                ),
            actual:
              entry =>
                formatNumber(
                  entry.actualReps,
                ),
          },
          {
            key:
              'load',
            label:
              'CARGA',
            planned:
              entry =>
                formatKg(
                  entry.plannedLoadKg,
                ),
            actual:
              entry =>
                formatKg(
                  entry.actualLoadKg,
                ),
          },
          {
            key:
              'duration',
            label:
              'DURACIÓN',
            planned:
              entry =>
                formatDuration(
                  entry.plannedDurationMs,
                ),
            actual:
              entry =>
                formatDuration(
                  entry.actualDurationMs,
                ),
          },
          {
            key:
              'rpe',
            label:
              'RPE',
            planned:
              entry =>
                formatNumber(
                  entry.plannedRpe,
                ),
            actual:
              entry =>
                formatNumber(
                  entry.actualRpe,
                ),
          },
          {
            key:
              'rest',
            label:
              'RECUP.',
            planned:
              entry =>
                formatSeconds(
                  entry.plannedRestSeconds,
                ),
            actual:
              entry =>
                formatSeconds(
                  entry.actualRestSeconds,
                ),
          },
        ];

      case 'GENERIC':
      default:
        return [
          {
            key:
              'reps',
            label:
              'REPS',
            planned:
              entry =>
                formatNumber(
                  entry.plannedReps,
                ),
            actual:
              entry =>
                formatNumber(
                  entry.actualReps,
                ),
          },
          {
            key:
              'duration',
            label:
              'DURACIÓN',
            planned:
              entry =>
                formatDuration(
                  entry.plannedDurationMs,
                ),
            actual:
              entry =>
                formatDuration(
                  entry.actualDurationMs,
                ),
          },
          {
            key:
              'rpe',
            label:
              'RPE',
            planned:
              entry =>
                formatNumber(
                  entry.plannedRpe,
                ),
            actual:
              entry =>
                formatNumber(
                  entry.actualRpe,
                ),
          },
          {
            key:
              'rest',
            label:
              'RECUP.',
            planned:
              entry =>
                formatSeconds(
                  entry.plannedRestSeconds,
                ),
            actual:
              entry =>
                formatSeconds(
                  entry.actualRestSeconds,
                ),
          },
        ];
    }
  };

function SortableRow({

  athleteId,
  sessionExerciseId,
  metricProfile,
  entry,
  index,
  duplicatePosition,
  columns,
  canWrite,

}: SortableRowProps) {

  const {

    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,

  } = useSortable({

    id:
      entry.id,

    disabled:
      !canWrite,

  });

  return (

    <tr

      ref={
        setNodeRef
      }

      className={[
        styles.row,
        isDragging
          ? styles.draggingRow
          : '',
      ].join(
        ' ',
      )}

      style={{
        transform:
          CSS.Transform.toString(
            transform,
          ),
        transition,
      }}

    >

      <td
        className={
          styles.indexCell
        }
      >

        <div
          className={
            styles.indexContent
          }
        >

          {canWrite && (

            <button

              type="button"

              className={
                styles.dragHandle
              }

              aria-label={`Mover registro ${index + 1}`}

              title="Arrastrar para reordenar"

              {...attributes}
              {...listeners}

            >

              <GripVertical />

            </button>

          )}

          <span>

            {index + 1}

          </span>

        </div>

      </td>

      {columns.map(

        column => {

          const planned =
            column.planned(
              entry,
            );

          const actual =
            column.actual(
              entry,
            );

          return (

            <td

              key={
                column.key
              }

              className={
                styles.cell
              }

            >

              <span
                className={
                  styles.planned
                }
              >

                {planned ??
                  '—'}

              </span>

              {actual !==
                null && (

                <span
                  className={
                    styles.actual
                  }
                >

                  real · {actual}

                </span>

              )}

            </td>

          );

        },

      )}

      {canWrite && (

        <td
          className={
            styles.actionsCell
          }
        >

          <PerformanceEntryActions

            athleteId={
              athleteId
            }

            sessionExerciseId={
              sessionExerciseId
            }

            metricProfile={
              metricProfile
            }

            entry={
              entry
            }

            rowNumber={
              index + 1
            }

            duplicatePosition={
              duplicatePosition
            }

          />

        </td>

      )}

    </tr>

  );
}

export function PerformanceEntryTable({

  athleteId,
  sessionExerciseId,
  metricProfile,
  entries,
  canWrite,

}: PerformanceEntryTableProps) {

  const [

    orderedEntries,
    setOrderedEntries,

  ] = useState<
    PerformanceEntry[]
  >(
    () =>
      [...entries].sort(
        (
          a,
          b,
        ) =>
          a.position -
          b.position,
      ),
  );

  const [

    reorderError,
    setReorderError,

  ] = useState<
    string | null
  >(
    null,
  );

  const sensors =
    useSensors(

      useSensor(
        PointerSensor,
        {
          activationConstraint: {
            distance:
              6,
          },
        },
      ),

      useSensor(
        KeyboardSensor,
        {
          coordinateGetter:
            sortableKeyboardCoordinates,
        },
      ),

    );

  useEffect(

    () => {

      setOrderedEntries(

        [...entries].sort(
          (
            a,
            b,
          ) =>
            a.position -
            b.position,
        ),

      );

    },

    [
      entries,
    ],

  );

  const candidateColumns =
    columnsFor(
      metricProfile,
    );

  const columns =
    candidateColumns.filter(

      column =>
        orderedEntries.some(

          entry =>
            column.planned(
              entry,
            ) !==
              null ||
            column.actual(
              entry,
            ) !==
              null,

        ),

    );

  const duplicatePosition =
    orderedEntries.length ===
    0
      ? 0
      : Math.max(
          ...orderedEntries.map(
            entry =>
              entry.position,
          ),
        ) + 1;

  const handleDragEnd =
    async (
      event:
        DragEndEvent,
    ) => {

      const {
        active,
        over,
      } = event;

      if (
        !over ||
        active.id ===
          over.id
      ) {
        return;
      }

      const previousEntries =
        orderedEntries;

      const oldIndex =
        previousEntries.findIndex(
          entry =>
            entry.id ===
            active.id,
        );

      const newIndex =
        previousEntries.findIndex(
          entry =>
            entry.id ===
            over.id,
        );

      if (
        oldIndex ===
          -1 ||
        newIndex ===
          -1
      ) {
        return;
      }

      const nextEntries =
        arrayMove(
          previousEntries,
          oldIndex,
          newIndex,
        ).map(
          (
            entry,
            position,
          ) => ({
            ...entry,
            position,
          }),
        );

      setOrderedEntries(
        nextEntries,
      );

      setReorderError(
        null,
      );

      try {

        const response =
          await fetch(

            `/api/training/athletes/${encodeURIComponent(
              athleteId,
            )}/session-exercises/${encodeURIComponent(
              sessionExerciseId,
            )}/performance-entries/order`,

            {

              method:
                'PUT',

              headers: {

                'content-type':
                  'application/json',

              },

              body:
                JSON.stringify({

                  orderedIds:
                    nextEntries.map(
                      entry =>
                        entry.id,
                    ),

                }),

            },

          );

        if (!response.ok) {

          throw new Error(
            'No se ha podido guardar el nuevo orden.',
          );

        }

      } catch {

        setOrderedEntries(
          previousEntries,
        );

        setReorderError(
          'No se ha podido guardar el nuevo orden.',
        );

      }

    };

  return (

    <div
      className={
        styles.wrapper
      }
    >

      <DndContext
        id={`performance-entries-${sessionExerciseId}`}

        sensors={
          sensors
        }

        collisionDetection={
          closestCenter
        }

        onDragEnd={(
          event,
        ) => {
          void handleDragEnd(
            event,
          );
        }}

      >

        <SortableContext

          items={
            orderedEntries.map(
              entry =>
                entry.id,
            )
          }

          strategy={
            verticalListSortingStrategy
          }

        >

          <table
            className={
              styles.table
            }
          >

            <thead>

              <tr
                className={
                  styles.headerRow
                }
              >

                <th
                  className={[
                    styles.headerCell,
                    styles.indexHeader,
                  ].join(
                    ' ',
                  )}
                >

                  #

                </th>

                {columns.map(

                  column => (

                    <th

                      key={
                        column.key
                      }

                      className={
                        styles.headerCell
                      }

                    >

                      {
                        column.label
                      }

                    </th>

                  ),

                )}

                {canWrite && (

                  <th
                    className={[
                      styles.headerCell,
                      styles.actionsHeader,
                    ].join(
                      ' ',
                    )}
                  />

                )}

              </tr>

            </thead>

            <tbody>

              {orderedEntries.map(

                (
                  entry,
                  index,
                ) => (

                  <SortableRow

                    key={
                      entry.id
                    }

                    athleteId={
                      athleteId
                    }

                    sessionExerciseId={
                      sessionExerciseId
                    }

                    metricProfile={
                      metricProfile
                    }

                    entry={
                      entry
                    }

                    index={
                      index
                    }

                    duplicatePosition={
                      duplicatePosition
                    }

                    columns={
                      columns
                    }

                    canWrite={
                      canWrite
                    }

                  />

                ),

              )}

            </tbody>

          </table>

        </SortableContext>

      </DndContext>

      {reorderError && (

        <div
          className={
            styles.reorderError
          }
        >

          {reorderError}

        </div>

      )}

      {orderedEntries.some(

        entry =>
          entry.plannedNotes ||
          entry.actualNotes,

      ) && (

        <div
          className={
            styles.notes
          }
        >

          {orderedEntries.map(

            (
              entry,
              index,
            ) => {

              if (
                !entry.plannedNotes &&
                !entry.actualNotes
              ) {
                return null;
              }

              return (

                <div

                  key={
                    entry.id
                  }

                  className={
                    styles.note
                  }

                >

                  <span
                    className={
                      styles.noteIndex
                    }
                  >

                    Serie {
                      index + 1
                    }

                  </span>

                  {entry.plannedNotes && (

                    <span
                      className={
                        styles.noteText
                      }
                    >

                      {
                        entry.plannedNotes
                      }

                    </span>

                  )}

                  {entry.actualNotes && (

                    <span
                      className={
                        styles.actualNote
                      }
                    >

                      Real: {
                        entry.actualNotes
                      }

                    </span>

                  )}

                </div>

              );

            },

          )}

        </div>

      )}

    </div>

  );
}
