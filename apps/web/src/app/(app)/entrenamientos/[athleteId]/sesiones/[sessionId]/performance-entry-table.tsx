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

import {
  PerformanceActualEditor,
} from './performance-actual-editor';

import {
  useTrainingMobileMode,
  useTrainingMobileEditMode,
} from '../../../use-training-mobile-mode';

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

  canRecordActual:
    boolean;

  canEditPlan:
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
  ): string | null => {

    if (
      milliseconds ===
        null
    ) {
      return null;
    }

    const totalSeconds =
      milliseconds /
      1000;

    const hours =
      Math.floor(
        totalSeconds /
          3600,
      );

    const remainingAfterHours =
      totalSeconds -
      hours *
        3600;

    const minutes =
      Math.floor(
        remainingAfterHours /
          60,
      );

    const seconds =
      remainingAfterHours -
      minutes *
        60;

    const decimals =
      milliseconds %
        1000 ===
        0
        ? 0
        : 3;

    const secondsText =
      seconds
        .toFixed(
          decimals,
        )
        .replace(
          /(\.\d*?)0+$/,
          '$1',
        )
        .replace(
          /\.$/,
          '',
        );

    const paddedSeconds =
      seconds <
      10
        ? `0${secondsText}`
        : secondsText;

    if (
      hours >
      0
    ) {
      return `${hours}:${String(
        minutes,
      ).padStart(
        2,
        '0',
      )}:${paddedSeconds}`;
    }

    return `${minutes}:${paddedSeconds}`;
  };

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

interface SummaryMetric {
  label:
    string;

  value:
    string;

  detail?:
    string | undefined;

  tone?:
    | 'neutral'
    | 'blue'
    | 'green'
    | 'amber'
    | 'violet';
}

const numberFormatter =
  new Intl.NumberFormat(
    'es-ES',
    {
      maximumFractionDigits:
        2,
    },
  );

const formatDecimal =
  (
    value:
      number,
  ): string =>
    numberFormatter.format(
      value,
    );

const formatSigned =
  (
    value:
      number,

    suffix =
      '',
  ): string => {

    const rounded =
      Math.abs(
        value,
      ) <
      0.005
        ? 0
        : value;

    if (
      rounded ===
      0
    ) {
      return `0${suffix}`;
    }

    return `${rounded > 0 ? '+' : '−'}${formatDecimal(
      Math.abs(
        rounded,
      ),
    )}${suffix}`;
  };

const formatSignedDuration =
  (
    milliseconds:
      number,
  ): string => {

    if (
      Math.abs(
        milliseconds,
      ) <
      0.5
    ) {
      return '0 s';
    }

    const sign =
      milliseconds >
      0
        ? '+'
        : '−';

    const absoluteSeconds =
      Math.abs(
        milliseconds,
      ) /
      1000;

    if (
      absoluteSeconds <
      60
    ) {
      return `${sign}${formatDecimal(
        absoluteSeconds,
      )} s`;
    }

    return `${sign}${formatDuration(
      Math.round(
        Math.abs(
          milliseconds,
        ),
      ),
    )}`;
  };

const average =
  (
    values:
      number[],
  ): number | null => {

    if (
      values.length ===
      0
    ) {
      return null;
    }

    return (
      values.reduce(
        (
          total,
          value,
        ) =>
          total +
          value,
        0,
      ) /
      values.length
    );
  };

