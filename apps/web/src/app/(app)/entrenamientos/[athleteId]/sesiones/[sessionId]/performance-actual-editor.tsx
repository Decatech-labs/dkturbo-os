'use client';

import {
  Check,
  Circle,
  Equal,
  Pencil,
  X,
} from 'lucide-react';

import {
  useRouter,
} from 'next/navigation';

import {
  useState,
} from 'react';

import {
  createPortal,
} from 'react-dom';

import styles from './performance-actual-editor.module.css';

type MetricProfile =
  | 'STRENGTH'
  | 'INTERVAL'
  | 'CONTINUOUS'
  | 'ATTEMPT_DISTANCE'
  | 'ATTEMPT_HEIGHT'
  | 'REHAB'
  | 'GENERIC';

interface PerformanceEntry {
  id:
    string;

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

interface PerformanceActualEditorProps {
  athleteId:
    string;

  metricProfile:
    MetricProfile;

  entry:
    PerformanceEntry;

  rowNumber:
    number;
}

interface FormState {
  reps:
    string;

  loadKg:
    string;

  distanceM:
    string;

  duration:
    string;

  resultM:
    string;

  heightM:
    string;

  rpe:
    string;

  rir:
    string;

  rest:
    string;

  notes:
    string;
}

type FieldDefinition =
  readonly [
    keyof FormState,
    string,
    string,
    'number' | 'duration' | 'rest',
  ];

const toStringValue =
  (
    value:
      number | null,
  ): string =>
    value === null
      ? ''
      : String(
          value,
        );

const formatMilliseconds =
  (
    milliseconds:
      number | null,
  ): string => {

    if (
      milliseconds ===
        null
    ) {
      return '';
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

    const formattedSeconds =
      seconds
        .toFixed(
          milliseconds %
            1000 ===
            0
            ? 0
            : 3,
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
        ? `0${formattedSeconds}`
        : formattedSeconds;

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

const formatSeconds =
  (
    totalSeconds:
      number | null,
  ): string => {

    if (
      totalSeconds ===
        null
    ) {
      return '';
    }

    const hours =
      Math.floor(
        totalSeconds /
          3600,
      );

    const minutes =
      Math.floor(
        (
          totalSeconds %
          3600
        ) /
          60,
      );

    const seconds =
      totalSeconds %
      60;

    if (
      hours >
      0
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

const parseTimeParts =
  (
    value:
      string,
  ): number[] | null => {

    const clean =
      value
        .trim()
        .replace(
          ',',
          '.',
        );

    if (!clean) {
      return null;
    }

    const parts =
      clean
        .split(
          ':',
        )
        .map(
          part =>
            Number(
              part,
            ),
        );

    if (
      parts.some(
        part =>
          !Number.isFinite(
            part,
          ),
      )
    ) {
      return null;
    }

    return parts;
  };

const parseDurationToMilliseconds =
  (
    value:
      string,
  ): number | null => {

    const parts =
      parseTimeParts(
        value,
      );

    if (!parts) {
      return null;
    }

    let totalSeconds:
      number;

    if (
      parts.length ===
      1
    ) {
      totalSeconds =
        parts[0]!;
    } else if (
      parts.length ===
      2
    ) {
      const [
        minutes,
        seconds,
      ] =
        parts;

      if (
        minutes! <
          0 ||
        seconds! <
          0 ||
        seconds! >=
          60
      ) {
        return null;
      }

      totalSeconds =
        minutes! *
          60 +
        seconds!;
    } else if (
      parts.length ===
      3
    ) {
      const [
        hours,
        minutes,
        seconds,
      ] =
        parts;

      if (
        hours! <
          0 ||
        minutes! <
          0 ||
        minutes! >=
          60 ||
        seconds! <
          0 ||
        seconds! >=
          60
      ) {
        return null;
      }

      totalSeconds =
        hours! *
          3600 +
        minutes! *
          60 +
        seconds!;
    } else {
      return null;
    }

    if (
      totalSeconds <
      0
    ) {
      return null;
    }

    return Math.round(
      totalSeconds *
        1000,
    );
  };

const parseRestToSeconds =
  (
    value:
      string,
  ): number | null => {

    const milliseconds =
      parseDurationToMilliseconds(
        value,
      );

    if (
      milliseconds ===
        null
    ) {
      return null;
    }

    return Math.round(
      milliseconds /
        1000,
    );
  };

const toNumber =
  (
    value:
      string,
  ): number | null => {

    const clean =
      value.trim();

    if (!clean) {
      return null;
    }

    const parsed =
      Number(
        clean.replace(
          ',',
          '.',
        ),
      );

    return Number.isFinite(
      parsed,
    )
      ? parsed
      : null;
  };

const buildActualForm =
  (
    entry:
      PerformanceEntry,
  ): FormState => ({
    reps:
      toStringValue(
        entry.actualReps,
      ),

    loadKg:
      toStringValue(
        entry.actualLoadKg,
      ),

    distanceM:
      toStringValue(
        entry.actualDistanceM,
      ),

    duration:
      formatMilliseconds(
        entry.actualDurationMs,
      ),

    resultM:
      toStringValue(
        entry.actualResultM,
      ),

    heightM:
      toStringValue(
        entry.actualHeightM,
      ),

    rpe:
      toStringValue(
        entry.actualRpe,
      ),

    rir:
      toStringValue(
        entry.actualRir,
      ),

    rest:
      formatSeconds(
        entry.actualRestSeconds,
      ),

    notes:
      entry.actualNotes ??
      '',
  });

const buildPlannedForm =
  (
    entry:
      PerformanceEntry,
  ): FormState => ({
    reps:
      toStringValue(
        entry.plannedReps,
      ),

    loadKg:
      toStringValue(
        entry.plannedLoadKg,
      ),

    distanceM:
      toStringValue(
        entry.plannedDistanceM,
      ),

    duration:
      formatMilliseconds(
        entry.plannedDurationMs,
      ),

    resultM:
      toStringValue(
        entry.plannedResultM,
      ),

    heightM:
      toStringValue(
        entry.plannedHeightM,
      ),

    rpe:
      toStringValue(
        entry.plannedRpe,
      ),

    rir:
      toStringValue(
        entry.plannedRir,
      ),

    rest:
      formatSeconds(
        entry.plannedRestSeconds,
      ),

    notes:
      '',
  });

const fieldsFor =
  (
    profile:
      MetricProfile,
  ): readonly FieldDefinition[] => {

    switch (
      profile
    ) {
      case 'STRENGTH':
        return [
          [
            'reps',
            'Reps',
            '6',
            'number',
          ],
          [
            'loadKg',
            'Carga (kg)',
            '80',
            'number',
          ],
          [
            'rir',
            'RIR',
            '2',
            'number',
          ],
          [
            'rpe',
            'RPE',
            '8',
            'number',
          ],
          [
            'rest',
            'Recuperación',
            '02:00',
            'rest',
          ],
        ];

      case 'INTERVAL':
        return [
          [
            'distanceM',
            'Distancia (m)',
            '100',
            'number',
          ],
          [
            'duration',
            'Tiempo',
            '1:43.27',
            'duration',
          ],
          [
            'rpe',
            'RPE',
            '8',
            'number',
          ],
          [
            'rest',
            'Recuperación',
            '00:20',
            'rest',
          ],
        ];

      case 'CONTINUOUS':
        return [
          [
            'distanceM',
            'Distancia (m)',
            '5000',
            'number',
          ],
          [
            'duration',
            'Duración',
            '20:31.42',
            'duration',
          ],
          [
            'rpe',
            'RPE',
            '6',
            'number',
          ],
        ];

      case 'ATTEMPT_DISTANCE':
        return [
          [
            'resultM',
            'Resultado (m)',
            '58.42',
            'number',
          ],
          [
            'rpe',
            'RPE',
            '8',
            'number',
          ],
          [
            'rest',
            'Recuperación',
            '03:00',
            'rest',
          ],
        ];

      case 'ATTEMPT_HEIGHT':
        return [
          [
            'heightM',
            'Altura (m)',
            '1.95',
            'number',
          ],
          [
            'rpe',
            'RPE',
            '8',
            'number',
          ],
          [
            'rest',
            'Recuperación',
            '03:00',
            'rest',
          ],
        ];

      case 'REHAB':
        return [
          [
            'reps',
            'Reps',
            '12',
            'number',
          ],
          [
            'loadKg',
            'Carga (kg)',
            '',
            'number',
          ],
          [
            'duration',
            'Duración',
            '00:30',
            'duration',
          ],
          [
            'rpe',
            'RPE',
            '4',
            'number',
          ],
          [
            'rest',
            'Recuperación',
            '00:30',
            'rest',
          ],
        ];

      case 'GENERIC':
      default:
        return [
          [
            'reps',
            'Reps',
            '',
            'number',
          ],
          [
            'duration',
            'Duración',
            '',
            'duration',
          ],
          [
            'rpe',
            'RPE',
            '',
            'number',
          ],
          [
            'rest',
            'Recuperación',
            '',
            'rest',
          ],
        ];
    }
  };

const actualValuesForProfile =
  (
    profile:
      MetricProfile,

    entry:
      PerformanceEntry,
  ): Array<
    [
      number | null,
      number | null,
    ]
  > => {

    switch (
      profile
    ) {
      case 'STRENGTH':
        return [
          [
            entry.plannedReps,
            entry.actualReps,
          ],
          [
            entry.plannedLoadKg,
            entry.actualLoadKg,
          ],
          [
            entry.plannedRir,
            entry.actualRir,
          ],
          [
            entry.plannedRpe,
            entry.actualRpe,
          ],
          [
            entry.plannedRestSeconds,
            entry.actualRestSeconds,
          ],
        ];

      case 'INTERVAL':
        return [
          [
            entry.plannedDistanceM,
            entry.actualDistanceM,
          ],
          [
            entry.plannedDurationMs,
            entry.actualDurationMs,
          ],
          [
            entry.plannedRpe,
            entry.actualRpe,
          ],
          [
            entry.plannedRestSeconds,
            entry.actualRestSeconds,
          ],
        ];

      case 'CONTINUOUS':
        return [
          [
            entry.plannedDistanceM,
            entry.actualDistanceM,
          ],
          [
            entry.plannedDurationMs,
            entry.actualDurationMs,
          ],
          [
            entry.plannedRpe,
            entry.actualRpe,
          ],
        ];

      case 'ATTEMPT_DISTANCE':
        return [
          [
            entry.plannedResultM,
            entry.actualResultM,
          ],
          [
            entry.plannedRpe,
            entry.actualRpe,
          ],
          [
            entry.plannedRestSeconds,
            entry.actualRestSeconds,
          ],
        ];

      case 'ATTEMPT_HEIGHT':
        return [
          [
            entry.plannedHeightM,
            entry.actualHeightM,
          ],
          [
            entry.plannedRpe,
            entry.actualRpe,
          ],
          [
            entry.plannedRestSeconds,
            entry.actualRestSeconds,
          ],
        ];

      case 'REHAB':
        return [
          [
            entry.plannedReps,
            entry.actualReps,
          ],
          [
            entry.plannedLoadKg,
            entry.actualLoadKg,
          ],
          [
            entry.plannedDurationMs,
            entry.actualDurationMs,
          ],
          [
            entry.plannedRpe,
            entry.actualRpe,
          ],
          [
            entry.plannedRestSeconds,
            entry.actualRestSeconds,
          ],
        ];

      case 'GENERIC':
      default:
        return [
          [
            entry.plannedReps,
            entry.actualReps,
          ],
          [
            entry.plannedDurationMs,
            entry.actualDurationMs,
          ],
          [
            entry.plannedRpe,
            entry.actualRpe,
          ],
          [
            entry.plannedRestSeconds,
            entry.actualRestSeconds,
          ],
        ];
    }
  };

const getActualStatus =
  (
    profile:
      MetricProfile,

    entry:
      PerformanceEntry,
  ):
    | 'EMPTY'
    | 'MATCH'
    | 'CHANGED' => {

    const pairs =
      actualValuesForProfile(
        profile,
        entry,
      );

    const hasActual =
      pairs.some(
        ([
          _planned,
          actual,
        ]) =>
          actual !==
            null,
      ) ||
      Boolean(
        entry.actualNotes,
      );

    if (!hasActual) {
      return 'EMPTY';
    }

    const matches =
      pairs.every(
        ([
          planned,
          actual,
        ]) =>
          planned ===
          actual,
      );

    return matches
      ? 'MATCH'
      : 'CHANGED';
  };

export function PerformanceActualEditor({
  athleteId,
  metricProfile,
  entry,
  rowNumber,
}: PerformanceActualEditorProps) {

  const router =
    useRouter();

  const [
    open,
    setOpen,
  ] =
    useState(
      false,
    );

  const [
    form,
    setForm,
  ] =
    useState<FormState>(
      () =>
        buildActualForm(
          entry,
        ),
    );

  const [
    busy,
    setBusy,
  ] =
    useState(
      false,
    );

  const [
    error,
    setError,
  ] =
    useState<
      string | null
    >(
      null,
    );

  const fields =
    fieldsFor(
      metricProfile,
    );

  const status =
    getActualStatus(
      metricProfile,
      entry,
    );

  const openEditor =
    () => {

      setForm(
        buildActualForm(
          entry,
        ),
      );

      setError(
        null,
      );

      setOpen(
        true,
      );
    };

  const close =
    () => {

      if (busy) {
        return;
      }

      setOpen(
        false,
      );

      setError(
        null,
      );
    };

  const update =
    (
      field:
        keyof FormState,

      value:
        string,
    ) => {

      setForm(
        current => ({
          ...current,

          [field]:
            value,
        }),
      );
    };

  const copyPlan =
    () => {

      setForm(
        buildPlannedForm(
          entry,
        ),
      );

      setError(
        null,
      );
    };

  const save =
    async () => {

      if (busy) {
        return;
      }

      const durationMs =
        form.duration.trim()
          ? parseDurationToMilliseconds(
              form.duration,
            )
          : null;

      const restSeconds =
        form.rest.trim()
          ? parseRestToSeconds(
              form.rest,
            )
          : null;

      if (
        form.duration.trim() &&
        durationMs ===
          null
      ) {
        setError(
          'El tiempo debe ser ss.dd, mm:ss.dd o hh:mm:ss.dd.',
        );

        return;
      }

      if (
        form.rest.trim() &&
        restSeconds ===
          null
      ) {
        setError(
          'La recuperación debe tener formato ss, mm:ss o hh:mm:ss.',
        );

        return;
      }

      setBusy(
        true,
      );

      setError(
        null,
      );

      try {
        const response =
          await fetch(
            `/api/training/athletes/${encodeURIComponent(
              athleteId,
            )}/performance-entries/${encodeURIComponent(
              entry.id,
            )}`,
            {
              method:
                'PATCH',

              headers: {
                'content-type':
                  'application/json',
              },

              body:
                JSON.stringify({
                  actual: {
                    reps:
                      toNumber(
                        form.reps,
                      ),

                    loadKg:
                      toNumber(
                        form.loadKg,
                      ),

                    distanceM:
                      toNumber(
                        form.distanceM,
                      ),

                    durationMs,

                    resultM:
                      toNumber(
                        form.resultM,
                      ),

                    heightM:
                      toNumber(
                        form.heightM,
                      ),

                    rpe:
                      toNumber(
                        form.rpe,
                      ),

                    rir:
                      toNumber(
                        form.rir,
                      ),

                    restSeconds,

                    success:
                      null,

                    isFoul:
                      null,

                    metrics:
                      {},

                    notes:
                      form.notes.trim() ||
                      null,
                  },
                }),
            },
          );

        if (!response.ok) {
          throw new Error(
            'No se ha podido guardar el resultado real.',
          );
        }

        setOpen(
          false,
        );

        router.refresh();

      } catch (
        caught
      ) {
        setError(
          caught instanceof
            Error
            ? caught.message
            : 'No se ha podido guardar el resultado real.',
        );

      } finally {
        setBusy(
          false,
        );
      }
    };

  const triggerClassName =
    status ===
      'MATCH'
      ? `${styles.trigger} ${styles.match}`
      : status ===
          'CHANGED'
        ? `${styles.trigger} ${styles.changed}`
        : styles.trigger;

  return (
    <>
      <button
        type="button"
        className={
          triggerClassName
        }
        onClick={
          openEditor
        }
      >
        {status ===
        'EMPTY' ? (
          <Circle />
        ) : status ===
          'MATCH' ? (
          <Check />
        ) : (
          <Pencil />
        )}

        <span>
          {status ===
          'EMPTY'
            ? 'Registrar'
            : status ===
                'MATCH'
              ? 'Igual'
              : 'Cambios'}
        </span>
      </button>

      {open &&
        typeof document !==
          'undefined' &&
        createPortal(
          <div
            className={
              styles.overlay
            }
            role="presentation"
            onMouseDown={(
              event,
            ) => {

              if (
                event.target ===
                event.currentTarget
              ) {
                close();
              }
            }}
          >
            <div
              className={
                styles.dialog
              }
              role="dialog"
              aria-modal="true"
              aria-labelledby={`actual-performance-${entry.id}`}
            >
              <header
                className={
                  styles.header
                }
              >
                <div>
                  <span
                    className={
                      styles.eyebrow
                    }
                  >
                    Resultado real
                  </span>

                  <h3
                    id={`actual-performance-${entry.id}`}
                  >
                    Registro {rowNumber}
                  </h3>

                  <p>
                    El plan original no se modifica.
                  </p>
                </div>

                <button
                  type="button"
                  className={
                    styles.closeButton
                  }
                  aria-label="Cerrar"
                  onClick={
                    close
                  }
                  disabled={
                    busy
                  }
                >
                  <X />
                </button>
              </header>

              <button
                type="button"
                className={
                  styles.copyPlanButton
                }
                onClick={
                  copyPlan
                }
                disabled={
                  busy
                }
              >
                <Equal />

                <span>
                  Igual que plan
                </span>
              </button>

              <div
                className={
                  styles.fields
                }
              >
                {fields.map(
                  ([
                    field,
                    label,
                    placeholder,
                    inputType,
                  ]) => (
                    <label
                      key={
                        field
                      }
                      className={
                        styles.field
                      }
                    >
                      <span>
                        {label}
                      </span>

                      <input
                        type={
                          inputType ===
                            'number'
                            ? 'number'
                            : 'text'
                        }
                        inputMode={
                          inputType ===
                            'number'
                            ? 'decimal'
                            : 'numeric'
                        }
                        min={
                          inputType ===
                            'number'
                            ? '0'
                            : undefined
                        }
                        step={
                          inputType ===
                            'number'
                            ? 'any'
                            : undefined
                        }
                        placeholder={
                          placeholder
                        }
                        value={
                          form[
                            field
                          ]
                        }
                        onChange={(
                          event,
                        ) =>
                          update(
                            field,
                            event.target.value,
                          )
                        }
                      />
                    </label>
                  ),
                )}
              </div>

              <label
                className={
                  styles.notes
                }
              >
                <span>
                  Nota real
                </span>

                <input
                  type="text"
                  placeholder="Sensaciones, incidencia, contexto…"
                  value={
                    form.notes
                  }
                  onChange={(
                    event,
                  ) =>
                    update(
                      'notes',
                      event.target.value,
                    )
                  }
                />
              </label>

              {error && (
                <div
                  className={
                    styles.error
                  }
                >
                  {error}
                </div>
              )}

              <footer
                className={
                  styles.actions
                }
              >
                <button
                  type="button"
                  className={
                    styles.cancelButton
                  }
                  onClick={
                    close
                  }
                  disabled={
                    busy
                  }
                >
                  Cancelar
                </button>

                <button
                  type="button"
                  className={
                    styles.saveButton
                  }
                  onClick={() => {
                    void save();
                  }}
                  disabled={
                    busy
                  }
                >
                  <Check />

                  <span>
                    {busy
                      ? 'Guardando…'
                      : 'Guardar real'}
                  </span>
                </button>
              </footer>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
