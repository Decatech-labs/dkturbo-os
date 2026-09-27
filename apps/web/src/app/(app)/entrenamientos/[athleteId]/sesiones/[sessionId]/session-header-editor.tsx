'use client';

import {
  MoreHorizontal,
  Trash2,
} from 'lucide-react';

import {
  useEffect,
  useRef,
  useState,
} from 'react';

import {
  useRouter,
} from 'next/navigation';

import styles from './session-header-editor.module.css';

export type TrainingSessionType =
  | 'STRENGTH'
  | 'RUNNING'
  | 'SWIMMING'
  | 'CYCLING'
  | 'POLE_VAULT'
  | 'JUMPS'
  | 'THROWS'
  | 'TECHNIQUE'
  | 'REHAB'
  | 'MOBILITY'
  | 'OTHER';

interface SessionHeaderEditorProps {
  athleteId:
    string;

  sessionId:
    string;

  dayId:
    string;

  type:
    TrainingSessionType;

  title:
    string;

  plannedStartTime:
    string | null;

  plannedDurationMinutes:
    number | null;

  plannedNotes:
    string | null;

  plannedRpe:
    number | null;

  accessRole:
    string;

  canWrite:
    boolean;

  backHref:
    string;
}

interface SessionDraft {
  type:
    TrainingSessionType;

  title:
    string;

  plannedStartTime:
    string;

  plannedDurationMinutes:
    string;

  plannedNotes:
    string;

  plannedRpe:
    string;
}

const sessionTypes:
  Array<{
    value:
      TrainingSessionType;

    label:
      string;
  }> = [
    {
      value:
        'STRENGTH',
      label:
        'Fuerza',
    },
    {
      value:
        'RUNNING',
      label:
        'Carrera',
    },
    {
      value:
        'SWIMMING',
      label:
        'Natación',
    },
    {
      value:
        'CYCLING',
      label:
        'Ciclismo',
    },
    {
      value:
        'JUMPS',
      label:
        'Saltos',
    },
    {
      value:
        'THROWS',
      label:
        'Lanzamientos',
    },
    {
      value:
        'TECHNIQUE',
      label:
        'Técnica',
    },
    {
      value:
        'REHAB',
      label:
        'Rehabilitación',
    },
    {
      value:
        'MOBILITY',
      label:
        'Movilidad',
    },
    {
      value:
        'OTHER',
      label:
        'Otro',
    },
  ];

const sessionTypeLabel =
  (
    type:
      TrainingSessionType,
  ): string =>
    sessionTypes.find(
      (item) =>
        item.value ===
        type,
    )?.label ??
    (
      type ===
        'POLE_VAULT'
        ? 'Pértiga'
        : type
    );