const hasActualForProfile =
  (
    profile:
      MetricProfile,

    entry:
      PerformanceEntry,
  ): boolean => {

    switch (
      profile
    ) {
      case 'STRENGTH':
        return [
          entry.actualReps,
          entry.actualLoadKg,
          entry.actualRir,
          entry.actualRpe,
          entry.actualRestSeconds,
        ].some(
          value =>
            value !==
            null,
        );

      case 'INTERVAL':
        return [
          entry.actualDistanceM,
          entry.actualDurationMs,
          entry.actualRpe,
          entry.actualRestSeconds,
        ].some(
          value =>
            value !==
            null,
        );

      case 'CONTINUOUS':
        return [
          entry.actualDistanceM,
          entry.actualDurationMs,
          entry.actualRpe,
        ].some(
          value =>
            value !==
            null,
        );

      case 'ATTEMPT_DISTANCE':
        return [
          entry.actualResultM,
          entry.actualRpe,
          entry.actualRestSeconds,
        ].some(
          value =>
            value !==
            null,
        );

      case 'ATTEMPT_HEIGHT':
        return [
          entry.actualHeightM,
          entry.actualRpe,
          entry.actualRestSeconds,
        ].some(
          value =>
            value !==
            null,
        );

      case 'REHAB':
        return [
          entry.actualReps,
          entry.actualLoadKg,
          entry.actualDurationMs,
          entry.actualRpe,
          entry.actualRestSeconds,
        ].some(
          value =>
            value !==
            null,
        );

      case 'GENERIC':
      default:
        return [
          entry.actualReps,
          entry.actualDurationMs,
          entry.actualRpe,
          entry.actualRestSeconds,
        ].some(
          value =>
            value !==
            null,
        );
    }
  };

