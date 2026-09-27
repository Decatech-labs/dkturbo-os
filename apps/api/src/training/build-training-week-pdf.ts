import type {
  getSessionDetail,
  getWeekDetail,
  PerformanceEntry,
} from '@dkturbo/training';

import {
  ReportPdf,
} from '../pdf/report-pdf.js';

type WeekDetail =
  Awaited<
    ReturnType<
      typeof getWeekDetail
    >
  >;

type SessionDetail =
  Awaited<
    ReturnType<
      typeof getSessionDetail
    >
  >;

interface BuildTrainingWeekPdfInput {
  athleteName:
    string;

  week:
    WeekDetail;

  sessions:
    SessionDetail[];
}

const formatNumber =
  (
    value:
      number,
  ): string =>
    Number.isInteger(
      value,
    )
      ? String(
          value,
        )
      : String(
          Math.round(
            value * 100,
          ) / 100,
        );

const formatDuration =
  (
    value:
      number | null,
  ): string | null => {

    if (
      value === null
    ) {
      return null;
    }

    const totalSeconds =
      Math.round(
        value / 1000,
      );

    if (
      totalSeconds <
      60
    ) {
      return `${totalSeconds}s`;
    }

    const minutes =
      Math.floor(
        totalSeconds / 60,
      );

    const seconds =
      totalSeconds % 60;

    return seconds === 0
      ? `${minutes}:00`
      : `${minutes}:${String(
          seconds,
        ).padStart(
          2,
          '0',
        )}`;
  };

const formatRest =
  (
    value:
      number | null,
  ): string | null => {

    if (
      value === null
    ) {
      return null;
    }

    if (
      value <
      60
    ) {
      return `r${value}s`;
    }

    const minutes =
      Math.floor(
        value / 60,
      );

    const seconds =
      value % 60;

    return seconds === 0
      ? `r${minutes}:00`
      : `r${minutes}:${String(
          seconds,
        ).padStart(
          2,
          '0',
        )}`;
  };

const formatDate =
  (
    value:
      string,
  ): string => {

    const date =
      new Date(
        `${value}T12:00:00Z`,
      );

    const label =
      new Intl.DateTimeFormat(
        'es-ES',
        {
          weekday:
            'long',

          day:
            '2-digit',

          timeZone:
            'UTC',
        },
      ).format(
        date,
      );

    return label
      .toLocaleUpperCase(
        'es-ES',
      );
  };

const formatWeekRange =
  (
    weekStart:
      string,
  ): string => {

    const start =
      new Date(
        `${weekStart}T12:00:00Z`,
      );

    const end =
      new Date(
        start,
      );

    end.setUTCDate(
      end.getUTCDate() +
        6,
    );

    const startLabel =
      new Intl.DateTimeFormat(
        'es-ES',
        {
          day:
            '2-digit',

          month:
            'short',

          timeZone:
            'UTC',
        },
      ).format(
        start,
      );

    const endLabel =
      new Intl.DateTimeFormat(
        'es-ES',
        {
          day:
            '2-digit',

          month:
            'short',

          year:
            'numeric',

          timeZone:
            'UTC',
        },
      ).format(
        end,
      );

    return `${startLabel} - ${endLabel}`;
  };

const formatMetrics =
  (
    metrics:
      Readonly<
        Record<
          string,
          unknown
        >
      >,
  ): string[] =>
    Object
      .entries(
        metrics,
      )
      .filter(
        (
          [
            ,
            value,
          ],
        ) =>
          typeof value ===
            'string' ||
          typeof value ===
            'number' ||
          typeof value ===
            'boolean',
      )
      .map(
        (
          [
            key,
            value,
          ],
        ) =>
          `${key}:${String(
            value,
          )}`,
      );

