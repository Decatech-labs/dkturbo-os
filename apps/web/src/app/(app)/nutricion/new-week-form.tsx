'use client';

import {
  CalendarPlus,
  Plus,
  X,
} from 'lucide-react';

import {
  useRouter,
} from 'next/navigation';

import {
  useMemo,
  useState,
} from 'react';

interface NewWeekFormProps {
  today:
    string;
}

interface CreatePlanResponse {
  plan?: {
    id?:
      string;
  };

  error?:
    string;
}

const parseDate =
  (
    value:
      string,
  ): Date | null => {

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
        0,
        0,
        0,
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

const formatInputDate =
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

const getMonday =
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

    const weekday =
      date.getDay();

    const distance =
      weekday ===
      0
        ? -6
        : 1 -
          weekday;

    date.setDate(
      date.getDate() +
        distance,
    );

    return formatInputDate(
      date,
    );
  };

const formatWeekTitle =
  (
    monday:
      string,
  ): string => {

    const start =
      parseDate(
        monday,
      );

    if (!start) {
      return 'Nueva semana';
    }

    const end =
      new Date(
        start,
      );

    end.setDate(
      end.getDate() +
        6,
    );

    const sameMonth =
      start.getMonth() ===
        end.getMonth() &&
      start.getFullYear() ===
        end.getFullYear();

    const startLabel =
      new Intl.DateTimeFormat(
        'es-ES',
        sameMonth
          ? {
              day:
                'numeric',
            }
          : {
              day:
                'numeric',

              month:
                'long',
            },
      ).format(
        start,
      );

    const endLabel =
      new Intl.DateTimeFormat(
        'es-ES',
        {
          day:
            'numeric',

          month:
            'long',
        },
      ).format(
        end,
      );

    return `Semana ${startLabel}–${endLabel}`;
  };

export function NewWeekForm({
  today,
}: NewWeekFormProps) {

  const router =
    useRouter();

  const initialMonday =
    useMemo(
      () =>
        getMonday(
          today,
        ),
      [
        today,
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
    weekStart,
    setWeekStart,
  ] =
    useState(
      initialMonday,
    );

  const automaticTitle =
    useMemo(
      () =>
        formatWeekTitle(
          weekStart,
        ),
      [
        weekStart,
      ],
    );

  const [
    customTitle,
    setCustomTitle,
  ] =
    useState(
      '',
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

  const close =
    () => {

      if (
        submitting
      ) {
        return;
      }

      setOpen(
        false,
      );

      setError(
        null,
      );
    };

  const submit =
    async (
      event:
        React.FormEvent<
          HTMLFormElement
        >,
    ) => {

      event.preventDefault();

      if (
        submitting
      ) {
        return;
      }

      const normalizedMonday =
        getMonday(
          weekStart,
        );

      if (
        normalizedMonday !==
        weekStart
      ) {
        setError(
          'La semana debe comenzar en lunes.',
        );

        return;
      }

      const title =
        customTitle.trim() ||
        automaticTitle;

      setSubmitting(
        true,
      );

      setError(
        null,
      );

      try {

        const response =
          await fetch(
            '/api/nutrition/plans',
            {
              method:
                'POST',

              headers: {
                'content-type':
                  'application/json',
              },

              body:
                JSON.stringify({
                  title,

                  weekStart,
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
              CreatePlanResponse |
              null;

        if (
          !response.ok
        ) {
          setError(
            body?.error ===
              'invalid_weekly_nutrition_plan'
              ? 'La semana no es válida.'
              : 'No se ha podido crear la semana.',
          );

          return;
        }

        const planId =
          body
            ?.plan
            ?.id;

        if (
          !planId
        ) {
          setError(
            'La semana se ha creado, pero no se ha podido abrir.',
          );

          router.refresh();

          return;
        }

        router.push(
          `/nutricion/semanas/${planId}`,
        );

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
        className="nutrition-new-week-button"
        onClick={
          () =>
            setOpen(
              true,
            )
        }
      >
        <Plus />

        Nueva semana
      </button>

      {open && (
        <div
          className="nutrition-modal-backdrop"
          role="presentation"
          onMouseDown={
            (
              event,
            ) => {

              if (
                event.target ===
                event.currentTarget
              ) {
                close();
              }
            }
          }
        >
          <section
            className="nutrition-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="nutrition-new-week-title"
          >

            <header className="nutrition-modal-header">

              <div className="nutrition-modal-icon">
                <CalendarPlus />
              </div>

              <div>
                <h2 id="nutrition-new-week-title">
                  Nueva semana
                </h2>

                <p>
                  Crea siete días de planificación nutricional.
                </p>
              </div>

              <button
                type="button"
                className="nutrition-modal-close"
                onClick={
                  close
                }
                aria-label="Cerrar"
                disabled={
                  submitting
                }
              >
                <X />
              </button>

            </header>

            <form
              className="nutrition-new-week-form"
              onSubmit={
                submit
              }
            >

              <label>
                <span>
                  Lunes de la semana
                </span>

                <input
                  type="date"
                  value={
                    weekStart
                  }
                  onChange={
                    (
                      event,
                    ) => {

                      const value =
                        event
                          .target
                          .value;

                      setWeekStart(
                        value,
                      );

                      setError(
                        null,
                      );
                    }
                  }
                  required
                />
              </label>

              <label>
                <span>
                  Nombre
                </span>

                <input
                  type="text"
                  value={
                    customTitle
                  }
                  onChange={
                    (
                      event,
                    ) =>
                      setCustomTitle(
                        event
                          .target
                          .value,
                      )
                  }
                  placeholder={
                    automaticTitle
                  }
                  maxLength={
                    200
                  }
                />

                <small>
                  Si lo dejas vacío usaremos “{automaticTitle}”.
                </small>
              </label>

              {weekStart &&
                getMonday(
                  weekStart,
                ) !==
                  weekStart && (
                  <div className="nutrition-form-notice">
                    Esa fecha no es lunes. Selecciona el lunes de la semana que quieres crear.
                  </div>
                )}

              {error && (
                <div
                  className="nutrition-form-error"
                  role="alert"
                >
                  {error}
                </div>
              )}

              <div className="nutrition-modal-actions">

                <button
                  type="button"
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
                  type="submit"
                  className="nutrition-modal-primary"
                  disabled={
                    submitting
                  }
                >
                  {submitting
                    ? 'Creando…'
                    : 'Crear semana'}
                </button>

              </div>

            </form>

          </section>
        </div>
      )}
    </>
  );
}