const buildPerformanceSummary =
  (
    profile:
      MetricProfile,

    entries:
      PerformanceEntry[],
  ): SummaryMetric[] => {

    const registeredEntries =
      entries.filter(
        entry =>
          hasActualForProfile(
            profile,
            entry,
          ),
      );

    if (
      registeredEntries.length ===
      0
    ) {
      return [];
    }

    const registrationMetric:
      SummaryMetric = {
        label:
          'Registradas',

        value:
          `${registeredEntries.length} / ${entries.length}`,

        detail:
          registeredEntries.length ===
          entries.length
            ? 'Registro completo'
            : 'Progreso del ejercicio',

        tone:
          registeredEntries.length ===
          entries.length
            ? 'green'
            : 'blue',
      };

    switch (
      profile
    ) {
      case 'STRENGTH': {
        const plannedVolume =
          entries.reduce(
            (
              total,
              entry,
            ) => {

              if (
                entry.plannedReps ===
                  null ||
                entry.plannedLoadKg ===
                  null
              ) {
                return total;
              }

              return (
                total +
                entry.plannedReps *
                  entry.plannedLoadKg
              );
            },
            0,
          );

        const actualVolume =
          entries.reduce(
            (
              total,
              entry,
            ) => {

              if (
                entry.actualReps ===
                  null ||
                entry.actualLoadKg ===
                  null
              ) {
                return total;
              }

              return (
                total +
                entry.actualReps *
                  entry.actualLoadKg
              );
            },
            0,
          );

        const plannedReps =
          entries.reduce(
            (
              total,
              entry,
            ) =>
              total +
              (
                entry.plannedReps ??
                0
              ),
            0,
          );

        const actualReps =
          entries.reduce(
            (
              total,
              entry,
            ) =>
              total +
              (
                entry.actualReps ??
                0
              ),
            0,
          );

        const actualLoads =
          registeredEntries
            .map(
              entry =>
                entry.actualLoadKg,
            )
            .filter(
              (
                value,
              ): value is number =>
                value !==
                null,
            );

        const averageLoad =
          average(
            actualLoads,
          );

        const metrics:
          SummaryMetric[] = [];

        if (
          plannedVolume >
            0 ||
          actualVolume >
            0
        ) {
          metrics.push(
            {
              label:
                'Volumen plan',

              value:
                `${formatDecimal(
                  plannedVolume,
                )} kg`,

              tone:
                'neutral',
            },
            {
              label:
                'Volumen real',

              value:
                `${formatDecimal(
                  actualVolume,
                )} kg`,

              detail:
                plannedVolume >
                0
                  ? formatSigned(
                      actualVolume -
                        plannedVolume,
                      ' kg',
                    )
                  : undefined,

              tone:
                'blue',
            },
          );
        }

        if (
          plannedReps >
            0 ||
          actualReps >
            0
        ) {
          metrics.push({
            label:
              'Repeticiones',

            value:
              `${plannedReps} → ${actualReps}`,

            detail:
              formatSigned(
                actualReps -
                  plannedReps,
                ' rep',
              ),

            tone:
              'violet',
          });
        }

        if (
          averageLoad !==
          null
        ) {
          metrics.push({
            label:
              'Carga media real',

            value:
              `${formatDecimal(
                averageLoad,
              )} kg`,

            tone:
              'amber',
          });
        }

        metrics.push(
          registrationMetric,
        );

        return metrics;
      }

      case 'INTERVAL': {
        const comparable =
          entries.filter(
            entry =>
              entry.plannedDurationMs !==
                null &&
              entry.actualDurationMs !==
                null,
          );

        const plannedDurations =
          comparable.map(
            entry =>
              entry.plannedDurationMs!,
          );

        const actualDurations =
          comparable.map(
            entry =>
              entry.actualDurationMs!,
          );

        const allActualDurations =
          registeredEntries
            .map(
              entry =>
                entry.actualDurationMs,
            )
            .filter(
              (
                value,
              ): value is number =>
                value !==
                null,
            );

        const plannedAverage =
          average(
            plannedDurations,
          );

        const actualAverage =
          average(
            actualDurations,
          );

        const best =
          allActualDurations.length >
          0
            ? Math.min(
                ...allActualDurations,
              )
            : null;

        const worst =
          allActualDurations.length >
          0
            ? Math.max(
                ...allActualDurations,
              )
            : null;

        const metrics:
          SummaryMetric[] = [];

        if (
          plannedAverage !==
          null
        ) {
          metrics.push({
            label:
              'Media plan',

            value:
              formatDuration(
                Math.round(
                  plannedAverage,
                ),
              ) ??
              '—',

            tone:
              'neutral',
          });
        }

        if (
          actualAverage !==
          null
        ) {
          metrics.push({
            label:
              'Media real',

            value:
              formatDuration(
                Math.round(
                  actualAverage,
                ),
              ) ??
              '—',

            detail:
              plannedAverage !==
              null
                ? formatSignedDuration(
                    actualAverage -
                      plannedAverage,
                  )
                : undefined,

            tone:
              'blue',
          });
        }

        if (
          best !==
          null
        ) {
          metrics.push({
            label:
              'Mejor',

            value:
              formatDuration(
                best,
              ) ??
              '—',

            tone:
              'green',
          });
        }

        if (
          worst !==
          null &&
          allActualDurations.length >
            1
        ) {
          metrics.push({
            label:
              'Peor',

            value:
              formatDuration(
                worst,
              ) ??
              '—',

            detail:
              best !==
              null
                ? `Rango ${formatSignedDuration(
                    worst -
                      best,
                  ).replace(
                    '+',
                    '',
                  )}`
                : undefined,

            tone:
              'amber',
          });
        }

        metrics.push(
          registrationMetric,
        );

        return metrics;
      }

      case 'CONTINUOUS': {
        const latest =
          [...registeredEntries]
            .sort(
              (
                a,
                b,
              ) =>
                a.position -
                b.position,
            )
            .at(
              -1,
            );

        if (!latest) {
          return [];
        }

        const metrics:
          SummaryMetric[] = [];

        if (
          latest.actualDistanceM !==
          null
        ) {
          metrics.push({
            label:
              'Distancia real',

            value:
              `${formatDecimal(
                latest.actualDistanceM,
              )} m`,

            detail:
              latest.plannedDistanceM !==
              null
                ? formatSigned(
                    latest.actualDistanceM -
                      latest.plannedDistanceM,
                    ' m',
                  )
                : undefined,

            tone:
              'blue',
          });
        }

        if (
          latest.actualDurationMs !==
          null
        ) {
          metrics.push({
            label:
              'Tiempo real',

            value:
              formatDuration(
                latest.actualDurationMs,
              ) ??
              '—',

            detail:
              latest.plannedDurationMs !==
              null
                ? formatSignedDuration(
                    latest.actualDurationMs -
                      latest.plannedDurationMs,
                  )
                : undefined,

            tone:
              'violet',
          });
        }

        if (
          latest.actualRpe !==
          null
        ) {
          metrics.push({
            label:
              'RPE real',

            value:
              formatDecimal(
                latest.actualRpe,
              ),

            tone:
              'amber',
          });
        }

        metrics.push(
          registrationMetric,
        );

        return metrics;
      }

      case 'ATTEMPT_DISTANCE': {
        const results =
          registeredEntries
            .map(
              entry =>
                entry.actualResultM,
            )
            .filter(
              (
                value,
              ): value is number =>
                value !==
                null,
            );

        if (
          results.length ===
          0
        ) {
          return [
            registrationMetric,
          ];
        }

        return [
          {
            label:
              'Mejor resultado',

            value:
              `${formatDecimal(
                Math.max(
                  ...results,
                ),
              )} m`,

            tone:
              'green',
          },
          {
            label:
              'Media',

            value:
              `${formatDecimal(
                average(
                  results,
                )!,
              )} m`,

            tone:
              'blue',
          },
          {
            label:
              'Rango',

            value:
              `${formatDecimal(
                Math.max(
                  ...results,
                ) -
                  Math.min(
                    ...results,
                  ),
              )} m`,

            tone:
              'violet',
          },
          registrationMetric,
        ];
      }

      case 'ATTEMPT_HEIGHT': {
        const results =
          registeredEntries
            .map(
              entry =>
                entry.actualHeightM,
            )
            .filter(
              (
                value,
              ): value is number =>
                value !==
                null,
            );

        if (
          results.length ===
          0
        ) {
          return [
            registrationMetric,
          ];
        }

        return [
          {
            label:
              'Mejor altura',

            value:
              `${formatDecimal(
                Math.max(
                  ...results,
                ),
              )} m`,

            tone:
              'green',
          },
          {
            label:
              'Media',

            value:
              `${formatDecimal(
                average(
                  results,
                )!,
              )} m`,

            tone:
              'blue',
          },
          registrationMetric,
        ];
      }

      case 'REHAB': {
        const actualReps =
          registeredEntries.reduce(
            (
              total,
              entry,
            ) =>
              total +
              (
                entry.actualReps ??
                0
              ),
            0,
          );

        const loads =
          registeredEntries
            .map(
              entry =>
                entry.actualLoadKg,
            )
            .filter(
              (
                value,
              ): value is number =>
                value !==
                null,
            );

        const durations =
          registeredEntries
            .map(
              entry =>
                entry.actualDurationMs,
            )
            .filter(
              (
                value,
              ): value is number =>
                value !==
                null,
            );

        const rpes =
          registeredEntries
            .map(
              entry =>
                entry.actualRpe,
            )
            .filter(
              (
                value,
              ): value is number =>
                value !==
                null,
            );

        const metrics:
          SummaryMetric[] = [];

        if (
          actualReps >
          0
        ) {
          metrics.push({
            label:
              'Reps reales',

            value:
              String(
                actualReps,
              ),

            tone:
              'blue',
          });
        }

        const averageLoad =
          average(
            loads,
          );

        if (
          averageLoad !==
          null
        ) {
          metrics.push({
            label:
              'Carga media',

            value:
              `${formatDecimal(
                averageLoad,
              )} kg`,

            tone:
              'violet',
          });
        }

        const totalDuration =
          durations.reduce(
            (
              total,
              value,
            ) =>
              total +
              value,
            0,
          );

        if (
          totalDuration >
          0
        ) {
          metrics.push({
            label:
              'Duración real',

            value:
              formatDuration(
                totalDuration,
              ) ??
              '—',

            tone:
              'neutral',
          });
        }

        const averageRpe =
          average(
            rpes,
          );

        if (
          averageRpe !==
          null
        ) {
          metrics.push({
            label:
              'RPE medio',

            value:
              formatDecimal(
                averageRpe,
              ),

            tone:
              'amber',
          });
        }

        metrics.push(
          registrationMetric,
        );

        return metrics;
      }

      case 'GENERIC':
      default: {
        const reps =
          registeredEntries.reduce(
            (
              total,
              entry,
            ) =>
              total +
              (
                entry.actualReps ??
                0
              ),
            0,
          );

        const durations =
          registeredEntries
            .map(
              entry =>
                entry.actualDurationMs,
            )
            .filter(
              (
                value,
              ): value is number =>
                value !==
                null,
            );

        const rpes =
          registeredEntries
            .map(
              entry =>
                entry.actualRpe,
            )
            .filter(
              (
                value,
              ): value is number =>
                value !==
                null,
            );

        const metrics:
          SummaryMetric[] = [];

        if (
          reps >
          0
        ) {
          metrics.push({
            label:
              'Reps reales',

            value:
              String(
                reps,
              ),

            tone:
              'blue',
          });
        }

        const totalDuration =
          durations.reduce(
            (
              total,
              value,
            ) =>
              total +
              value,
            0,
          );

        if (
          totalDuration >
          0
        ) {
          metrics.push({
            label:
              'Duración',

            value:
              formatDuration(
                totalDuration,
              ) ??
              '—',

            tone:
              'violet',
          });
        }

        const averageRpe =
          average(
            rpes,
          );

        if (
          averageRpe !==
          null
        ) {
          metrics.push({
            label:
              'RPE medio',

            value:
              formatDecimal(
                averageRpe,
              ),

            tone:
              'amber',
          });
        }

        metrics.push(
          registrationMetric,
        );

        return metrics;
      }
    }
  };

