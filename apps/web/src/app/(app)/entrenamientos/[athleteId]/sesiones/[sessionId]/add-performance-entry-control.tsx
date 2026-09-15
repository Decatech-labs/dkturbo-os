'use client';

import {
  Check,
  Plus,
  X,
} from 'lucide-react';

import {
  useRouter,
} from 'next/navigation';

import {
  useState,
} from 'react';

import styles from './add-performance-entry-control.module.css';

type MetricProfile =
  | 'STRENGTH'
  | 'INTERVAL'
  | 'CONTINUOUS'
  | 'ATTEMPT_DISTANCE'
  | 'ATTEMPT_HEIGHT'
  | 'REHAB'
  | 'GENERIC';

interface AddPerformanceEntryControlProps {
  athleteId:
    string;

  sessionExerciseId:
    string;

  metricProfile:
    MetricProfile;

  position:
    number;
}

interface FormState {
  reps:
    string;

  loadKg:
    string;

  distanceM:
    string;

  resultM:
    string;

  heightM:
    string;

  rpe:
    string;

  rir:
    string;

  duration:
    string;

  rest:
    string;

  notes:
    string;
}

const initialState:
  FormState = {
    reps:
      '',

    loadKg:
      '',

    distanceM:
      '',

    resultM:
      '',

    heightM:
      '',

    rpe:
      '',

    rir:
      '',

    duration:
      '',

    rest:
      '',

    notes:
      '',
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

const parseTimeToSeconds =
  (
    value:
      string,
  ): number | null => {
    const clean =
      value.trim();

    if (!clean) {
      return null;
    }

    const parts =
      clean.split(
        ':',
      );

    if (
      parts.length === 1
    ) {
      const seconds =
        Number(
          parts[0],
        );

      return Number.isFinite(
        seconds,
      )
        ? seconds
        : null;
    }

    if (
      parts.length === 2
    ) {
      const minutes =
        Number(
          parts[0],
        );

      const seconds =
        Number(
          parts[1],
        );

      if (
        !Number.isFinite(
          minutes,
        ) ||
        !Number.isFinite(
          seconds,
        ) ||
        minutes < 0 ||
        seconds < 0 ||
        seconds >= 60
      ) {
        return null;
      }

      return (
        minutes *
          60 +
        seconds
      );
    }

    if (
      parts.length === 3
    ) {
      const hours =
        Number(
          parts[0],
        );

      const minutes =
        Number(
          parts[1],
        );

      const seconds =
        Number(
          parts[2],
        );

      if (
        !Number.isFinite(
          hours,
        ) ||
        !Number.isFinite(
          minutes,
        ) ||
        !Number.isFinite(
          seconds,
        ) ||
        hours < 0 ||
        minutes < 0 ||
        minutes >= 60 ||
        seconds < 0 ||
        seconds >= 60
      ) {
        return null;
      }

      return (
        hours *
          3600 +
        minutes *
          60 +
        seconds
      );
    }

    return null;
  };

const entryLabel =
  (
    metricProfile:
      MetricProfile,
  ): string => {
    switch (
      metricProfile
    ) {
      case 'INTERVAL':
        return 'intervalo';

      case 'ATTEMPT_DISTANCE':
      case 'ATTEMPT_HEIGHT':
        return 'intento';

      case 'CONTINUOUS':
        return 'registro';

      default:
        return 'serie';
    }
  };

export function AddPerformanceEntryControl({
  athleteId,
  sessionExerciseId,
  metricProfile,
  position,
}: AddPerformanceEntryControlProps) {
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
      initialState,
    );

  const [
    submitting,
    setSubmitting,
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

  const close =
    () => {
      if (submitting) {
        return;
      }

      setOpen(
        false,
      );

      setForm(
        initialState,
      );

      setError(
        null,
      );
    };

  const submit =
    async () => {
      if (submitting) {
        return;
      }

      setSubmitting(
        true,
      );

      setError(
        null,
      );

      const durationSeconds =
        parseTimeToSeconds(
          form.duration,
        );

      const restSeconds =
        parseTimeToSeconds(
          form.rest,
        );

      try {
        const response =
          await fetch(
            `/api/training/athletes/${encodeURIComponent(
              athleteId,
            )}/session-exercises/${encodeURIComponent(
              sessionExerciseId,
            )}/performance-entries`,
            {
              method:
                'POST',

              headers: {
                'content-type':
                  'application/json',
              },

              body:
                JSON.stringify({
                  position,

                  planned: {
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

                    durationMs:
                      durationSeconds ===
                      null
                        ? null
                        : Math.round(
                            durationSeconds *
                            1000,
                          ),

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

                    restSeconds:
                      restSeconds,

                    notes:
                      form.notes.trim() ||
                      null,
                  },
                }),
            },
          );

        if (!response.ok) {
          throw new Error(
            'No se ha podido añadir el registro.',
          );
        }

        close();

        router.refresh();

      } catch (
        caught
      ) {
        setError(
          caught instanceof Error
            ? caught.message
            : 'No se ha podido añadir el registro.',
        );

      } finally {
        setSubmitting(
          false,
        );
      }
    };

  const fields =
    (() => {
      switch (
        metricProfile
      ) {
        case 'STRENGTH':
          return [
            [
              'reps',
              'Reps',
              '8',
            ],
            [
              'loadKg',
              'kg',
              '80',
            ],
            [
              'rir',
              'RIR',
              '2',
            ],
            [
              'rpe',
              'RPE',
              '7',
            ],
            [
              'rest',
              'Recuperación',
              '02:00',
              'time',
            ],
          ] as const;

        case 'INTERVAL':
          return [
            [
              'distanceM',
              'Distancia (m)',
              '200',
              'number',
            ],
            [
              'duration',
              'Duración',
              '00:32',
              'time',
            ],
            [
              'rpe',
              'RPE',
              '7',
              'number',
            ],
            [
              'rest',
              'Recuperación',
              '01:30',
              'time',
            ],
          ] as const;

        case 'CONTINUOUS':
          return [
            [
              'distanceM',
              'Distancia (m)',
              '5000',
            ],
            [
              'duration',
              'Duración',
              '20:00',
              'time',
            ],
            [
              'rpe',
              'RPE',
              '5',
            ],
          ] as const;

        case 'ATTEMPT_DISTANCE':
          return [
            [
              'resultM',
              'Resultado (m)',
              '6.20',
            ],
            [
              'rpe',
              'RPE',
              '8',
            ],
            [
              'rest',
              'Recuperación',
              '03:00',
              'time',
            ],
          ] as const;

        case 'ATTEMPT_HEIGHT':
          return [
            [
              'heightM',
              'Altura (m)',
              '1.80',
            ],
            [
              'rpe',
              'RPE',
              '8',
            ],
            [
              'rest',
              'Recuperación',
              '03:00',
              'time',
            ],
          ] as const;

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
              'kg',
              '',
              'number',
            ],
            [
              'duration',
              'Duración',
              '00:30',
              'time',
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
              'time',
            ],
          ] as const;

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
              'time',
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
              'time',
            ],
          ] as const;
      }
    })();

  const label =
    entryLabel(
      metricProfile,
    );

  if (!open) {
    return (
      <button
        type="button"
        className={
          styles.trigger
        }
        onClick={() =>
          setOpen(
            true,
          )
        }
      >
        <Plus />

        <span>
          Añadir {label}
        </span>
      </button>
    );
  }

  return (
    <div
      className={
        styles.editor
      }
    >

      <div
        className={
          styles.editorHeader
        }
      >
        <span>
          {label
            .charAt(
              0,
            )
            .toUpperCase() +
            label.slice(
              1,
            )}{' '}
          {position + 1}
        </span>

        <button
          type="button"
          aria-label="Cancelar"
          className={
            styles.iconButton
          }
          onClick={
            close
          }
        >
          <X />
        </button>
      </div>

      <div
        className={
          styles.fields
        }
      >
        {fields.map(
          ([
            field,
            labelText,
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
                {
                  labelText
                }
              </span>

              <input
                type={
                  inputType ===
                  'time'
                    ? 'text'
                    : 'number'
                }
                inputMode={
                  inputType ===
                  'time'
                    ? 'numeric'
                    : 'decimal'
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
                  form[field]
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
          Nota
        </span>

        <input
          type="text"
          placeholder="Opcional"
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
          onKeyDown={(
            event,
          ) => {
            if (
              event.key ===
              'Enter'
            ) {
              event.preventDefault();

              void submit();
            }

            if (
              event.key ===
              'Escape'
            ) {
              close();
            }
          }}
        />
      </label>

      {error && (
        <span
          className={
            styles.error
          }
        >
          {error}
        </span>
      )}

      <div
        className={
          styles.actions
        }
      >
        <button
          type="button"
          className={
            styles.cancel
          }
          onClick={
            close
          }
          disabled={
            submitting
          }
        >
          Cancelar
        </button>

        <button
          type="button"
          className={
            styles.save
          }
          onClick={() => {
            void submit();
          }}
          disabled={
            submitting
          }
        >
          <Check />

          <span>
            {submitting
              ? 'Guardando…'
              : 'Añadir'}
          </span>
        </button>
      </div>

    </div>
  );
}
