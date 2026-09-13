'use client';

import {
  CalendarPlus,
  X,
} from 'lucide-react';

import {
  useRouter,
} from 'next/navigation';

import {
  type FormEvent,
  useState,
} from 'react';

interface NewWeekControlProps {
  athleteId:
    string;
}

const getNextMonday =
  (): string => {
    const date =
      new Date();

    date.setHours(
      12,
      0,
      0,
      0,
    );

    const day =
      date.getDay();

    const daysUntilMonday =
      day === 1
        ? 0
        : (
            8 -
            day
          ) %
          7;

    date.setDate(
      date.getDate() +
      daysUntilMonday,
    );

    const year =
      date.getFullYear();

    const month =
      String(
        date.getMonth() +
          1,
      ).padStart(
        2,
        '0',
      );

    const dateNumber =
      String(
        date.getDate(),
      ).padStart(
        2,
        '0',
      );

    return `${year}-${month}-${dateNumber}`;
  };

export function NewWeekControl({
  athleteId,
}: NewWeekControlProps) {
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
    weekStart,
    setWeekStart,
  ] =
    useState(
      getNextMonday,
    );

  const [
    title,
    setTitle,
  ] =
    useState('');

  const [
    notes,
    setNotes,
  ] =
    useState('');

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

  const close = () => {
    if (submitting) {
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
        FormEvent<HTMLFormElement>,
    ) => {
      event.preventDefault();

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
            )}/weeks`,
            {
              method:
                'POST',

              headers: {
                'content-type':
                  'application/json',
              },

              body:
                JSON.stringify({
                  weekStart,

                  title:
                    title.trim() ||
                    null,

                  notes:
                    notes.trim() ||
                    null,
                }),
            },
          );

        if (!response.ok) {
          const body =
            await response
              .json()
              .catch(
                () =>
                  null,
              );

          if (
            response.status ===
              409
          ) {
            throw new Error(
              'Ya existe una semana que empieza ese día.',
            );
          }

          if (
            response.status ===
              403
          ) {
            throw new Error(
              'No tienes permiso para crear semanas para este atleta.',
            );
          }

          if (
            body?.error ===
            'invalid_week_start'
          ) {
            throw new Error(
              'La semana debe comenzar en lunes.',
            );
          }

          throw new Error(
            'No se ha podido crear la semana.',
          );
        }

        setOpen(
          false,
        );

        setTitle('');
        setNotes('');

        router.refresh();
      } catch (
        caught
      ) {
        setError(
          caught instanceof Error
            ? caught.message
            : 'No se ha podido crear la semana.',
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
        className="training-new-week-button"
        onClick={() =>
          setOpen(
            true,
          )
        }
      >
        <CalendarPlus />
        Nueva semana
      </button>

      {open && (
        <div
          className="training-modal-backdrop"
          role="presentation"
          onMouseDown={
            close
          }
        >
          <section
            className="training-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="training-new-week-title"
            onMouseDown={(
              event,
            ) =>
              event.stopPropagation()
            }
          >
            <header className="training-modal-header">

              <div>
                <span>
                  Planificación
                </span>

                <h2 id="training-new-week-title">
                  Nueva semana
                </h2>
              </div>

              <button
                type="button"
                className="training-modal-close"
                aria-label="Cerrar"
                onClick={
                  close
                }
              >
                <X />
              </button>

            </header>

            <form
              className="training-new-week-form"
              onSubmit={
                submit
              }
            >
              <label>
                <span>
                  Empieza el
                </span>

                <input
                  type="date"
                  value={
                    weekStart
                  }
                  onChange={(
                    event,
                  ) =>
                    setWeekStart(
                      event
                        .target
                        .value,
                    )
                  }
                  required
                />
              </label>

              <label>
                <span>
                  Título
                </span>

                <input
                  type="text"
                  value={
                    title
                  }
                  onChange={(
                    event,
                  ) =>
                    setTitle(
                      event
                        .target
                        .value,
                    )
                  }
                  placeholder="Ej. Semana de carga"
                  maxLength={
                    120
                  }
                />
              </label>

              <label>
                <span>
                  Notas
                </span>

                <textarea
                  value={
                    notes
                  }
                  onChange={(
                    event,
                  ) =>
                    setNotes(
                      event
                        .target
                        .value,
                    )
                  }
                  placeholder="Objetivos o indicaciones generales"
                  rows={
                    3
                  }
                />
              </label>

              {error && (
                <div
                  className="training-form-error"
                  role="alert"
                >
                  {error}
                </div>
              )}

              <footer className="training-modal-actions">

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
                  className="training-modal-primary"
                  disabled={
                    submitting
                  }
                >
                  {submitting
                    ? 'Creando…'
                    : 'Crear semana'}
                </button>

              </footer>
            </form>
          </section>
        </div>
      )}
    </>
  );
}
