'use client';

import {
  Clock3,
  Plus,
  Utensils,
  X,
} from 'lucide-react';

import {
  useRouter,
} from 'next/navigation';

import {
  type FormEvent,
  useState,
} from 'react';

import styles from './add-meal-form.module.css';

interface AddMealFormProps {
  dayId:
    string;

  position:
    number;

  compact?:
    boolean;
}

interface CreateMealResponse {
  id?:
    string;

  error?:
    string;
}

export function AddMealForm({
  dayId,
  position,
  compact = false,
}: AddMealFormProps) {

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
    name,
    setName,
  ] =
    useState(
      '',
    );

  const [
    plannedTime,
    setPlannedTime,
  ] =
    useState(
      '',
    );

  const [
    notes,
    setNotes,
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

  const reset =
    () => {

      setName(
        '',
      );

      setPlannedTime(
        '',
      );

      setNotes(
        '',
      );

      setError(
        null,
      );
    };

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

      reset();
    };

  const submit =
    async (
      event:
        FormEvent<
          HTMLFormElement
        >,
    ) => {

      event.preventDefault();

      if (
        submitting
      ) {
        return;
      }

      if (
        !name.trim()
      ) {
        setError(
          'Escribe un nombre para la comida.',
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
            `/api/nutrition/days/${encodeURIComponent(
              dayId,
            )}/meals`,
            {
              method:
                'POST',

              headers: {
                'content-type':
                  'application/json',
              },

              body:
                JSON.stringify({
                  name:
                    name.trim(),

                  plannedTime:
                    plannedTime ||
                    null,

                  position,

                  notes:
                    notes.trim() ||
                    null,
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
              CreateMealResponse |
              null;

        if (
          !response.ok
        ) {
          setError(
            body?.error ===
              'invalid_nutrition_meal'
              ? 'Revisa el nombre y la hora.'
              : 'No se ha podido crear la comida.',
          );

          return;
        }

        setOpen(
          false,
        );

        reset();

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
          compact
            ? styles.compactButton
            : styles.primaryButton
        }
        onClick={
          () =>
            setOpen(
              true,
            )
        }
      >
        <Plus />

        Añadir comida
      </button>

      {open && (
        <div
          className={
            styles.backdrop
          }
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
            className={
              styles.modal
            }
            role="dialog"
            aria-modal="true"
            aria-labelledby="nutrition-add-meal-title"
          >

            <header
              className={
                styles.header
              }
            >

              <div
                className={
                  styles.icon
                }
              >
                <Utensils />
              </div>

              <div
                className={
                  styles.heading
                }
              >
                <h2
                  id="nutrition-add-meal-title"
                >
                  Añadir comida
                </h2>

                <p>
                  Organiza este momento del día.
                </p>
              </div>

              <button
                type="button"
                className={
                  styles.closeButton
                }
                onClick={
                  close
                }
                disabled={
                  submitting
                }
                aria-label="Cerrar"
              >
                <X />
              </button>

            </header>

            <form
              className={
                styles.form
              }
              onSubmit={
                submit
              }
            >

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
                    name
                  }
                  onChange={
                    (
                      event,
                    ) => {

                      setName(
                        event
                          .target
                          .value,
                      );

                      setError(
                        null,
                      );
                    }
                  }
                  placeholder="Ej. Desayuno"
                  maxLength={
                    120
                  }
                  autoFocus
                  required
                />
              </label>

              <label
                className={
                  styles.field
                }
              >
                <span>
                  Hora
                </span>

                <div
                  className={
                    styles.timeField
                  }
                >
                  <Clock3 />

                  <input
                    type="time"
                    value={
                      plannedTime
                    }
                    onChange={
                      (
                        event,
                      ) =>
                        setPlannedTime(
                          event
                            .target
                            .value,
                        )
                    }
                  />
                </div>
              </label>

              <label
                className={
                  styles.field
                }
              >
                <span>
                  Notas
                  <small>
                    opcional
                  </small>
                </span>

                <textarea
                  value={
                    notes
                  }
                  onChange={
                    (
                      event,
                    ) =>
                      setNotes(
                        event
                          .target
                          .value,
                      )
                  }
                  placeholder="Indicaciones, contexto, preentreno…"
                  rows={
                    3
                  }
                />
              </label>

              {error && (
                <div
                  className={
                    styles.error
                  }
                  role="alert"
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
                  className={
                    styles.submit
                  }
                  disabled={
                    submitting
                  }
                >
                  {submitting
                    ? 'Creando…'
                    : 'Crear comida'}
                </button>
              </footer>

            </form>

          </section>
        </div>
      )}
    </>
  );
}
