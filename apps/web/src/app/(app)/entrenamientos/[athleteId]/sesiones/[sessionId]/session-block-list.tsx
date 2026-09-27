'use client';

import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';

import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';

import {
  CSS,
} from '@dnd-kit/utilities';

import {
  GripVertical,
  MoreHorizontal,
  Trash2,
} from 'lucide-react';

import {
  type ReactNode,
  useEffect,
  useRef,
  useState,
} from 'react';

import {
  useRouter,
} from 'next/navigation';

import {
  useTrainingMobileMode,
  useTrainingMobileEditMode,
} from '../../../use-training-mobile-mode';

import styles from './session-block-list.module.css';

interface SessionExerciseItem {

  id:
    string;

  blockId:
    string;

  position:
    number;

  name:
    string;

  metricProfile:
    string;

  plannedNotes:
    string | null;

}

interface SessionBlockItem {

  id:
    string;

  position:
    number;

  title:
    string;

  notes:
    string | null;

  exercises:
    SessionExerciseItem[];

}

interface SessionBlockListProps {

  athleteId:
    string;

  sessionId:
    string;

  blocks:
    SessionBlockItem[];

  canWrite:
    boolean;

  exerciseContent:
    ReactNode[];

  blockControls:
    ReactNode[];

}

interface SortableSessionBlockProps {

  athleteId:
    string;

  block:
    SessionBlockItem;

  index:
    number;

  canWrite:
    boolean;

  content:
    ReactNode;

  onUpdate:
    (
      blockId:
        string,

      title:
        string,

      notes:
        string | null,
    ) => Promise<boolean>;

  onDelete:
    (
      blockId:
        string,
    ) => Promise<boolean>;

}

interface SortableSessionExerciseProps {

  exercise:
    SessionExerciseItem;

  canWrite:
    boolean;

  content:
    ReactNode;

  onUpdateNotes:
    (
      exerciseId:
        string,
      plannedNotes:
        string | null,
    ) => Promise<boolean>;

  onDelete:
    (
      exerciseId:
        string,
    ) => Promise<boolean>;

}

