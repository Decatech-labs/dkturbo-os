'use client';

import {
  Plus,
  X,
} from 'lucide-react';

import {
  useRouter,
} from 'next/navigation';

import {
  type FormEvent,
  useState,
  useEffect,
} from 'react';

import {
  createPortal,
} from 'react-dom';

interface NewSessionControlProps {
  athleteId:
    string;

  dayId:
    string | null;

  date:
    string;

  dateLabel:
    string;
}

const SESSION_TYPES = [
  ['STRENGTH', 'Fuerza'],
  ['RUNNING', 'Carrera'],
  ['SWIMMING', 'Natación'],
  ['CYCLING', 'Ciclismo'],
  ['JUMPS', 'Saltos'],
  ['THROWS', 'Lanzamientos'],
  ['TECHNIQUE', 'Técnica'],
  ['REHAB', 'Rehabilitación'],
  ['MOBILITY', 'Movilidad'],
  ['OTHER', 'Otro'],
] as const;

const getMondayForDate = (
  value:
    string,
): string => {
  const [
    year,
    month,
    day,
  ] = value
    .split('-')
    .map(Number);

  if (
    year === undefined ||
    month === undefined ||
    day === undefined
  ) {
    throw new Error(
      `Invalid date: ${value}`,
    );
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

  const mondayOffset =
    (
      date.getDay() +
      6
    ) %
    7;

  date.setDate(
    date.getDate() -
      mondayOffset,
  );

  const resultYear =
    date.getFullYear();

  const resultMonth =
    String(
      date.getMonth() +
        1,
    ).padStart(
      2,
      '0',
    );

  const resultDay =
    String(
      date.getDate(),
    ).padStart(
      2,
      '0',
    );

  return `${resultYear}-${resultMonth}-${resultDay}`;
};

export function NewSessionControl({
  athleteId,
  dayId,
  date,
  dateLabel,
}: NewSessionControlProps) {
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
    type,
    setType,
  ] =
    useState(
      'STRENGTH',
    );

  const [
    title,
    setTitle,
  ] =
    useState('');

  const [
    startTime,
    setStartTime,
  ] =
    useState('');

  const [
    duration,
    setDuration,
  ] =
    useState('');

  const [
    rpe,
    setRpe,
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

  const [
    mounted,
    setMounted,
  ] =
    useState(
      false,
    );

  useEffect(
    () => {
      setMounted(
        true,
      );
    },
    [],
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
        let targetDayId =
          dayId;

        if (!targetDayId) {
          const weekResponse =
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
                    weekStart:
                      getMondayForDate(
                        date,
                      ),

                    title:
                      null,

                    notes:
                      null,
                  }),
              },
            );

          if (!weekResponse.ok) {
            if (
              weekResponse.status ===
              403
            ) {
              throw new Error(
                'No tienes permiso para crear esta semana.',
              );
            }

            if (
              weekResponse.status ===
              409
            ) {
              throw new Error(
                'La semana ya existe. Actualiza el calendario y vuelve a intentarlo.',
              );
            }

            throw new Error(
              'No se ha podido preparar la semana de entrenamiento.',
            );
          }

          const week =
            await weekResponse.json() as {
              days: Array<{
                id: string;
                date: string;
              }>;
            };

          const targetDay =
            week.days.find(
              (
                candidate,
              ) =>
                candidate.date ===
                date,
            );

          if (!targetDay) {
            throw new Error(
              'No se ha podido localizar el día creado.',
            );
          }

          targetDayId =
            targetDay.id;
        }

        const response =
          await fetch(
            `/api/training/athletes/${encodeURIComponent(
              athleteId,
            )}/days/${encodeURIComponent(
              targetDayId,
            )}/sessions`,
            {
              method:
                'POST',

              headers: {
                'content-type':
                  'application/json',
              },

              body:
                JSON.stringify({
                  type,

                  title,

                  plannedStartTime:
                    startTime ||
                    null,

                  plannedDurationMinutes:
                    duration
                      ? Number(
                          duration,
                        )
                      : null,

                  plannedNotes:
                    notes.trim() ||
                    null,

                  plannedRpe:
                    rpe
                      ? Number(
                          rpe,
                        )
                      : null,
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
              403
          ) {
            throw new Error(
              'No tienes permiso para crear sesiones para este atleta.',
            );
          }

          if (
            response.status ===
              404
          ) {
            throw new Error(
              'No se ha encontrado el día de entrenamiento.',
            );
          }

          if (
            body?.error ===
              'invalid_session' ||
            body?.error ===
              'invalid_request'
          ) {
            throw new Error(
              'Revisa los datos de la sesión.',
            );
          }

          throw new Error(
            'No se ha podido crear la sesión.',
          );
        }

        setOpen(
          false,
        );

        setTitle('');
        setStartTime('');
        setDuration('');
        setRpe('');
        setNotes('');

        router.refresh();
      } catch (
        caught
      ) {
        setError(
          caught instanceof Error
            ? caught.message
            : 'No se ha podido crear la sesión.',
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
        className="training-calendar-add-session"
        aria-label={`Añadir sesión el ${dateLabel}`}
        title="Añadir sesión"
        onClick={() =>
          setOpen(
            true,
          )
        }
      >
        <Plus />
      </button>

      {mounted &&
      open &&
      createPortal(
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
            aria-labelledby="training-new-session-title"
            onMouseDown={(
              event,
            ) =>
              event.stopPropagation()
            }
          >
            <header className="training-modal-header">

              <div>
                <span>
                  {dateLabel}
                </span>

                <h2 id="training-new-session-title">
                  Nueva sesión
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
                  Tipo
                </span>

                <select
                  value={
                    type
                  }
                  onChange={(
                    event,
                  ) =>
                    setType(
                      event
                        .target
                        .value,
                    )
                  }
                >
                  {SESSION_TYPES.map(
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
                  placeholder="Ej. Natación aeróbica"
                  required
                />
              </label>

              <div className="training-session-form-grid">

                <label>
                  <span>
                    Hora
                  </span>

                  <input
                    type="time"
                    value={
                      startTime
                    }
                    onChange={(
                      event,
                    ) =>
                      setStartTime(
                        event
                          .target
                          .value,
                      )
                    }
                  />
                </label>

                <label>
                  <span>
                    Duración
                  </span>

                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={
                      duration
                    }
                    onChange={(
                      event,
                    ) =>
                      setDuration(
                        event
                          .target
                          .value,
                      )
                    }
                    placeholder="min"
                  />
                </label>

                <label>
                  <span>
                    RPE
                  </span>

                  <input
                    type="number"
                    min="0"
                    max="10"
                    step="0.5"
                    value={
                      rpe
                    }
                    onChange={(
                      event,
                    ) =>
                      setRpe(
                        event
                          .target
                          .value,
                      )
                    }
                    placeholder="0–10"
                  />
                </label>

              </div>

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
                  placeholder="Indicaciones generales"
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
                    : 'Crear sesión'}
                </button>

              </footer>

            </form>

          </section>
        </div>,
        document.body,
      )}
    </>
  );
}
