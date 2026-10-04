'use client';

import {
  Copy,
  LoaderCircle,
  X,
} from 'lucide-react';

import {
  useRouter,
} from 'next/navigation';

import {
  useMemo,
  useState,
} from 'react';

import type {
  NutritionPersonResponse,
} from '../../../../../lib/nutrition-api';

import styles from '../../copy-nutrition-day-form.module.css';

interface CopyNutritionWeekFormProps {
  sourcePlanId:
    string;

  sourceWeekStart:
    string;

  sourceUserId:
    string;

  sourceUserName:
    string;

  people:
    NutritionPersonResponse[];

  existingWeekStarts:
    string[];

  sessionUserId:
    string;
}

interface ErrorResponse {
  error?:
    string;
}

const DATE_PATTERN =
  /^\d{4}-\d{2}-\d{2}$/;

const parseDate =
  (
    value:
      string,
  ): Date | null => {

    if (
      !DATE_PATTERN.test(
        value,
      )
    ) {
      return null;
    }

    const [
      year,
      month,
      day,
    ] =
      value
        .split('-')
        .map(Number);

    if (
      !year ||
      !month ||
      !day
    ) {
      return null;
    }

    const date =
      new Date(
        year,
        month - 1,
        day,
        12,
      );

    if (
      date.getFullYear() !==
        year ||
      date.getMonth() !==
        month - 1 ||
      date.getDate() !==
        day
    ) {
      return null;
    }

    return date;
  };

const formatDate =
  (
    date:
      Date,
  ): string => {

    const year =
      date.getFullYear();

    const month =
      String(
        date.getMonth() + 1,
      ).padStart(
        2,
        '0',
      );

    const day =
      String(
        date.getDate(),
      ).padStart(
        2,
        '0',
      );

    return `${year}-${month}-${day}`;
  };

const addDays =
  (
    value:
      string,

    amount:
      number,
  ): string => {

    const date =
      parseDate(
        value,
      );

    if (!date) {
      return value;
    }

    date.setDate(
      date.getDate() +
        amount,
    );

    return formatDate(
      date,
    );
  };

const formatShortDate =
  (
    value:
      string,
  ): string => {

    const date =
      parseDate(
        value,
      );

    if (!date) {
      return value;
    }

    return new Intl.DateTimeFormat(
      'es-ES',
      {
        day:
          'numeric',

        month:
          'short',
      },
    ).format(
      date,
    );
  };

const formatWeekTitle =
  (
    weekStart:
      string,
  ): string => {

    const weekEnd =
      addDays(
        weekStart,
        6,
      );

    return `Semana ${formatShortDate(
      weekStart,
    )} — ${formatShortDate(
      weekEnd,
    )}`;
  };

const findDefaultTargetWeek =
  (
    sourceWeekStart:
      string,

    existingWeekStarts:
      string[],
  ): string => {

    const existing =
      new Set(
        existingWeekStarts,
      );

    let candidate =
      addDays(
        sourceWeekStart,
        7,
      );

    for (
      let index =
        0;
      index <
      104;
      index +=
        1
    ) {
      if (
        !existing.has(
          candidate,
        )
      ) {
        return candidate;
      }

      candidate =
        addDays(
          candidate,
          7,
        );
    }

    return addDays(
      sourceWeekStart,
      7,
    );
  };