const buildEntryParts =
  (
    entry:
      PerformanceEntry,

    side:
      'planned' |
      'actual',
  ): string[] => {

    const planned =
      side ===
      'planned';

    const parts:
      string[] = [];

    const reps =
      planned
        ? entry.plannedReps
        : entry.actualReps;

    const load =
      planned
        ? entry.plannedLoadKg
        : entry.actualLoadKg;

    const distance =
      planned
        ? entry.plannedDistanceM
        : entry.actualDistanceM;

    const duration =
      planned
        ? entry.plannedDurationMs
        : entry.actualDurationMs;

    const result =
      planned
        ? entry.plannedResultM
        : entry.actualResultM;

    const height =
      planned
        ? entry.plannedHeightM
        : entry.actualHeightM;

    const rpe =
      planned
        ? entry.plannedRpe
        : entry.actualRpe;

    const rir =
      planned
        ? entry.plannedRir
        : entry.actualRir;

    const rest =
      planned
        ? entry.plannedRestSeconds
        : entry.actualRestSeconds;

    const metrics =
      planned
        ? entry.plannedMetrics
        : entry.actualMetrics;

    if (
      reps !==
      null
    ) {
      parts.push(
        `${formatNumber(
          reps,
        )} rep`,
      );
    }

    if (
      load !==
      null
    ) {
      parts.push(
        `${formatNumber(
          load,
        )} kg`,
      );
    }

    if (
      distance !==
      null
    ) {
      parts.push(
        `${formatNumber(
          distance,
        )} m`,
      );
    }

    const durationLabel =
      formatDuration(
        duration,
      );

    if (
      durationLabel
    ) {
      parts.push(
        durationLabel,
      );
    }

    if (
      result !==
      null
    ) {
      parts.push(
        `res ${formatNumber(
          result,
        )} m`,
      );
    }

    if (
      height !==
      null
    ) {
      parts.push(
        `alt ${formatNumber(
          height,
        )} m`,
      );
    }

    if (
      rpe !==
      null
    ) {
      parts.push(
        `RPE${formatNumber(
          rpe,
        )}`,
      );
    }

    if (
      rir !==
      null
    ) {
      parts.push(
        `RIR${formatNumber(
          rir,
        )}`,
      );
    }

    const restLabel =
      formatRest(
        rest,
      );

    if (
      restLabel
    ) {
      parts.push(
        restLabel,
      );
    }

    parts.push(
      ...formatMetrics(
        metrics,
      ),
    );

    if (
      !planned &&
      entry.actualIsFoul ===
        true
    ) {
      parts.push(
        'NULO',
      );
    } else if (
      !planned &&
      entry.actualSuccess !==
        null
    ) {
      parts.push(
        entry.actualSuccess
          ? 'VÁLIDO'
          : 'NO VÁLIDO',
      );
    }

    return parts;
  };

const hasActualEntry =
  (
    entry:
      PerformanceEntry,
  ): boolean =>
    entry.actualReps !==
      null ||
    entry.actualLoadKg !==
      null ||
    entry.actualDistanceM !==
      null ||
    entry.actualDurationMs !==
      null ||
    entry.actualResultM !==
      null ||
    entry.actualHeightM !==
      null ||
    entry.actualRpe !==
      null ||
    entry.actualRir !==
      null ||
    entry.actualRestSeconds !==
      null ||
    entry.actualSuccess !==
      null ||
    entry.actualIsFoul !==
      null ||
    entry.actualNotes !==
      null ||
    Object.keys(
      entry.actualMetrics,
    ).length >
      0;

const actualMatchesPlan =
  (
    entry:
      PerformanceEntry,
  ): boolean => {

    if (
      !hasActualEntry(
        entry,
      )
    ) {
      return false;
    }

    return (
      entry.plannedReps ===
        entry.actualReps &&
      entry.plannedLoadKg ===
        entry.actualLoadKg &&
      entry.plannedDistanceM ===
        entry.actualDistanceM &&
      entry.plannedDurationMs ===
        entry.actualDurationMs &&
      entry.plannedResultM ===
        entry.actualResultM &&
      entry.plannedHeightM ===
        entry.actualHeightM &&
      entry.plannedRpe ===
        entry.actualRpe &&
      entry.plannedRir ===
        entry.actualRir &&
      entry.plannedRestSeconds ===
        entry.actualRestSeconds &&
      JSON.stringify(
        entry.plannedMetrics,
      ) ===
        JSON.stringify(
          entry.actualMetrics,
        ) &&
      entry.actualSuccess ===
        null &&
      entry.actualIsFoul ===
        null
    );
  };

const formatPlannedEntry =
  (
    entry:
      PerformanceEntry,
  ): string => {

    const parts =
      buildEntryParts(
        entry,
        'planned',
      );

    return parts.length >
      0
      ? parts.join(
          ' | ',
        )
      : '—';
  };

const formatActualEntry =
  (
    entry:
      PerformanceEntry,
  ): string => {

    if (
      !hasActualEntry(
        entry,
      )
    ) {
      return '—';
    }

    if (
      actualMatchesPlan(
        entry,
      )
    ) {
      return '=';
    }

    const parts =
      buildEntryParts(
        entry,
        'actual',
      );

    return parts.length >
      0
      ? parts.join(
          ' | ',
        )
      : '—';
  };

const IMPORTANT_STATUS:
  Record<
    string,
    string
  > = {
    PARTIAL:
      'PARCIAL',

    SKIPPED:
      'OMITIDA',

    CANCELLED:
      'CANCELADA',
  };

const hasSessionContent =
  (
    detail:
      SessionDetail | undefined,
  ): boolean => {

    if (!detail) {
      return false;
    }

    return detail.blocks.some(
      block =>
        block.exercises.length >
          0 ||
        Boolean(
          block.block.notes,
        ),
    );
  };

