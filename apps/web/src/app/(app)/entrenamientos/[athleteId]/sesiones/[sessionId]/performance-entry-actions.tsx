'use client';

import {
  Check,
  Copy,
  Pencil,
  Trash2,
  X,
} from 'lucide-react';

import {
  useRouter,
} from 'next/navigation';

import {
  useEffect,
  useRef,
  useState,
} from 'react';

import {
  createPortal,
} from 'react-dom';

import styles from './performance-entry-actions.module.css';

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

  plannedLoadKg:
    number | null;

  plannedDistanceM:
    number | null;

  plannedDurationMs:
    number | null;

  plannedResultM:
    number | null;

  plannedHeightM:
    number | null;

  plannedRpe:
    number | null;

  plannedRir:
    number | null;

  plannedRestSeconds:
    number | null;

  plannedNotes:
    string | null;
}

interface PerformanceEntryActionsProps {
  athleteId:
    string;

  sessionExerciseId:
    string;

  metricProfile:
    MetricProfile;

  entry:
    PerformanceEntry;

  rowNumber:
    number;

  duplicatePosition:
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
    'number' | 'time',
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

const formatTime =
  (
    totalSeconds:
      number | null,
  ): string => {
    if (
      totalSeconds === null
    ) {
      return '';
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

const buildForm =
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
      formatTime(
        entry.plannedDurationMs ===
          null
          ? null
          : entry.plannedDurationMs /
              1000,
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
      formatTime(
        entry.plannedRestSeconds,
      ),

    notes:
      entry.plannedNotes ??
      '',
  });

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
      parts.length ===
      1
    ) {
      const seconds =
        Number(
          parts[0],
        );

      return Number.isFinite(
        seconds,
      ) &&
        seconds >= 0
        ? seconds
        : null;
    }