export function CopyNutritionWeekForm({
  sourcePlanId,
  sourceWeekStart,
  sourceUserId,
  sourceUserName,
  people,
  existingWeekStarts,
  sessionUserId,
}: CopyNutritionWeekFormProps) {

  const router =
    useRouter();

  const defaultTargetWeekStart =
    useMemo(
      () =>
        findDefaultTargetWeek(
          sourceWeekStart,
          existingWeekStarts,
        ),
      [
        sourceWeekStart,
        existingWeekStarts,
      ],
    );

  const [
    open,
    setOpen,
  ] =
    useState(
      false,
    );

  const [
    targetWeekStart,
    setTargetWeekStart,
  ] =
    useState(
      defaultTargetWeekStart,
    );

  const [
    title,
    setTitle,
  ] =
    useState(
      formatWeekTitle(
        defaultTargetWeekStart,
      ),
    );

  const [
    targetUserIds,
    setTargetUserIds,
  ] =
    useState<
      string[]
    >(
      [sourceUserId],
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
      string |
      null
    >(
      null,
    );

  const targetDate =
    parseDate(
      targetWeekStart,
    );

  const targetIsMonday =
    targetDate
      ?.getDay() ===
      1;

  const targetAlreadyExists =
    existingWeekStarts.includes(
      targetWeekStart,
    );

  const openDialog =
    () => {

      const nextWeek =
        findDefaultTargetWeek(
          sourceWeekStart,
          existingWeekStarts,
        );

      setTargetWeekStart(
        nextWeek,
      );

      setTitle(
        formatWeekTitle(
          nextWeek,
        ),
      );

      setTargetUserIds(
        [sourceUserId],
      );

      setError(
        null,
      );

      setOpen(
        true,
      );
    };

  const toggleTargetUser =
    (
      userId:
        string,
    ) => {

      setTargetUserIds(
        current =>
          current.includes(
            userId,
          )
            ? current.filter(
                candidate =>
                  candidate !==
                  userId,
              )
            : [
                ...current,
                userId,
              ],
      );
    };

  const updateTargetWeekStart =
    (
      value:
        string,
    ) => {

      setTargetWeekStart(
        value,
      );

      setTitle(
        formatWeekTitle(
          value,
        ),
      );

      setError(
        null,
      );
    };

  const submit =
    async () => {

      if (
        submitting
      ) {
        return;
      }

      if (
        !targetIsMonday
      ) {
        setError(
          'La semana destino debe comenzar en lunes.',
        );

        return;
      }

      if (
        targetAlreadyExists
      ) {
        setError(
          'Ya existe una semana con esa fecha de inicio.',
        );

        return;
      }

      if (
        title.trim()
          .length ===
        0
      ) {
        setError(
          'Indica un nombre para la nueva semana.',
        );

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
            `/api/nutrition/plans/${encodeURIComponent(
              sourcePlanId,
            )}/copy`,
            {
              method:
                'POST',

              headers: {
                'content-type':
                  'application/json',
              },

              body:
                JSON.stringify({
                  targetWeekStart,

                  title:
                    title.trim(),

                  quantityMappings:
                    targetUserIds.map(
                      targetUserId => ({
                        sourceUserId,

                        targetUserId,
                      }),
                    ),
                }),
            },
          );

        const body =
          await response
            .json()
            .catch(
              () =>
                null,
            ) as
              (
                ErrorResponse & {
                  targetPlan?: {
                    id:
                      string;
                  };
                }
              ) |
              null;

        if (
          !response.ok
        ) {

          switch (
            body?.error
          ) {
            case 'nutrition_copy_target_week_already_exists':
              setError(
                'Ya existe una semana con esa fecha de inicio.',
              );
              break;

            case 'nutrition_person_read_access_denied':
              setError(
                'No tienes permiso para leer la planificación de alguna de las personas origen.',
              );
              break;

            case 'nutrition_person_manage_access_denied':
              setError(
                'No tienes permiso para modificar las cantidades de alguna de las personas destino.',
              );
              break;

            case 'nutrition_copy_source_week_not_found':
              setError(
                'La semana origen ya no existe.',
              );
              break;

            case 'nutrition_copy_source_week_invalid':
              setError(
                'La semana origen no tiene una estructura válida de siete días.',
              );
              break;

            case 'invalid_nutrition_week_copy':
              setError(
                'La configuración de la copia no es válida.',
              );
              break;

            default:
              setError(
                'No se ha podido copiar la semana.',
              );
          }

          return;
        }

        const newPlanId =
          body?.targetPlan
            ?.id;

        setOpen(
          false,
        );

        if (
          newPlanId
        ) {
          const params =
            new URLSearchParams();

          if (
            targetUserIds[0] &&
            targetUserIds[0] !==
              sessionUserId
          ) {
            params.set(
              'user',
              targetUserIds[0],
            );
          }

          const query =
            params.toString();

          router.push(
            `/nutricion/semanas/${encodeURIComponent(
              newPlanId,
            )}${query
              ? `?${query}`
              : ''}`,
          );
        }

        router.refresh();

      } catch {

        setError(
          'No se ha podido conectar con Nutrición.',
        );

      } finally {

        setSubmitting(
          false,
        );
      }
    };

  return (
    <>
      <button
        type="button"
        className={
          styles.trigger
        }
        onClick={
          openDialog
        }
      >
        <Copy />

        Copiar semana
      </button>

      {open && (
        <div
          className={
            styles.backdrop
          }
          role="presentation"
          onMouseDown={
            event => {

              if (
                event.target ===
                event.currentTarget
              ) {
                setOpen(
                  false,
                );
              }
            }
          }
        >
          <section
            className={
              styles.dialog
            }
            role="dialog"
            aria-modal="true"
            aria-labelledby="copy-nutrition-week-title"
          >
            <header
              className={
                styles.header
              }
            >
              <div>
                <span>
                  Duplicar planificación
                </span>

                <h2
                  id="copy-nutrition-week-title"
                >
                  Copiar semana
                </h2>

                <p>
                  {formatShortDate(
                    sourceWeekStart,
                  )}
                  {' — '}
                  {formatShortDate(
                    addDays(
                      sourceWeekStart,
                      6,
                    ),
                  )}
                </p>
              </div>

              <button
                type="button"
                className={
                  styles.close
                }
                aria-label="Cerrar"
                onClick={
                  () =>
                    setOpen(
                      false,
                    )
                }
              >
                <X />
              </button>
            </header>

            <div
              className={
                styles.content
              }
            >
              <label
                className={
                  styles.field
                }
              >
                <span>
                  Lunes de la nueva semana
                </span>

                <input
                  type="date"
                  value={
                    targetWeekStart
                  }
                  disabled={
                    submitting
                  }
                  onChange={
                    event =>
                      updateTargetWeekStart(
                        event.target.value,
                      )
                  }
                />
              </label>

              <label
                className={
                  styles.field
                }
              >
                <span>
                  Nombre
                </span>

                <input
                  type="text"
                  value={
                    title
                  }
                  maxLength={
                    200
                  }
                  disabled={
                    submitting
                  }
                  onChange={
                    event =>
                      setTitle(
                        event.target.value,
                      )
                  }
                />
              </label>

              <section
                className={
                  styles.quantities
                }
              >
                <div
                  className={
                    styles.sectionHeading
                  }
                >
                  <strong>
                    Cantidades y objetivos
                  </strong>

                  <span>
                    Copiar la planificación de{' '}
                    {sourceUserName}
                    {' '}para:
                  </span>
                </div>

                <div
                  className={
                    styles.people
                  }
                >
                  {people.map(
                    person => {

                      const checked =
                        targetUserIds
                          .includes(
                            person.id,
                          );

                      return (
                        <label
                          key={
                            person.id
                          }
                          className={
                            checked
                              ? `${styles.person} ${styles.personSelected}`
                              : styles.person
                          }
                        >
                          <input
                            type="checkbox"
                            checked={
                              checked
                            }
                            disabled={
                              submitting
                            }
                            onChange={
                              () =>
                                toggleTargetUser(
                                  person.id,
                                )
                            }
                          />

                          <span>
                            {person.id ===
                            sourceUserId
                              ? `${person.name} · mismas cantidades`
                              : person.name}
                          </span>
                        </label>
                      );
                    },
                  )}
                </div>

                {targetUserIds.length ===
                  0 && (
                  <p
                    className={
                      styles.structureOnly
                    }
                  >
                    Se copiará únicamente la estructura semanal, sin cantidades ni objetivos personales.
                  </p>
                )}
              </section>

              <div
                className={
                  styles.notice
                }
              >
                Se copiarán los siete días planificados,
                sus comidas, alimentos, preparaciones,
                cantidades y objetivos seleccionados.
                El consumo real, alimentos sustituidos,
                estados y cantidades realmente ingeridas
                no se copiarán.
              </div>

              {!targetIsMonday &&
                targetWeekStart && (
                <p
                  className={
                    styles.error
                  }
                >
                  La fecha seleccionada no es lunes.
                </p>
              )}

              {targetAlreadyExists && (
                <p
                  className={
                    styles.error
                  }
                >
                  Ya existe una semana que empieza ese lunes.
                </p>
              )}

              {error && (
                <p
                  className={
                    styles.error
                  }
                  role="alert"
                >
                  {error}
                </p>
              )}
            </div>

            <footer
              className={
                styles.footer
              }
            >
              <button
                type="button"
                className={
                  styles.cancel
                }
                disabled={
                  submitting
                }
                onClick={
                  () =>
                    setOpen(
                      false,
                    )
                }
              >
                Cancelar
              </button>

              <button
                type="button"
                className={
                  styles.submit
                }
                disabled={
                  submitting ||
                  !targetIsMonday ||
                  targetAlreadyExists ||
                  title.trim()
                    .length ===
                    0
                }
                onClick={
                  () =>
                    void submit()
                }
              >
                {submitting && (
                  <LoaderCircle
                    className={
                      styles.spinner
                    }
                  />
                )}

                {submitting
                  ? 'Copiando…'
                  : 'Copiar semana'}
              </button>
            </footer>
          </section>
        </div>
      )}
    </>
  );
}