export const buildTrainingWeekPdf =
  async (
    input:
      BuildTrainingWeekPdfInput,
  ): Promise<Uint8Array> => {

    const report =
      await ReportPdf.create(
        'Resumen semanal · Entrenamiento',
      );

    report.title(
      'DKTURBO OS · ENTRENAMIENTO',
      input.athleteName.toLocaleUpperCase(
        'es-ES',
      ),
      `${formatWeekRange(
        input.week.week.weekStart,
      )}${
        input.week.week.title
          ? ` · ${input.week.week.title}`
          : ''
      }`,
    );

    if (
      input.week.week.notes
    ) {
      report.text(
        `Objetivo: ${input.week.week.notes}`,
        {
          muted:
            true,

          size:
            8.5,
        },
      );
    }

    report.spacer(
      8,
    );

    const detailsBySessionId =
      new Map(
        input.sessions.map(
          detail => [
            detail.session.id,
            detail,
          ],
        ),
      );

    for (
      const dayDetail
      of input.week.days
    ) {

      if (
        dayDetail.sessions.length ===
        0
      ) {
        continue;
      }

      report.section(
        formatDate(
          dayDetail.day.date,
        ),
      );

      for (
        const session
        of dayDetail.sessions
      ) {

        const detail =
          detailsBySessionId.get(
            session.id,
          );

        const heading =
          session.plannedStartTime
            ? `${session.plannedStartTime} · ${session.title.toLocaleUpperCase(
                'es-ES',
              )}`
            : session.title.toLocaleUpperCase(
                'es-ES',
              );

        report.subsection(
          heading,
        );

        const status =
          IMPORTANT_STATUS[
            session.status
          ];

        if (
          status
        ) {
          report.text(
            status,
            {
              bold:
                true,

              size:
                8,
            },
          );
        }

        if (
          !hasSessionContent(
            detail,
          )
        ) {
          report.text(
            session.actualNotes
              ? `Sin detalle de ejercicios · Real: ${session.actualNotes}`
              : 'Sin detalle registrado.',
            {
              muted:
                true,

              size:
                8,
            },
          );

          report.spacer(
            6,
          );

          continue;
        }

        report.comparisonHeader();

        for (
          const blockDetail
          of detail?.blocks ??
          []
        ) {

          report.spacer(
            6,
          );

          report.text(
            blockDetail
              .block
              .title
              .toLocaleUpperCase(
                'es-ES',
              ),
            {
              bold:
                true,

              size:
                8.5,
            },
          );

          if (
            blockDetail.block.notes
          ) {
            report.text(
              blockDetail
                .block
                .notes,
              {
                muted:
                  true,

                size:
                  7.5,
              },
            );
          }

          for (
            const exercise
            of blockDetail.exercises
          ) {

            const entries =
              [
                ...exercise
                  .performanceEntries,
              ].sort(
                (
                  a,
                  b,
                ) =>
                  a.position -
                  b.position,
              );

            if (
              entries.length ===
              0
            ) {
              if (
                exercise
                  .sessionExercise
                  .plannedNotes ||
                exercise
                  .sessionExercise
                  .actualNotes
              ) {
                report.comparisonRow(
                  exercise
                    .catalogItem
                    .name,
                  exercise
                    .sessionExercise
                    .plannedNotes ??
                    '—',
                  exercise
                    .sessionExercise
                    .actualNotes ??
                    '—',
                );
              } else {
                report.text(
                  exercise
                    .catalogItem
                    .name,
                  {
                    size:
                      8.2,
                  },
                );
              }

              continue;
            }

            entries.forEach(
              (
                entry,
                index,
              ) => {

                const exerciseLabel =
                  index ===
                  0
                    ? exercise
                        .catalogItem
                        .name
                    : '';

                const seriesLabel =
                  entries.length >
                  1
                    ? String(
                        index +
                          1,
                      )
                    : '';

                report.comparisonRow(
                  [
                    exerciseLabel,
                    seriesLabel
                      ? `#${seriesLabel}`
                      : '',
                  ]
                    .filter(
                      Boolean,
                    )
                    .join(
                      ' · ',
                    ),

                  formatPlannedEntry(
                    entry,
                  ),

                  formatActualEntry(
                    entry,
                  ),
                );

                const plannedNote =
                  entry.plannedNotes ??
                  null;

                const actualNote =
                  entry.actualNotes ??
                  null;

                if (
                  plannedNote ||
                  actualNote
                ) {

                  const noteParts:
                    string[] = [];

                  if (
                    plannedNote
                  ) {
                    noteParts.push(
                      `Plan: ${plannedNote}`,
                    );
                  }

                  if (
                    actualNote &&
                    actualNote !==
                      plannedNote
                  ) {
                    noteParts.push(
                      `Real: ${actualNote}`,
                    );
                  }

                  if (
                    noteParts.length >
                    0
                  ) {
                    report.text(
                      `Nota: ${noteParts.join(
                        ' · ',
                      )}`,
                      {
                        muted:
                          true,

                        size:
                          7.2,

                        indent:
                          118,
                      },
                    );
                  }
                }
              },
            );
          }
        }

        if (
          session.actualNotes
        ) {
          report.spacer(
            4,
          );

          report.text(
            `Sesión: ${session.actualNotes}`,
            {
              muted:
                true,

              size:
                7.5,
            },
          );
        }

        report.spacer(
          10,
        );
      }
    }

    return report.save();
  };