    if (
      parts.length ===
      2
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
      parts.length ===
      3
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

const fieldsFor =
  (
    metricProfile:
      MetricProfile,
  ): readonly FieldDefinition[] => {
    switch (
      metricProfile
    ) {
      case 'STRENGTH':
        return [
          [
            'reps',
            'Reps',
            '8',
            'number',
          ],
          [
            'loadKg',
            'kg',
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
            '7',
            'number',
          ],
          [
            'rest',
            'Recuperación',
            '02:00',
            'time',
          ],
        ];

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
            '20:00',
            'time',
          ],
          [
            'rpe',
            'RPE',
            '5',
            'number',
          ],
        ];

      case 'ATTEMPT_DISTANCE':
        return [
          [
            'resultM',
            'Resultado (m)',
            '6.20',
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
            'time',
          ],
        ];

      case 'ATTEMPT_HEIGHT':
        return [
          [
            'heightM',
            'Altura (m)',
            '1.80',
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
            'time',
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
        ];
    }
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

export function PerformanceEntryActions({
  athleteId,
  sessionExerciseId,
  metricProfile,
  entry,
  rowNumber,
  duplicatePosition,
}: PerformanceEntryActionsProps) {
  const router =
    useRouter();

  const rootRef =
    useRef<HTMLDivElement | null>(
      null,
    );

  const buttonRef =
    useRef<HTMLButtonElement | null>(
      null,
    );

  const menuRef =
    useRef<HTMLDivElement | null>(
      null,
    );

  const [
    menuPosition,
    setMenuPosition,
  ] =
    useState<{
      top: number;
      left: number;
    } | null>(
      null,
    );

  const [
    menuOpen,
    setMenuOpen,
  ] =
    useState(
      false,
    );

  const [
    editing,
    setEditing,
  ] =
    useState(
      false,
    );

  const [
    confirmDelete,
    setConfirmDelete,
  ] =
    useState(
      false,
    );

  const [
    busy,
    setBusy,
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
        buildForm(
          entry,
        ),
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

  useEffect(
    () => {
      if (!menuOpen) {
        return;
      }

      const handlePointerDown =
        (
          event:
            PointerEvent,
        ) => {
          const target =
            event.target as
              Node | null;

          if (
            rootRef.current?.contains(
              target,
            ) ||
            menuRef.current?.contains(
              target,
            )
          ) {
            return;
          }

          setMenuOpen(
            false,
          );

          setConfirmDelete(
            false,
          );
        };

      document.addEventListener(
        'pointerdown',
        handlePointerDown,
      );

      return () => {
        document.removeEventListener(
          'pointerdown',
          handlePointerDown,
        );
      };
    },
    [
      menuOpen,
    ],
  );

  useEffect(
    () => {
      if (
        !menuOpen ||
        !buttonRef.current
      ) {
        setMenuPosition(
          null,
        );

        return;
      }

      const rect =
        buttonRef.current
          .getBoundingClientRect();

      const menuWidth =
        170;

      const gap =
        6;

      const left =
        Math.max(
          8,
          Math.min(
            rect.right -
              menuWidth,
            window.innerWidth -
              menuWidth -
              8,
          ),
        );

      const estimatedHeight =
        150;

      const spaceBelow =
        window.innerHeight -
        rect.bottom;

      const top =
        spaceBelow >=
        estimatedHeight +
          gap
          ? rect.bottom +
            gap
          : Math.max(
              8,
              rect.top -
                estimatedHeight -
                gap,
            );

      setMenuPosition({
        top,
        left,
      });
    },
    [
      menuOpen,
    ],
  );

  const fields =
    fieldsFor(
      metricProfile,
    );

  const label =
    entryLabel(
      metricProfile,
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

  const openEditor =
    () => {
      setForm(
        buildForm(
          entry,
        ),
      );

      setError(
        null,
      );

      setMenuOpen(
        false,
      );

      setEditing(
        true,
      );
    };

  const closeEditor =
    () => {
      if (busy) {
        return;
      }

      setEditing(
        false,
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

      const durationSeconds =
        parseTimeToSeconds(
          form.duration,
        );

      const restSeconds =
        parseTimeToSeconds(
          form.rest,
        );

      if (
        form.duration.trim() &&
        durationSeconds ===
          null
      ) {
        setError(
          'La duración debe tener formato mm:ss o hh:mm:ss.',
        );

        return;
      }

      if (
        form.rest.trim() &&
        restSeconds ===
          null
      ) {
        setError(
          'La recuperación debe tener formato mm:ss o hh:mm:ss.',
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
            `No se ha podido editar el ${label}.`,
          );
        }

        setEditing(
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
            : `No se ha podido editar el ${label}.`,
        );

      } finally {
        setBusy(
          false,
        );
      }
    };

  const duplicate =
    async () => {
      if (busy) {
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
                  position:
                    duplicatePosition,

                  planned: {
                    reps:
                      entry.plannedReps,

                    loadKg:
                      entry.plannedLoadKg,

                    distanceM:
                      entry.plannedDistanceM,

                    durationMs:
                      entry.plannedDurationMs,

                    resultM:
                      entry.plannedResultM,

                    heightM:
                      entry.plannedHeightM,

                    rpe:
                      entry.plannedRpe,

                    rir:
                      entry.plannedRir,

                    restSeconds:
                      entry.plannedRestSeconds,

                    notes:
                      entry.plannedNotes,
                  },
                }),
            },
          );

        if (!response.ok) {
          throw new Error(
            `No se ha podido duplicar el ${label}.`,
          );
        }

        setMenuOpen(
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
            : `No se ha podido duplicar el ${label}.`,
        );

      } finally {
        setBusy(
          false,
        );
      }
    };

  const remove =
    async () => {
      if (busy) {
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
                'DELETE',
            },
          );

        if (!response.ok) {
          throw new Error(
            `No se ha podido eliminar el ${label}.`,
          );
        }

        setMenuOpen(
          false,
        );

