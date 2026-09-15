'use client';

import {
  Plus,
  Search,
  SlidersHorizontal,
  X,
} from 'lucide-react';

import {
  useRouter,
} from 'next/navigation';

import {
  useEffect,
  useState,
} from 'react';

import styles from './add-exercise-control.module.css';

interface ExerciseResult {
  id:
    string;

  name:
    string;

  category:
    string | null;

  sport:
    string | null;

  metricProfile:
    string;

  origin:
    'SYSTEM' | 'CUSTOM';

  createdByUserId:
    string | null;
}

interface AddExerciseControlProps {
  athleteId:
    string;

  blockId:
    string;

  position:
    number;
}

const METRIC_PROFILES = [
  [
    'STRENGTH',
    'Fuerza',
  ],
  [
    'INTERVAL',
    'Intervalos',
  ],
  [
    'CONTINUOUS',
    'Continuo',
  ],
  [
    'ATTEMPT_DISTANCE',
    'Intentos · distancia',
  ],
  [
    'ATTEMPT_HEIGHT',
    'Intentos · altura',
  ],
  [
    'REHAB',
    'Rehabilitación',
  ],
  [
    'GENERIC',
    'Genérico',
  ],
] as const;

const metricLabel =
  (
    profile:
      string,
  ): string =>
    METRIC_PROFILES.find(
      ([value]) =>
        value ===
        profile,
    )?.[1] ??
    profile;