function PerformanceSummary({
  metricProfile,
  entries,
}: {
  metricProfile:
    MetricProfile;

  entries:
    PerformanceEntry[];
}) {

  const metrics =
    buildPerformanceSummary(
      metricProfile,
      entries,
    );

  if (
    metrics.length ===
    0
  ) {
    return null;
  }

  return (
    <div
      className={
        styles.summary
      }
    >
      <div
        className={
          styles.summaryIntro
        }
      >
        <span>
          Análisis
        </span>

        <strong>
          Plan vs real
        </strong>
      </div>

      <div
        className={
          styles.summaryMetrics
        }
      >
        {metrics.map(
          (
            metric,
            index,
          ) => (
            <div
              key={`${metric.label}-${index}`}
              className={
                styles.summaryMetric
              }
              data-tone={
                metric.tone ??
                'neutral'
              }
            >
              <span>
                {metric.label}
              </span>

              <strong>
                {metric.value}
              </strong>

              {metric.detail && (
                <small>
                  {metric.detail}
                </small>
              )}
            </div>
          ),
        )}
      </div>
    </div>
  );
}

function SortableRow({

  athleteId,
  sessionExerciseId,
  metricProfile,
  entry,
  index,
  duplicatePosition,
  columns,
  canRecordActual,
  canEditPlan,

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
      !canEditPlan,

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

          {canEditPlan && (

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

      {canRecordActual && (

        <td
          className={
            styles.actionsCell
          }
        >

          <div
            className={
              styles.rowActions
            }
          >

            <PerformanceActualEditor
              athleteId={
                athleteId
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
            />

            {canEditPlan && (

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

            )}

          </div>

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

  const mobile =
    useTrainingMobileMode();

  const {
    enabled:
      mobileEditEnabled,
  } =
    useTrainingMobileEditMode();

  const canEditPlan =
    canWrite &&
    (
      !mobile ||
      mobileEditEnabled
    );

  const canRecordActual =
    canWrite;

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
      if (
        !canEditPlan
      ) {
        return;
      }

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
                  >
                    REAL
                  </th>

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

                    canRecordActual={
                      canRecordActual
                    }
                    canEditPlan={
                      canEditPlan
                    }

                  />

                ),

              )}

            </tbody>

          </table>

        </SortableContext>

      </DndContext>

      <PerformanceSummary
        metricProfile={
          metricProfile
        }
        entries={
          orderedEntries
        }
      />

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