export function SessionHeaderEditor({
  athleteId,
  sessionId,
  dayId,
  type,
  title,
  plannedStartTime,
  plannedDurationMinutes,
  plannedNotes,
  plannedRpe,
  accessRole,
  canWrite,
  backHref,
}: SessionHeaderEditorProps) {

  const router =
    useRouter();

  const menuRef =
    useRef<HTMLDivElement | null>(
      null,
    );

  const menuButtonRef =
    useRef<HTMLButtonElement | null>(
      null,
    );

  const [
    draft,
    setDraft,
  ] = useState<SessionDraft>({
    type,

    title,

    plannedStartTime:
      plannedStartTime ??
      '',

    plannedDurationMinutes:
      plannedDurationMinutes ===
      null
        ? ''
        : String(
            plannedDurationMinutes,
          ),

    plannedNotes:
      plannedNotes ??
      '',

    plannedRpe:
      plannedRpe ===
      null
        ? ''
        : String(
            plannedRpe,
          ),
  });

  const [
    saving,
    setSaving,
  ] = useState(
    false,
  );

  const [
    deleting,
    setDeleting,
  ] = useState(
    false,
  );

  const [
    menuOpen,
    setMenuOpen,
  ] = useState(
    false,
  );

  const [
    confirmDelete,
    setConfirmDelete,
  ] = useState(
    false,
  );

  const [
    error,
    setError,
  ] = useState<string | null>(
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
            menuRef.current?.contains(
              target,
            ) ||
            menuButtonRef.current?.contains(
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

  const persist =
    async (
      next:
        SessionDraft,
    ): Promise<boolean> => {

      if (!canWrite) {
        return false;
      }

      const normalizedTitle =
        next.title.trim();

      if (!normalizedTitle) {
        setError(
          'El título no puede estar vacío.',
        );

        return false;
      }

      const duration =
        next.plannedDurationMinutes.trim() ===
        ''
          ? null
          : Number(
              next.plannedDurationMinutes,
            );

      if (
        duration !== null &&
        (
          !Number.isInteger(
            duration,
          ) ||
          duration < 0
        )
      ) {
        setError(
          'La duración debe ser un número entero positivo.',
        );

        return false;
      }

      const rpe =
        next.plannedRpe.trim() ===
        ''
          ? null
          : Number(
              next.plannedRpe,
            );

      if (
        rpe !== null &&
        (
          !Number.isFinite(
            rpe,
          ) ||
          rpe < 0 ||
          rpe > 10
        )
      ) {
        setError(
          'El RPE debe estar entre 0 y 10.',
        );

        return false;
      }

      setSaving(
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
            )}/sessions/${encodeURIComponent(
              sessionId,
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
                  dayId,

                  type:
                    next.type,

                  title:
                    normalizedTitle,

                  plannedStartTime:
                    next.plannedStartTime ||
                    null,

                  plannedDurationMinutes:
                    duration,

                  plannedNotes:
                    next.plannedNotes.trim() ||
                    null,

                  plannedRpe:
                    rpe,
                }),
            },
          );

        if (!response.ok) {
          setError(
            'No se han podido guardar los cambios.',
          );

          return false;
        }

        setDraft({
          ...next,

          title:
            normalizedTitle,

          plannedDurationMinutes:
            duration === null
              ? ''
              : String(
                  duration,
                ),

          plannedRpe:
            rpe === null
              ? ''
              : String(
                  rpe,
                ),
        });

        return true;

      } catch {

        setError(
          'No se han podido guardar los cambios.',
        );

        return false;

      } finally {

        setSaving(
          false,
        );

      }
    };

  const updateAndPersist =
    async (
      patch:
        Partial<SessionDraft>,

      refresh = false,
    ) => {

      const next = {
        ...draft,
        ...patch,
      };

      setDraft(
        next,
      );

      const saved =
        await persist(
          next,
        );

      if (
        saved &&
        refresh
      ) {
        router.refresh();
      }
    };

  const handleDelete =
    async () => {

      setDeleting(
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
            )}/sessions/${encodeURIComponent(
              sessionId,
            )}`,
            {
              method:
                'DELETE',
            },
          );

        if (
          response.status !==
          204
        ) {
          setError(
            'No se ha podido eliminar la sesión.',
          );

          return;
        }

        router.push(
          backHref,
        );

        router.refresh();

      } catch {

        setError(
          'No se ha podido eliminar la sesión.',
        );

      } finally {

        setDeleting(
          false,
        );

      }
    };

  if (!canWrite) {

    return (
      <div className="training-session-heading">

        <div className="training-session-heading-meta">

          <span>
            {sessionTypeLabel(
              type,
            )}
          </span>

          <span>
            {accessRole}
          </span>

          <span>
            Solo lectura
          </span>

        </div>

        <h1>
          {title}
        </h1>

        <div className="training-session-summary">

          {plannedStartTime && (
            <span>
              {plannedStartTime}
            </span>
          )}

          {plannedDurationMinutes !==
            null && (
            <span>
              {plannedDurationMinutes} min
            </span>
          )}

          {plannedRpe !==
            null && (
            <span>
              RPE {plannedRpe}
            </span>
          )}

        </div>

        {plannedNotes && (
          <p className={styles.readOnlyNotes}>
            {plannedNotes}
          </p>
        )}

      </div>
    );
  }

  return (
    <div className={`training-session-heading ${styles.root}`}>

      <div className={styles.topRow}>

        <div className={styles.meta}>

          <select
            className={styles.typeSelect}
            value={
              draft.type
            }
            disabled={
              saving
            }
            aria-label="Tipo de sesión"
            onChange={
              (event) => {
                void updateAndPersist(
                  {
                    type:
                      event.target.value as
                        TrainingSessionType,
                  },
                  true,
                );
              }
            }
          >

            {sessionTypes.map(
              (item) => (
                <option
                  key={
                    item.value
                  }
                  value={
                    item.value
                  }
                >
                  {item.label}
                </option>
              ),
            )}

          </select>

          <span className={styles.accessRole}>
            {accessRole}
          </span>

          {saving && (
            <span className={styles.saving}>
              Guardando…
            </span>
          )}

        </div>

        <div
          className={styles.menuRoot}
          ref={
            menuRef
          }
        >

          <button
            ref={
              menuButtonRef
            }
            type="button"
            className={styles.menuButton}
            aria-label="Más opciones"
            aria-expanded={
              menuOpen
            }
            onClick={
              () => {

                setMenuOpen(
                  (current) =>
                    !current,
                );

                setConfirmDelete(
                  false,
                );

              }
            }
          >
            <MoreHorizontal />
          </button>

          {menuOpen && (
            <div className={styles.menu}>

              {!confirmDelete ? (

                <button
                  type="button"
                  className={styles.deleteAction}
                  onClick={
                    () =>
                      setConfirmDelete(
                        true,
                      )
                  }
                >
                  <Trash2 />
                  Eliminar sesión
                </button>

              ) : (

                <div className={styles.deleteConfirm}>

                  <span>
                    ¿Eliminar esta sesión?
                  </span>

                  <div>

                    <button
                      type="button"
                      disabled={
                        deleting
                      }
                      onClick={
                        () =>
                          setConfirmDelete(
                            false,
                          )
                      }
                    >
                      Cancelar
                    </button>

                    <button
                      type="button"
                      className={styles.confirmDeleteButton}
                      disabled={
                        deleting
                      }
                      onClick={
                        () => {
                          void handleDelete();
                        }
                      }
                    >
                      {deleting
                        ? 'Eliminando…'
                        : 'Eliminar'}
                    </button>

                  </div>

                </div>

              )}

            </div>
          )}

        </div>

      </div>

      <input
        className={styles.titleInput}
        value={
          draft.title
        }
        disabled={
          saving
        }
        aria-label="Título de la sesión"
        onChange={
          (event) =>
            setDraft(
              (current) => ({
                ...current,

                title:
                  event.target.value,
              }),
            )
        }
        onBlur={
          () => {
            void persist(
              draft,
            );
          }
        }
        onKeyDown={
          (event) => {

            if (
              event.key ===
              'Enter'
            ) {
              event.currentTarget.blur();
            }

          }
        }
      />

      <div className={styles.summary}>

        <label className={styles.field}>
          <span>
            Hora
          </span>

          <input
            type="time"
            value={
              draft.plannedStartTime
            }
            disabled={
              saving
            }
            onChange={
              (event) =>
                setDraft(
                  (current) => ({
                    ...current,

                    plannedStartTime:
                      event.target.value,
                  }),
                )
            }
            onBlur={
              () => {
                void persist(
                  draft,
                );
              }
            }
          />
        </label>

        <label className={styles.field}>
          <span>
            Duración
          </span>

          <div className={styles.fieldWithSuffix}>
            <input
              type="number"
              min="0"
              step="1"
              inputMode="numeric"
              value={
                draft.plannedDurationMinutes
              }
              disabled={
                saving
              }
              onChange={
                (event) =>
                  setDraft(
                    (current) => ({
                      ...current,

                      plannedDurationMinutes:
                        event.target.value,
                    }),
                  )
              }
              onBlur={
                () => {
                  void persist(
                    draft,
                  );
                }
              }
            />

            <span>
              min
            </span>
          </div>
        </label>

        <label className={styles.field}>
          <span>
            RPE
          </span>

          <input
            type="number"
            min="0"
            max="10"
            step="0.5"
            inputMode="decimal"
            value={
              draft.plannedRpe
            }
            disabled={
              saving
            }
            onChange={
              (event) =>
                setDraft(
                  (current) => ({
                    ...current,

                    plannedRpe:
                      event.target.value,
                  }),
                )
            }
            onBlur={
              () => {
                void persist(
                  draft,
                );
              }
            }
          />
        </label>

      </div>

      <textarea
        className={styles.notesInput}
        value={
          draft.plannedNotes
        }
        disabled={
          saving
        }
        rows={
          1
        }
        placeholder="Añadir notas de la sesión…"
        aria-label="Notas de la sesión"
        onChange={
          (event) =>
            setDraft(
              (current) => ({
                ...current,

                plannedNotes:
                  event.target.value,
              }),
            )
        }
        onBlur={
          () => {
            void persist(
              draft,
            );
          }
        }
      />

      {error && (
        <p className={styles.error}>
          {error}
        </p>
      )}

    </div>
  );
}
