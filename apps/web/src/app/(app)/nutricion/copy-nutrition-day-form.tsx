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
  useEffect,
  useState,
} from 'react';

import type {
  NutritionPersonResponse,
  NutritionPlanResponse,
  NutritionWeeklyPlanDetailResponse,
} from '../../../lib/nutrition-api';

import styles from './copy-nutrition-day-form.module.css';

interface CopyNutritionDayFormProps {
  sourcePlanId:
    string;

  sourceDayId:
    string;

  sourceDate:
    string;

  sourceUserId:
    string;

  sourceUserName:
    string;

  people:
    NutritionPersonResponse[];

  plans:
    NutritionPlanResponse[];

  sessionUserId:
    string;
}

interface ErrorResponse {
  error?:
    string;
}

const formatDate =
  (
    value:
      string,
  ): string => {

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
      return value;
    }

    return new Intl.DateTimeFormat(
      'es-ES',
      {
        weekday:
          'long',

        day:
          'numeric',

        month:
          'long',
      },
    ).format(
      new Date(
        year,
        month - 1,
        day,
        12,
      ),
    );
  };

const formatWeek =
  (
    plan:
      NutritionPlanResponse,
  ): string =>
    `${plan.title} · ${plan.startDate} → ${plan.endDate}`;

export function CopyNutritionDayForm({
  sourcePlanId,
  sourceDayId,
  sourceDate,
  sourceUserId,
  sourceUserName,
  people,
  plans,
  sessionUserId,
}: CopyNutritionDayFormProps) {

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
    targetPlanId,
    setTargetPlanId,
  ] =
    useState(
      sourcePlanId,
    );

  const [
    targetPlan,
    setTargetPlan,
  ] =
    useState<
      NutritionWeeklyPlanDetailResponse |
      null
    >(
      null,
    );

  const [
    targetDayId,
    setTargetDayId,
  ] =
    useState(
      '',
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
    loadingPlan,
    setLoadingPlan,
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
      string |
      null
    >(
      null,
    );

  const availableTargetDays =
    targetPlan
      ?.days
      .filter(
        day =>
          day.day.id !==
            sourceDayId &&
          day.meals.length ===
            0,
      ) ??
    [];

  const selectedTargetDay =
    targetPlan
      ?.days
      .find(
        day =>
          day.day.id ===
          targetDayId,
      ) ??
    null;

  useEffect(
    () => {

      if (!open) {
        return;
      }

      const controller =
        new AbortController();

      const loadPlan =
        async () => {

          setLoadingPlan(
            true,
          );

          setError(
            null,
          );

          try {

            const response =
              await fetch(
                `/api/nutrition/plans/${encodeURIComponent(
                  targetPlanId,
                )}`,
                {
                  cache:
                    'no-store',

                  signal:
                    controller.signal,
                },
              );

            if (
              !response.ok
            ) {
              setTargetPlan(
                null,
              );

              setTargetDayId(
                '',
              );

              setError(
                'No se ha podido cargar la semana destino.',
              );

              return;
            }

            const body =
              await response.json() as
                NutritionWeeklyPlanDetailResponse;

            setTargetPlan(
              body,
            );

            const firstEmptyDay =
              body.days.find(
                day =>
                  day.day.id !==
                    sourceDayId &&
                  day.meals.length ===
                    0,
              );

            setTargetDayId(
              firstEmptyDay
                ?.day.id ??
              '',
            );

          } catch (
            fetchError
          ) {

            if (
              fetchError instanceof
                DOMException &&
              fetchError.name ===
                'AbortError'
            ) {
              return;
            }

            setError(
              'No se ha podido conectar con Nutrición.',
            );

          } finally {

            if (
              !controller.signal
                .aborted
            ) {
              setLoadingPlan(
                false,
              );
            }
          }
        };

      void loadPlan();

      return () => {
        controller.abort();
      };
    },
    [
      open,
      sourceDayId,
      targetPlanId,
    ],
  );

  useEffect(
    () => {

      if (!open) {
        return;
      }

      const handleKeyDown =
        (
          event:
            KeyboardEvent,
        ) => {

          if (
            event.key ===
            'Escape'
          ) {
            setOpen(
              false,
            );
          }
        };

      window.addEventListener(
        'keydown',
        handleKeyDown,
      );

      return () => {
        window.removeEventListener(
          'keydown',
          handleKeyDown,
        );
      };
    },
    [
      open,
    ],
  );

  const openDialog =
    () => {

      setTargetPlanId(
        sourcePlanId,
      );

      setTargetPlan(
        null,
      );

      setTargetDayId(
        '',
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

  const submit =
    async () => {

      if (
        submitting ||
        !targetDayId
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
            `/api/nutrition/days/${encodeURIComponent(
              sourceDayId,
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
                  sourcePlanId,

                  targetPlanId,

                  targetDayId,

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
              ErrorResponse |
              null;

        if (
          !response.ok
        ) {

          switch (
            body?.error
          ) {
            case 'nutrition_copy_target_day_not_empty':
              setError(
                'El día destino ya contiene comidas.',
              );
              break;

            case 'nutrition_copy_source_day_empty':
              setError(
                'El día origen no tiene ninguna comida que copiar.',
              );
              break;

            case 'nutrition_person_manage_access_denied':
              setError(
                'No tienes permiso para modificar las cantidades de alguna de las personas seleccionadas.',
              );
              break;

            case 'invalid_nutrition_day_copy':
              setError(
                'La combinación de origen, destino o personas no es válida.',
              );
              break;

            case 'nutrition_copy_day_not_found':
            case 'nutrition_copy_plan_not_found':
              setError(
                'Ya no se encuentra el día o la semana seleccionados.',
              );
              break;

            default:
              setError(
                'No se ha podido copiar el día.',
              );
          }

          return;
        }

        const firstTargetUserId =
          targetUserIds[0] ??
          sourceUserId;

        const destinationDate =
          selectedTargetDay
            ?.day.date;

        setOpen(
          false,
        );

        if (
          destinationDate
        ) {
          const params =
            new URLSearchParams();

          params.set(
            'date',
            destinationDate,
          );

          if (
            firstTargetUserId !==
            sessionUserId
          ) {
            params.set(
              'user',
              firstTargetUserId,
            );
          }

          router.push(
            `/nutricion?${params.toString()}`,
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

        Copiar día
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
            aria-labelledby="copy-nutrition-day-title"
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
                  id="copy-nutrition-day-title"
                >
                  Copiar día
                </h2>

                <p>
                  {formatDate(
                    sourceDate,
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
                  Semana destino
                </span>

                <select
                  value={
                    targetPlanId
                  }
                  onChange={
                    event =>
                      setTargetPlanId(
                        event
                          .target
                          .value,
                      )
                  }
                  disabled={
                    submitting
                  }
                >
                  {plans.map(
                    plan => (
                      <option
                        key={
                          plan.id
                        }
                        value={
                          plan.id
                        }
                      >
                        {formatWeek(
                          plan,
                        )}
                      </option>
                    ),
                  )}
                </select>
              </label>

              <label
                className={
                  styles.field
                }
              >
                <span>
                  Día destino
                </span>

                <select
                  value={
                    targetDayId
                  }
                  onChange={
                    event =>
                      setTargetDayId(
                        event
                          .target
                          .value,
                      )
                  }
                  disabled={
                    loadingPlan ||
                    submitting ||
                    availableTargetDays
                      .length ===
                      0
                  }
                >
                  {loadingPlan ? (
                    <option value="">
                      Cargando…
                    </option>
                  ) : availableTargetDays
                      .length ===
                      0 ? (
                    <option value="">
                      No hay días vacíos
                    </option>
                  ) : (
                    availableTargetDays
                      .map(
                        day => (
                          <option
                            key={
                              day.day.id
                            }
                            value={
                              day.day.id
                            }
                          >
                            {formatDate(
                              day.day.date,
                            )}
                          </option>
                        ),
                      )
                  )}
                </select>
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
                    Cantidades
                  </strong>

                  <span>
                    Copiar las cantidades de{' '}
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
                              ? `${person.name} · misma cantidad`
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
                    Se copiará únicamente la estructura del día, sin cantidades personales.
                  </p>
                )}
              </section>

              <div
                className={
                  styles.notice
                }
              >
                Se copiará exclusivamente lo planificado:
                comidas, alimentos, preparación y cantidades.
                Los alimentos sustituidos o realmente consumidos no se copian.
              </div>

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
                  loadingPlan ||
                  !targetDayId
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
                  : 'Copiar día'}
              </button>
            </footer>
          </section>
        </div>
      )}
    </>
  );
}