        setConfirmDelete(
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
            : `No se ha podido eliminar el ${label}.`,
        );

      } finally {
        setBusy(
          false,
        );
      }
    };

  const editor =
    editing &&
    typeof document !==
      'undefined'
      ? createPortal(
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
                closeEditor();
              }
            }}
          >
            <div
              className={
                styles.dialog
              }
              role="dialog"
              aria-modal="true"
              aria-labelledby={`edit-performance-${entry.id}`}
            >
              <div
                className={
                  styles.dialogHeader
                }
              >
                <div>
                  <span
                    className={
                      styles.eyebrow
                    }
                  >
                    Editar
                  </span>

                  <h3
                    id={`edit-performance-${entry.id}`}
                  >
                    {label
                      .charAt(
                        0,
                      )
                      .toUpperCase() +
                      label.slice(
                        1,
                      )}{' '}
                    {rowNumber}
                  </h3>
                </div>

                <button
                  type="button"
                  className={
                    styles.closeButton
                  }
                  aria-label="Cerrar"
                  onClick={
                    closeEditor
                  }
                  disabled={
                    busy
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
                    fieldLabel,
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
                          fieldLabel
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

                      void save();
                    }

                    if (
                      event.key ===
                      'Escape'
                    ) {
                      closeEditor();
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
                  styles.dialogActions
                }
              >
                <button
                  type="button"
                  className={
                    styles.cancelButton
                  }
                  onClick={
                    closeEditor
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
                      : 'Guardar cambios'}
                  </span>
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )
      : null;

  return (
    <>
      <div
        ref={
          rootRef
        }
        className={
          styles.root
        }
      >
        <button
          ref={
            buttonRef
          }
          type="button"
          className={
            styles.menuButton
          }
          aria-label={`Opciones del ${label} ${rowNumber}`}
          aria-expanded={
            menuOpen
          }
          onClick={() => {
            setConfirmDelete(
              false,
            );

            setMenuOpen(
              current =>
                !current,
            );
          }}
          disabled={
            busy
          }
        >
          ···
        </button>

        {menuOpen &&
          menuPosition &&
          typeof document !==
            'undefined' &&
          createPortal(
            <div
              ref={
                menuRef
              }
              className={
                styles.menu
              }
              style={{
                top:
                  menuPosition.top,
                left:
                  menuPosition.left,
              }}
            >
            {!confirmDelete ? (
              <>
                <button
                  type="button"
                  onClick={
                    openEditor
                  }
                >
                  <Pencil />

                  <span>
                    Editar
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    void duplicate();
                  }}
                  disabled={
                    busy
                  }
                >
                  <Copy />

                  <span>
                    {busy
                      ? 'Duplicando…'
                      : 'Duplicar'}
                  </span>
                </button>

                <div
                  className={
                    styles.separator
                  }
                />

                <button
                  type="button"
                  className={
                    styles.danger
                  }
                  onClick={() =>
                    setConfirmDelete(
                      true,
                    )
                  }
                >
                  <Trash2 />

                  <span>
                    Eliminar
                  </span>
                </button>
              </>
            ) : (
              <div
                className={
                  styles.confirm
                }
              >
                <span>
                  ¿Eliminar {label} {rowNumber}?
                </span>

                <div>
                  <button
                    type="button"
                    onClick={() =>
                      setConfirmDelete(
                        false,
                      )
                    }
                    disabled={
                      busy
                    }
                  >
                    No
                  </button>

                  <button
                    type="button"
                    className={
                      styles.confirmDelete
                    }
                    onClick={() => {
                      void remove();
                    }}
                    disabled={
                      busy
                    }
                  >
                    {busy
                      ? 'Eliminando…'
                      : 'Sí, eliminar'}
                  </button>
                </div>
              </div>
            )}

            {error && (
              <span
                className={
                  styles.menuError
                }
              >
                {error}
              </span>
            )}
          </div>,
          document.body,
        )}
      </div>

      {editor}
    </>
  );
}