export function AddExerciseControl({
  athleteId,
  blockId,
  position,
}: AddExerciseControlProps) {
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
    query,
    setQuery,
  ] =
    useState('');

  const [
    metricFilter,
    setMetricFilter,
  ] =
    useState('');

  const [
    originFilter,
    setOriginFilter,
  ] =
    useState('');

  const [
    filtersOpen,
    setFiltersOpen,
  ] =
    useState(
      false,
    );

  const [
    sportFilter,
    setSportFilter,
  ] =
    useState('');

  const [
    results,
    setResults,
  ] =
    useState<
      ExerciseResult[]
    >([]);

  const [
    loading,
    setLoading,
  ] =
    useState(
      false,
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

  const [
    creatingCustom,
    setCreatingCustom,
  ] =
    useState(
      false,
    );

  const [
    customName,
    setCustomName,
  ] =
    useState('');

  const [
    customMetricProfile,
    setCustomMetricProfile,
  ] =
    useState(
      'GENERIC',
    );

  const activeFilterCount =
    [
      metricFilter,
      originFilter,
      sportFilter.trim(),
    ].filter(
      Boolean,
    ).length;

  const clearFilters =
    () => {
      setMetricFilter('');
      setOriginFilter('');
      setSportFilter('');
    };

  useEffect(
    () => {
      if (
        !open ||
        creatingCustom
      ) {
        return;
      }

      const controller =
        new AbortController();

      const timeout =
        window.setTimeout(
          async () => {
            setLoading(
              true,
            );

            setError(
              null,
            );

            try {
              const params =
                new URLSearchParams();

              if (
                query.trim()
              ) {
                params.set(
                  'query',
                  query.trim(),
                );
              }

              if (
                metricFilter
              ) {
                params.set(
                  'metricProfile',
                  metricFilter,
                );
              }

              if (
                originFilter
              ) {
                params.set(
                  'origin',
                  originFilter,
                );
              }

              if (
                sportFilter.trim()
              ) {
                params.set(
                  'sport',
                  sportFilter.trim(),
                );
              }

              const response =
                await fetch(
                  `/api/training/exercises?${params.toString()}`,
                  {
                    signal:
                      controller.signal,
                  },
                );

              if (!response.ok) {
                throw new Error(
                  'No se ha podido cargar el catálogo.',
                );
              }

              const body =
                await response.json() as
                  ExerciseResult[];

              setResults(
                body,
              );
            } catch (
              caught
            ) {
              if (
                caught instanceof
                  DOMException &&
                caught.name ===
                  'AbortError'
              ) {
                return;
              }

              setError(
                caught instanceof
                  Error
                  ? caught.message
                  : 'No se ha podido cargar el catálogo.',
              );
            } finally {
              if (
                !controller
                  .signal
                  .aborted
              ) {
                setLoading(
                  false,
                );
              }
            }
          },
          180,
        );

      return () => {
        window.clearTimeout(
          timeout,
        );

        controller.abort();
      };
    },
    [
      open,
      query,
      metricFilter,
      originFilter,
      sportFilter,
      creatingCustom,
    ],
  );

  const close =
    () => {
      if (submitting) {
        return;
      }

      setOpen(
        false,
      );

      setCreatingCustom(
        false,
      );

      setQuery('');
      setCustomName('');
      setCustomMetricProfile(
        'GENERIC',
      );
      setError(
        null,
      );

      setMetricFilter('');
      setOriginFilter('');
      setSportFilter('');

      setFiltersOpen(
        false,
      );
    };

  const addExisting =
    async (
      exerciseId:
        string,
    ) => {
      if (submitting) {
        return;
      }

      setSubmitting(
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
            )}/blocks/${encodeURIComponent(
              blockId,
            )}/exercises`,
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

                  existingExerciseId:
                    exerciseId,

                  plannedNotes:
                    null,
                }),
            },
          );

        if (!response.ok) {
          throw new Error(
            'No se ha podido añadir el ejercicio.',
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
            : 'No se ha podido añadir el ejercicio.',
        );
      } finally {
        setSubmitting(
          false,
        );
      }
    };

  const addCustom =
    async () => {
      const cleanName =
        customName.trim();

      if (
        !cleanName ||
        submitting
      ) {
        return;
      }

      setSubmitting(
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
            )}/blocks/${encodeURIComponent(
              blockId,
            )}/exercises`,
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

                  manualExercise: {
                    name:
                      cleanName,

                    category:
                      null,

                    sport:
                      null,

                    metricProfile:
                      customMetricProfile,
                  },

                  plannedNotes:
                    null,
                }),
            },
          );

        if (!response.ok) {
          throw new Error(
            'No se ha podido crear el ejercicio.',
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
            : 'No se ha podido crear el ejercicio.',
        );
      } finally {
        setSubmitting(
          false,
        );
      }
    };

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
          Añadir ejercicio
        </span>
      </button>
    );
  }

  return (
    <div
      className={
        styles.panel
      }
    >

      <div
        className={
          styles.header
        }
      >
        <div
          className={
            styles.headerText
          }
        >
          <strong>
            Añadir ejercicio
          </strong>

          <span>
            Busca en el catálogo o crea uno nuevo
          </span>
        </div>

        <button
          type="button"
          className={
            styles.close
          }
          aria-label="Cerrar"
          onClick={
            close
          }
        >
          <X />
        </button>
      </div>

      {!creatingCustom ? (
        <>
          <div
            className={
              styles.search
            }
          >
            <Search />

            <input
              type="text"
              autoFocus
              value={
                query
              }
              placeholder="Buscar ejercicio…"
              onChange={(
                event,
              ) =>
                setQuery(
                  event.target.value,
                )
              }
              onKeyDown={(
                event,
              ) => {
                if (
                  event.key ===
                  'Escape'
                ) {
                  close();
                }
              }}
            />
          </div>

          <div
            className={
              styles.filterToolbar
            }
          >
            <button
              type="button"
              className={[
                styles.filterButton,

                filtersOpen
                  ? styles.filterButtonOpen
                  : '',

                activeFilterCount > 0
                  ? styles.filterButtonActive
                  : '',
              ]
                .filter(
                  Boolean,
                )
                .join(
                  ' ',
                )}
              onClick={() =>
                setFiltersOpen(
                  current =>
                    !current,
                )
              }
            >
              <SlidersHorizontal />

              <span>
                Filtros
              </span>

              {activeFilterCount > 0 && (
                <span
                  className={
                    styles.filterCount
                  }
                >
                  {
                    activeFilterCount
                  }
                </span>
              )}
            </button>

            {activeFilterCount > 0 && (
              <button
                type="button"
                className={
                  styles.clearFilters
                }
                onClick={
                  clearFilters
                }
              >
                Limpiar
              </button>
            )}
          </div>

          {filtersOpen && (
            <div
              className={
                styles.filters
              }
            >
              <label
                className={
                  styles.field
                }
              >
                <span
                  className={
                    styles.fieldLabel
                  }
                >
                  Tipo
                </span>

                <select
                  value={
                    metricFilter
                  }
                  onChange={(
                    event,
                  ) =>
                    setMetricFilter(
                      event.target.value,
                    )
                  }
                >
                  <option value="">
                    Todos los tipos
                  </option>

                  {METRIC_PROFILES.map(
                    ([
                      value,
                      label,
                    ]) => (
                      <option
                        key={
                          value
                        }
                        value={
                          value
                        }
                      >
                        {
                          label
                        }
                      </option>
                    ),
                  )}
                </select>
              </label>

              <div
                className={
                  styles.field
                }
              >
                <span
                  className={
                    styles.fieldLabel
                  }
                >
                  Origen
                </span>

                <div
                  className={
                    styles.origin
                  }
                >
                  {([
                    [
                      '',
                      'Todos',
                    ],
                    [
                      'SYSTEM',
                      'Sistema',
                    ],
                    [
                      'CUSTOM',
                      'Personal',
                    ],
                  ] as const).map(
                    ([
                      value,
                      label,
                    ]) => (
                      <button
                        type="button"
                        key={
                          value ||
                          'ALL'
                        }
                        className={
                          originFilter ===
                          value
                            ? styles.originSelected
                            : undefined
                        }
                        onClick={() =>
                          setOriginFilter(
                            value,
                          )
                        }
                      >
                        {
                          label
                        }
                      </button>
                    ),
                  )}
                </div>
              </div>

              <label
                className={[
                  styles.field,
                  styles.sportField,
                ].join(
                  ' ',
                )}
              >
                <span
                  className={
                    styles.fieldLabel
                  }
                >
                  Deporte
                </span>

                <input
                  type="text"
                  value={
                    sportFilter
                  }
                  placeholder="Ej. natación, atletismo…"
                  onChange={(
                    event,
                  ) =>
                    setSportFilter(
                      event.target.value,
                    )
                  }
                />
              </label>
            </div>
          )}

          <div
            className={
              styles.results
            }
          >
            {loading ? (
              <span
                className={
                  styles.status
                }
              >
                Buscando…
              </span>
            ) : results.length ===
              0 ? (
              <span
                className={
                  styles.status
                }
              >
                No hay ejercicios que coincidan.
              </span>
            ) : (
              results.map(
                exercise => (
                  <button
                    type="button"
                    key={
                      exercise.id
                    }
                    className={
                      styles.result
                    }
                    disabled={
                      submitting
                    }
                    onClick={() => {
                      void addExisting(
                        exercise.id,
                      );
                    }}
                  >
                    <div
                      className={
                        styles.resultMain
                      }
                    >
                      <span
                        className={
                          styles.resultName
                        }
                      >
                        {
                          exercise.name
                        }
                      </span>

                      <span
                        className={
                          styles.resultMeta
                        }
                      >
                        {exercise.sport && (
                          <>
                            <span>
                              {
                                exercise.sport
                              }
                            </span>

                            <span
                              className={
                                styles.metaSeparator
                              }
                            >
                              ·
                            </span>
                          </>
                        )}

                        <span>
                          {exercise.origin ===
                          'CUSTOM'
                            ? 'Personalizado'
                            : 'Sistema'}
                        </span>
                      </span>
                    </div>

                    <span
                      className={
                        styles.metric
                      }
                    >
                      {metricLabel(
                        exercise.metricProfile,
                      )}
                    </span>
                  </button>
                ),
              )
            )}
          </div>

          <button
            type="button"
            className={
              styles.create
            }
            onClick={() => {
              setCustomName(
                query,
              );

              setCreatingCustom(
                true,
              );

              setError(
                null,
              );
            }}
          >
            <Plus />

            <span>
              {query.trim()
                ? `Crear “${query.trim()}” como ejercicio personalizado`
                : 'Crear ejercicio personalizado'}
            </span>
          </button>
        </>
      ) : (
        <div
          className={
            styles.customForm
          }
        >
          <span
            className={
              styles.customTitle
            }
          >
            Nuevo ejercicio personalizado
          </span>

          <label>
            <span>
              Nombre
            </span>

            <input
              type="text"
              autoFocus
              value={
                customName
              }
              onChange={(
                event,
              ) =>
                setCustomName(
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

                  void addCustom();
                }

                if (
                  event.key ===
                  'Escape'
                ) {
                  setCreatingCustom(
                    false,
                  );
                }
              }}
            />
          </label>

          <label>
            <span>
              Tipo de medición
            </span>

            <select
              value={
                customMetricProfile
              }
              onChange={(
                event,
              ) =>
                setCustomMetricProfile(
                  event.target.value,
                )
              }
            >
              {METRIC_PROFILES.map(
                ([
                  value,
                  label,
                ]) => (
                  <option
                    key={
                      value
                    }
                    value={
                      value
                    }
                  >
                    {
                      label
                    }
                  </option>
                ),
              )}
            </select>
          </label>

          <div
            className={
              styles.customActions
            }
          >
            <button
              type="button"
              className={
                styles.secondary
              }
              onClick={() =>
                setCreatingCustom(
                  false,
                )
              }
              disabled={
                submitting
              }
            >
              Volver
            </button>

            <button
              type="button"
              className={
                styles.primary
              }
              disabled={
                submitting ||
                !customName.trim()
              }
              onClick={() => {
                void addCustom();
              }}
            >
              {submitting
                ? 'Creando…'
                : 'Crear y añadir'}
            </button>
          </div>
        </div>
      )}

      {error && (
        <span
          className={
            styles.error
          }
          role="alert"
        >
          {error}
        </span>
      )}

    </div>
  );
}