function SortableSessionExercise({

  exercise,

  canWrite,

  content,

  onUpdateNotes,

  onDelete,

}: SortableSessionExerciseProps) {

  const {

    attributes,

    listeners,

    setNodeRef,

    transform,

    transition,

    isDragging,

  } = useSortable({

    id:
      exercise.id,

    disabled:
      !canWrite,

    data: {

      type:
        'exercise',

      blockId:
        exercise.blockId,

    },

  });

  const menuRef =
    useRef<HTMLDivElement | null>(
      null,
    );

  const menuButtonRef =
    useRef<HTMLButtonElement | null>(
      null,
    );

  const [

    notes,

    setNotes,

  ] = useState(

    exercise.plannedNotes ??
    '',

  );

  const [

    saving,

    setSaving,

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

    deleting,

    setDeleting,

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

      setNotes(

        exercise.plannedNotes ??
        '',

      );

    },

    [
      exercise.plannedNotes,
    ],

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

  const saveNotes =

    async () => {

      if (

        !canWrite ||
        saving

      ) {

        return;

      }

      const normalized =
        notes.trim();

      const current =
        exercise.plannedNotes ??
        '';

      if (

        normalized ===
        current

      ) {

        if (

          notes !==
          normalized

        ) {

          setNotes(
            normalized,
          );

        }

        return;

      }

      setSaving(
        true,
      );

      setError(
        null,
      );

      const updated =

        await onUpdateNotes(

          exercise.id,

          normalized ||
            null,

        );

      setSaving(
        false,
      );

      if (!updated) {

        setNotes(
          current,
        );

        setError(
          'No se han podido guardar las notas del ejercicio.',
        );

        return;

      }

      setNotes(
        normalized,
      );

    };

  const remove =

    async () => {

      if (deleting) {

        return;

      }

      setDeleting(
        true,
      );

      setError(
        null,
      );

      const deleted =

        await onDelete(
          exercise.id,
        );

      setDeleting(
        false,
      );

      if (!deleted) {

        setError(
          'No se ha podido eliminar el ejercicio.',
        );

        setConfirmDelete(
          false,
        );

        return;

      }

      setMenuOpen(
        false,
      );

    };

  return (

    <article

      ref={
        setNodeRef
      }

      className={[
        'training-session-exercise',
        styles.exercise,
        isDragging
          ? styles.exerciseDragging
          : '',
      ].join(
        ' ',
      )}

      style={{

        transform:
          CSS.Transform.toString(
            transform,
          ),

        transition,

      }}

    >

      <div
        className={
          styles.exerciseHeader
        }
      >

        <div
          className={
            styles.exerciseHeading
          }
        >

          {canWrite && (

            <button

              type="button"

              className={
                styles.exerciseDragHandle
              }

              aria-label={`Mover ${exercise.name}`}

              title="Arrastrar ejercicio"

              {...attributes}

              {...listeners}

            >

              <GripVertical />

            </button>

          )}

          <div className="training-session-exercise-name">

            <strong>

              {
                exercise.name
              }

            </strong>

            <span>

              {
                exercise.metricProfile
              }

            </span>

          </div>

        </div>

        {canWrite && (

          <div
            className={
              styles.exerciseMenuRoot
            }
          >

            <button

              ref={
                menuButtonRef
              }

              type="button"

              className={
                styles.exerciseMenuButton
              }

              aria-label={`Acciones de ${exercise.name}`}

              aria-expanded={
                menuOpen
              }

              onClick={() => {

                setMenuOpen(

                  current =>
                    !current,

                );

                setConfirmDelete(
                  false,
                );

              }}

            >

              <MoreHorizontal />

            </button>

            {menuOpen && (

              <div

                ref={
                  menuRef
                }

                className={
                  styles.exerciseMenu
                }

              >

                {!confirmDelete ? (

                  <button

                    type="button"

                    className={
                      styles.deleteAction
                    }

                    onClick={() => {

                      setConfirmDelete(
                        true,
                      );

                    }}

                  >

                    <Trash2 />

                    Eliminar ejercicio

                  </button>

                ) : (

                  <div
                    className={
                      styles.deleteConfirm
                    }
                  >

                    <span>

                      ¿Eliminar este ejercicio?

                    </span>

                    <div>

                      <button

                        type="button"

                        onClick={() => {

                          setConfirmDelete(
                            false,
                          );

                        }}

                      >

                        Cancelar

                      </button>

                      <button

                        type="button"

                        className={
                          styles.confirmDeleteButton
                        }

                        disabled={
                          deleting
                        }

                        onClick={() => {

                          void remove();

                        }}

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

        )}

      </div>

      {canWrite ? (

        <textarea

          className={
            styles.exerciseNotesInput
          }

          value={
            notes
          }

          rows={
            1
          }

          placeholder="Añadir notas de planificación"

          aria-label={`Notas de ${exercise.name}`}

          disabled={
            saving
          }

          onChange={(event) => {

            setNotes(
              event.target.value,
            );

            setError(
              null,
            );

          }}

          onBlur={() => {

            void saveNotes();

          }}

          onKeyDown={(event) => {

            if (

              event.key ===
              'Escape'

            ) {

              setNotes(

                exercise.plannedNotes ??
                  '',

              );

              event.currentTarget.blur();

            }

          }}

        />

      ) : (

        exercise.plannedNotes && (

          <p className="training-session-exercise-plan-note">

            {
              exercise.plannedNotes
            }

          </p>

        )

      )}

      {error && (

        <div
          className={
            styles.error
          }
        >

          {error}

        </div>

      )}

      {content}

    </article>

  );

}

function SortableSessionBlock({

  athleteId: _athleteId,
  block,
  index,
  canWrite,
  content,
  onUpdate,
  onDelete,

}: SortableSessionBlockProps) {

  const {

    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,

  } = useSortable({

    id:
      block.id,

    disabled:
      !canWrite,

    data: {

      type:
        'block',

      blockId:
        block.id,

    },

  });

  const menuRef =
    useRef<HTMLDivElement | null>(
      null,
    );

  const menuButtonRef =
    useRef<HTMLButtonElement | null>(
      null,
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
    deleting,
    setDeleting,
  ] = useState(
    false,
  );

  const [
    title,
    setTitle,
  ] = useState(
    block.title,
  );

  const [
    notes,
    setNotes,
  ] = useState(
    block.notes ?? '',
  );

  const [
    savingTitle,
    setSavingTitle,
  ] = useState(
    false,
  );

  const [
    savingNotes,
    setSavingNotes,
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

      setTitle(
        block.title,
      );

      setNotes(
        block.notes ?? '',
      );

    },

    [
      block.title,
      block.notes,
    ],

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
            event.target as Node;

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

  const saveTitle =
    async () => {

      if (!canWrite) {
        return;
      }

      const normalized =
        title.trim();

      if (!normalized) {

        setTitle(
          block.title,
        );

        setError(
          'El título del bloque no puede estar vacío.',
        );

        return;
      }

      if (
        normalized ===
        block.title
      ) {

        if (
          title !==
          normalized
        ) {

          setTitle(
            normalized,
          );

        }

        return;
      }

      setSavingTitle(
        true,
      );

      setError(
        null,
      );

      const updated =

        await onUpdate(

          block.id,

          normalized,

          notes.trim() ||
            null,

        );

      setSavingTitle(
        false,
      );

      if (!updated) {

        setTitle(
          block.title,
        );

        setError(
          'No se ha podido guardar el título.',
        );

        return;
      }

      setTitle(
        normalized,
      );

    };

  const saveNotes =
    async () => {

      if (!canWrite) {
        return;
      }

      const normalized =
        notes.trim();

      const current =
        block.notes ??
        '';

      if (
        normalized ===
        current
      ) {

        if (
          notes !==
          normalized
        ) {

          setNotes(
            normalized,
          );

        }

        return;
      }

      setSavingNotes(
        true,
      );

      setError(
        null,
      );

      const updated =

        await onUpdate(

          block.id,

          title.trim() ||
            block.title,

          normalized ||
            null,

        );

      setSavingNotes(
        false,
      );

      if (!updated) {

        setNotes(
          block.notes ??
            '',
        );

        setError(
          'No se han podido guardar las notas.',
        );

        return;
      }

      setNotes(
        normalized,
      );

    };

  const handleDelete =
    async () => {

      if (deleting) {
        return;
      }

      setDeleting(
        true,
      );

      setError(
        null,
      );

      const deleted =

        await onDelete(
          block.id,
        );

      setDeleting(
        false,
      );

      if (!deleted) {

        setError(
          'No se ha podido eliminar el bloque.',
        );

        setConfirmDelete(
          false,
        );

        return;
      }

      setMenuOpen(
        false,
      );

    };

  return (

    <section

      ref={
        setNodeRef
      }

      className={[
        'training-session-block',
        styles.block,
        isDragging
          ? styles.dragging
          : '',
      ].join(
        ' ',
      )}

      style={{

        transform:
          CSS.Transform.toString(
            transform,
          ),

        transition,

      }}

    >

      <header
        className="training-session-block-header"
      >

        <div
          className={
            styles.heading
          }
        >

          <div
            className={
              styles.indexRow
            }
          >

            {canWrite && (

              <button

                type="button"

                className={
                  styles.dragHandle
                }

                aria-label={`Mover bloque ${index + 1}`}

                title="Arrastrar para reordenar"

                {...attributes}
                {...listeners}

              >

                <GripVertical />

              </button>

            )}

            <span className="training-session-block-index">

              Bloque {
                index + 1
              }

            </span>

          </div>

          {canWrite ? (

            <input

              className={
                styles.titleInput
              }

              value={
                title
              }

              aria-label={`Título del bloque ${index + 1}`}

              disabled={
                savingTitle
              }

              onChange={(
                event,
              ) => {

                setTitle(
                  event.target.value,
                );

                setError(
                  null,
                );

              }}

              onBlur={() => {

                void saveTitle();

              }}

              onKeyDown={(
                event,
              ) => {

                if (
                  event.key ===
                  'Enter'
                ) {

                  event.preventDefault();

                  event.currentTarget.blur();

                }

                if (
                  event.key ===
                  'Escape'
                ) {

                  setTitle(
                    block.title,
                  );

                  event.currentTarget.blur();

                }

              }}

            />

          ) : (

            <h2>

              {
                block.title
              }

            </h2>

          )}

        </div>

        <div
          className={
            styles.headerActions
          }
        >

          <span
            className={
              styles.exerciseCount
            }
          >

            {
              block.exercises.length
            }{' '}
            {
              block.exercises.length ===
              1
                ? 'ejercicio'
                : 'ejercicios'
            }

          </span>

          {canWrite && (

            <div
              className={
                styles.menuRoot
              }
            >

              <button

                ref={
                  menuButtonRef
                }

                type="button"

                className={
                  styles.menuButton
                }

                aria-label={`Acciones del bloque ${index + 1}`}

                aria-expanded={
                  menuOpen
                }

                onClick={() => {

                  setMenuOpen(
                    current =>
                      !current,
                  );

                  setConfirmDelete(
                    false,
                  );

                }}

              >

                <MoreHorizontal />

              </button>

              {menuOpen && (

                <div

                  ref={
                    menuRef
                  }

                  className={
                    styles.menu
                  }

                >

                  {!confirmDelete ? (

                    <button

                      type="button"

                      className={
                        styles.deleteAction
                      }

                      onClick={() => {

                        setConfirmDelete(
                          true,
                        );

                      }}

                    >

                      <Trash2 />

                      Eliminar bloque

                    </button>

                  ) : (

                    <div
                      className={
                        styles.deleteConfirm
                      }
                    >

                      <span>

                        ¿Eliminar este bloque?

                      </span>

                      <div>

                        <button

                          type="button"

                          onClick={() => {

                            setConfirmDelete(
                              false,
                            );

                          }}

                        >

                          Cancelar

                        </button>

                        <button

                          type="button"

                          className={
                            styles.confirmDeleteButton
                          }

                          disabled={
                            deleting
                          }

                          onClick={() => {

                            void handleDelete();

                          }}

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

          )}

        </div>

      </header>

      {canWrite ? (

        <textarea

          className={[
            'training-session-block-notes',
            styles.notesInput,
          ].join(
            ' ',
          )}

          value={
            notes
          }

          rows={
            1
          }

          placeholder="Añadir notas al bloque"

          aria-label={`Notas del bloque ${index + 1}`}

          disabled={
            savingNotes
          }

          onChange={(
            event,
          ) => {

            setNotes(
              event.target.value,
            );

            setError(
              null,
            );

          }}

          onBlur={() => {

            void saveNotes();

          }}

          onKeyDown={(
            event,
          ) => {

            if (
              event.key ===
                'Escape'
            ) {

              setNotes(
                block.notes ??
                  '',
              );

              event.currentTarget.blur();

            }

          }}

        />

      ) : (

        block.notes && (

          <p className="training-session-block-notes">

            {
              block.notes
            }

          </p>

        )

      )}

      {error && (

        <div
          className={
            styles.error
          }
        >

          {error}

        </div>

      )}

      {content}

    </section>

  );

}

export function SessionBlockList({
  athleteId,
  sessionId,
  blocks,
  canWrite,
  exerciseContent,
  blockControls,
}: SessionBlockListProps) {

  const mobile =
    useTrainingMobileMode();

  const {
    enabled:
      mobileEditEnabled,
  } =
    useTrainingMobileEditMode();

  const canEditPlan =
    canWrite &&
    (
      !mobile ||
      mobileEditEnabled
    );

  const router =
    useRouter();

  const originalIndexById =
    new Map(

      blocks.map(
        (
          block,
          index,
        ) => [
          block.id,
          index,
        ],
      ),

    );

    const originalExerciseIndexById =

    new Map(

      blocks

        .flatMap(

          block =>
            [...block.exercises]

              .sort(

                (

                  a,

                  b,

                ) =>
                  a.position -
                  b.position,

              ),

        )

        .map(

          (

            exercise,

            index,

          ) => [

            exercise.id,

            index,

          ],

        ),

    );

  const [
    orderedBlocks,
    setOrderedBlocks,
  ] = useState(

    () =>
      [...blocks].sort(
        (
          a,
          b,
        ) =>
          a.position -
          b.position,
      ),

  );

  const [
    reorderError,
    setReorderError,
  ] = useState<string | null>(
    null,
  );

  useEffect(

    () => {

      setOrderedBlocks(

        [...blocks].sort(
          (
            a,
            b,
          ) =>
            a.position -
            b.position,
        ),

      );

    },

    [
      blocks,
    ],

  );

  const sensors =
    useSensors(

      useSensor(
        PointerSensor,
        {

          activationConstraint: {

            distance:
              6,

          },

        },
      ),

      useSensor(
        KeyboardSensor,
        {

          coordinateGetter:
            sortableKeyboardCoordinates,

        },
      ),

    );

  const updateBlock =
    async (

      blockId:
        string,

      title:
        string,

      notes:
        string | null,

    ): Promise<boolean> => {

      try {

        const response =

          await fetch(

            `/api/training/athletes/${encodeURIComponent(
              athleteId,
            )}/blocks/${encodeURIComponent(
              blockId,
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

                  title,

                  notes,

                }),

            },

          );

        if (!response.ok) {

          return false;

        }

        setOrderedBlocks(

          current =>
            current.map(

              block =>
                block.id ===
                blockId
                  ? {
                      ...block,
                      title,
                      notes,
                    }
                  : block,

            ),

        );

        return true;

      } catch {

        return false;

      }

    };

  const deleteBlock =
    async (

      blockId:
        string,

    ): Promise<boolean> => {

      try {

        const response =

          await fetch(

            `/api/training/athletes/${encodeURIComponent(
              athleteId,
            )}/blocks/${encodeURIComponent(
              blockId,
            )}`,

            {

              method:
                'DELETE',

            },

          );

        if (!response.ok) {

          return false;

        }

        setOrderedBlocks(

          current =>
            current

              .filter(
                block =>
                  block.id !==
                  blockId,
              )

              .map(
                (
                  block,
                  position,
                ) => ({
                  ...block,
                  position,
                }),
              ),

        );

        router.refresh();

        return true;

      } catch {

        return false;

      }

    };

    const updateExerciseNotes =

    async (

      exerciseId:
        string,

      plannedNotes:
        string | null,

    ): Promise<boolean> => {

      try {

        const response =

          await fetch(

            `/api/training/athletes/${encodeURIComponent(
              athleteId,
            )}/session-exercises/${encodeURIComponent(
              exerciseId,
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

                  plannedNotes,

                }),

            },

          );

        if (!response.ok) {

          return false;

        }

        setOrderedBlocks(

          current =>

            current.map(

              block => ({

                ...block,

                exercises:

                  block.exercises.map(

                    exercise =>

                      exercise.id ===
                      exerciseId

                        ? {

                            ...exercise,

                            plannedNotes,

                          }

                        : exercise,

                  ),

              }),

            ),

        );

        return true;

      } catch {

        return false;

      }

    };

  const deleteExercise =

    async (

      exerciseId:
        string,

    ): Promise<boolean> => {

      try {

        const response =

          await fetch(

            `/api/training/athletes/${encodeURIComponent(
              athleteId,
            )}/session-exercises/${encodeURIComponent(
              exerciseId,
            )}`,

            {

              method:
                'DELETE',

            },

          );

        if (!response.ok) {

          return false;

        }

        setOrderedBlocks(

          current =>

            current.map(

              block => ({

                ...block,

                exercises:

                  block.exercises

                    .filter(

                      exercise =>
                        exercise.id !==
                        exerciseId,

                    )

                    .map(

                      (

                        exercise,

                        position,

                      ) => ({

                        ...exercise,

                        position,

                      }),

                    ),

              }),

            ),

        );

        router.refresh();

        return true;

      } catch {

        return false;

      }

    };

    const persistExerciseLayout =

    async (

      next:
        SessionBlockItem[],

    ): Promise<boolean> => {

      try {

        const response =

          await fetch(

            `/api/training/athletes/${encodeURIComponent(
              athleteId,
            )}/sessions/${encodeURIComponent(
              sessionId,
            )}/exercises/layout`,

            {

              method:
                'PUT',

              headers: {

                'content-type':
                  'application/json',

              },

              body:
                JSON.stringify({

                  blocks:

                    next.map(

                      block => ({

                        blockId:
                          block.id,

                        orderedIds:

                          [...block.exercises]

                            .sort(
                              (
                                a,
                                b,
                              ) =>
                                a.position -
                                b.position,
                            )

                            .map(
                              exercise =>
                                exercise.id,
                            ),

                      }),

                    ),

                }),

            },

          );

        return response.ok;

      } catch {

        return false;

      }

    };

  const handleDragEnd =

    async (

      event:
        DragEndEvent,

    ) => {

      const {

        active,

        over,

      } = event;

      if (!over) {

        return;

      }

      const activeType =

        active.data.current
          ?.type;

      const overType =

        over.data.current
          ?.type;

      /*
       * BLOCK DRAG
       */

      if (

        activeType ===
        'block'

      ) {

        const activeBlockId =
          String(
            active.id,
          );

        const targetBlockId =

          overType ===
          'exercise'

            ? String(
                over.data.current
                  ?.blockId ??
                '',
              )

            : String(
                over.id,
              );

        if (

          !targetBlockId ||

          activeBlockId ===
          targetBlockId

        ) {

          return;

        }

        const previous =
          orderedBlocks;

        const oldIndex =

          previous.findIndex(

            block =>
              block.id ===
              activeBlockId,

          );

        const newIndex =

          previous.findIndex(

            block =>
              block.id ===
              targetBlockId,

          );

        if (

          oldIndex === -1 ||

          newIndex === -1

        ) {

          return;

        }

        const next =

          arrayMove(

            previous,

            oldIndex,

            newIndex,

          ).map(

            (
              block,
              position,
            ) => ({

              ...block,

              position,

            }),

          );

        setOrderedBlocks(
          next,
        );

        setReorderError(
          null,
        );

        try {

          const response =

            await fetch(

              `/api/training/athletes/${encodeURIComponent(
                athleteId,
              )}/sessions/${encodeURIComponent(
                sessionId,
              )}/blocks/order`,

              {

                method:
                  'PUT',

                headers: {

                  'content-type':
                    'application/json',

                },

                body:
                  JSON.stringify({

                    orderedIds:

                      next.map(
                        block =>
                          block.id,
                      ),

                  }),

              },

            );

          if (!response.ok) {

            throw new Error();

          }

        } catch {

          setOrderedBlocks(
            previous,
          );

          setReorderError(

            'No se ha podido guardar el nuevo orden de los bloques.',

          );

        }

        return;

      }

      /*
       * EXERCISE DRAG
       */

      if (

        activeType !==
        'exercise'

      ) {

        return;

      }

      const activeExerciseId =
        String(
          active.id,
        );

      const previous =
        orderedBlocks;

      let sourceBlockIndex =
        -1;

      let sourceExerciseIndex =
        -1;

      for (

        let blockIndex = 0;

        blockIndex <
        previous.length;

        blockIndex += 1

      ) {

        const exerciseIndex =

          previous[
            blockIndex
          ]?.exercises.findIndex(

            exercise =>
              exercise.id ===
              activeExerciseId,

          ) ?? -1;

        if (

          exerciseIndex !==
          -1

        ) {

          sourceBlockIndex =
            blockIndex;

          sourceExerciseIndex =
            exerciseIndex;

          break;

        }

      }

      if (

        sourceBlockIndex ===
          -1 ||

        sourceExerciseIndex ===
          -1

      ) {

        return;

      }

      const sourceBlock =

        previous[
          sourceBlockIndex
        ];

      if (!sourceBlock) {

        return;

      }

      const activeExercise =

        sourceBlock.exercises[
          sourceExerciseIndex
        ];

      if (!activeExercise) {

        return;

      }

      let targetBlockId:
        string;

      let targetExerciseId:
        string | null =
          null;

      if (

        overType ===
        'exercise'

      ) {

        targetBlockId =

          String(

            over.data.current
              ?.blockId ??
            '',

          );

        targetExerciseId =

          String(
            over.id,
          );

      } else if (

        overType ===
        'block'

      ) {

        targetBlockId =
          String(
            over.id,
          );

      } else {

        return;

      }

      const targetBlockIndex =

        previous.findIndex(

          block =>
            block.id ===
            targetBlockId,

        );

      if (

        targetBlockIndex ===
        -1

      ) {

        return;

      }

      /*
       * Same block:
       * normal sortable reorder.
       */

      if (

        sourceBlock.id ===
        targetBlockId &&

        targetExerciseId

      ) {

        const targetExerciseIndex =

          sourceBlock.exercises.findIndex(

            exercise =>
              exercise.id ===
              targetExerciseId,

          );

        if (

          targetExerciseIndex ===
          -1 ||

          targetExerciseIndex ===
          sourceExerciseIndex

        ) {

          return;

        }

        const next =

          previous.map(

            (
              block,
              blockIndex,
            ) => {

              if (

                blockIndex !==
                sourceBlockIndex

              ) {

                return block;

              }

              return {

                ...block,

                exercises:

                  arrayMove(

                    block.exercises,

                    sourceExerciseIndex,

                    targetExerciseIndex,

                  ).map(

                    (
                      exercise,
                      position,
                    ) => ({

                      ...exercise,

                      blockId:
                        block.id,

                      position,

                    }),

                  ),

              };

            },

          );

        setOrderedBlocks(
          next,
        );

        setReorderError(
          null,
        );

        const saved =

          await persistExerciseLayout(
            next,
          );

        if (!saved) {

          setOrderedBlocks(
            previous,
          );

          setReorderError(

            'No se ha podido guardar el nuevo orden de los ejercicios.',

          );

          return;

        }

        router.refresh();

        return;

      }

      /*
       * Cross-block movement, or dropping
       * directly over a block.
       */

      const next =

        previous.map(

          block => ({

            ...block,

            exercises:
              [...block.exercises],

          }),

        );

      const nextSourceBlock =

        next[
          sourceBlockIndex
        ];

      const nextTargetBlock =

        next[
          targetBlockIndex
        ];

      if (

        !nextSourceBlock ||

        !nextTargetBlock

      ) {

        return;

      }

      nextSourceBlock.exercises.splice(

        sourceExerciseIndex,

        1,

      );

      let insertIndex =

        nextTargetBlock
          .exercises.length;

      if (

        targetExerciseId

      ) {

        const foundIndex =

          nextTargetBlock
            .exercises
            .findIndex(

              exercise =>
                exercise.id ===
                targetExerciseId,

            );

        if (

          foundIndex !==
          -1

        ) {

          insertIndex =
            foundIndex;

        }

      }

      nextTargetBlock.exercises.splice(

        insertIndex,

        0,

        {

          ...activeExercise,

          blockId:
            nextTargetBlock.id,

        },

      );

      const normalized =

        next.map(

          block => ({

            ...block,

            exercises:

              block.exercises.map(

                (
                  exercise,
                  position,
                ) => ({

                  ...exercise,

                  blockId:
                    block.id,

                  position,

                }),

              ),

          }),

        );

      setOrderedBlocks(
        normalized,
      );

      setReorderError(
        null,
      );

      const saved =

        await persistExerciseLayout(
          normalized,
        );

      if (!saved) {

        setOrderedBlocks(
          previous,
        );

        setReorderError(

          'No se ha podido mover el ejercicio.',

        );

        return;

      }

      router.refresh();

    };

  return (

    <>

      <DndContext

        id={`session-blocks-${sessionId}`}

        sensors={
          sensors
        }

        collisionDetection={
          closestCenter
        }

        onDragEnd={(
          event,
        ) => {

          void handleDragEnd(
            event,
          );

        }}

      >

        <SortableContext

          items={
            orderedBlocks.map(
              block =>
                block.id,
            )
          }

          strategy={
            verticalListSortingStrategy
          }

        >

          {orderedBlocks.map(

            (
              block,
              index,
            ) => {

                            const originalIndex =

                originalIndexById.get(

                  block.id,

                );

              const control =

                originalIndex ===

                undefined

                  ? null

                  : blockControls[
                      originalIndex
                    ];

                            const content = (

                <div
                  className="training-session-exercises"
                >

                  <SortableContext

                    items={
                      [...block.exercises]

                        .sort(
                          (
                            a,
                            b,
                          ) =>
                            a.position -
                            b.position,
                        )

                        .map(
                          exercise =>
                            exercise.id,
                        )
                    }

                    strategy={
                      verticalListSortingStrategy
                    }

                  >

                    {[...block.exercises]

                      .sort(
                        (
                          a,
                          b,
                        ) =>
                          a.position -
                          b.position,
                      )

                      .map(

                        exercise => {

                          const exerciseIndex =

                            originalExerciseIndexById.get(

                              exercise.id,

                            );

                          if (

                            exerciseIndex ===
                            undefined

                          ) {

                            return null;

                          }

                          return (

                            <SortableSessionExercise

                              key={
                                exercise.id
                              }

                              exercise={
                                exercise
                              }

                              canWrite={
                                canEditPlan
                              }

                              content={
                                exerciseContent[
                                  exerciseIndex
                                ]
                              }

                              onUpdateNotes={
                                updateExerciseNotes
                              }

                              onDelete={
                                deleteExercise
                              }

                            />

                          );

                        },

                      )}

                  </SortableContext>

                  {control}

                </div>

              );

              return (

                <SortableSessionBlock

                  key={
                    block.id
                  }

                  athleteId={
                    athleteId
                  }

                  block={
                    block
                  }

                  index={
                    index
                  }

                  canWrite={
                    canEditPlan
                  }

                  content={
                    content
                  }

                  onUpdate={
                    updateBlock
                  }

                  onDelete={
                    deleteBlock
                  }

                />

              );

            },

          )}

        </SortableContext>

      </DndContext>

      {reorderError && (

        <div
          className={
            styles.reorderError
          }
        >

          {reorderError}

        </div>

      )}

    </>

  );

}
