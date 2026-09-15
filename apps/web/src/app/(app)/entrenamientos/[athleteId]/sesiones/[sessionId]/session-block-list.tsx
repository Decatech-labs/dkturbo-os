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
  Children,
  type ReactNode,
  useEffect,
  useRef,
  useState,
} from 'react';

import {
  useRouter,
} from 'next/navigation';

import styles from './session-block-list.module.css';

interface SessionBlockItem {

  id:
    string;

  position:
    number;

  title:
    string;

  notes:
    string | null;

  exerciseCount:
    number;

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

  children:
    ReactNode;

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
              block.exerciseCount
            }{' '}

            {
              block.exerciseCount ===
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
  children,

}: SessionBlockListProps) {

  const router =
    useRouter();

  const childNodes =
    Children.toArray(
      children,
    );

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

  const handleDragEnd =
    async (

      event:
        DragEndEvent,

    ) => {

      const {
        active,
        over,
      } = event;

      if (
        !over ||
        active.id ===
          over.id
      ) {
        return;
      }

      const previous =
        orderedBlocks;

      const oldIndex =
        previous.findIndex(
          block =>
            block.id ===
            active.id,
        );

      const newIndex =
        previous.findIndex(
          block =>
            block.id ===
            over.id,
        );

      if (
        oldIndex ===
          -1 ||
        newIndex ===
          -1
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

    };

  if (
    orderedBlocks.length ===
    0
  ) {

    return (

      <div className="training-session-empty">

        Esta sesión todavía no tiene bloques.

      </div>

    );

  }

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

              const content =
                originalIndex ===
                undefined
                  ? null
                  : childNodes[
                      originalIndex
                    ];

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
                    canWrite
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
