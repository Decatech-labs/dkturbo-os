'use client';

import {
  Ellipsis,
  Trash2,
} from 'lucide-react';

import {
  useRouter,
} from 'next/navigation';

import {
  type KeyboardEvent,
  useEffect,
  useRef,
  useState,
} from 'react';

import type {
  NutritionMealResponse,
} from '../../../lib/nutrition-api';

import styles from './meal-heading-editor.module.css';

interface MealHeadingEditorProps {
  meal:
    NutritionMealResponse;
}

type EditingField =
  | 'name'
  | 'time'
  | null;

interface ApiErrorResponse {
  error?:
    string;
}

export function MealHeadingEditor({
  meal,
}: MealHeadingEditorProps) {

  const router =
    useRouter();

  const nameInputRef =
    useRef<HTMLInputElement>(
      null,
    );

  const timeInputRef =
    useRef<HTMLInputElement>(
      null,
    );

  const menuRef =
    useRef<HTMLDivElement>(
      null,
    );

  const [
    editing,
    setEditing,
  ] =
    useState<EditingField>(
      null,
    );

  const [
    name,
    setName,
  ] =
    useState(
      meal.name,
    );

  const [
    plannedTime,
    setPlannedTime,
  ] =
    useState(
      meal.plannedTime ??
      '',
    );

  const [
    menuOpen,
    setMenuOpen,
  ] =
    useState(
      false,
    );

  const [
    saving,
    setSaving,
  ] =
    useState(
      false,
    );

  const [
    deleting,
    setDeleting,
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

  useEffect(
    () => {

      if (
        editing ===
        'name'
      ) {
        nameInputRef
          .current
          ?.focus();

        nameInputRef
          .current
          ?.select();
      }

      if (
        editing ===
        'time'
      ) {
        timeInputRef
          .current
          ?.focus();
      }
    },
    [
      editing,
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

          if (
            menuRef.current &&
            !menuRef.current.contains(
              event.target as Node,
            )
          ) {
            setMenuOpen(
              false,
            );
          }
        };

      const handleKeyDown =
        (
          event:
            globalThis.KeyboardEvent,
        ) => {

          if (
            event.key ===
            'Escape'
          ) {
            setMenuOpen(
              false,
            );
          }
        };

      document.addEventListener(
        'pointerdown',
        handlePointerDown,
      );

      document.addEventListener(
        'keydown',
        handleKeyDown,
      );

      return () => {

        document.removeEventListener(
          'pointerdown',
          handlePointerDown,
        );

        document.removeEventListener(
          'keydown',
          handleKeyDown,
        );
      };

    },
    [
      menuOpen,
    ],
  );

  const patchMeal =
    async (
      body:
        Record<
          string,
          unknown
        >,
    ): Promise<boolean> => {

      setSaving(
        true,
      );

      setError(
        null,
      );

      try {

        const response =
          await fetch(
            `/api/nutrition/meals/${encodeURIComponent(
              meal.id,
            )}`,
            {
              method:
                'PATCH',

              headers: {
                'content-type':
                  'application/json',
              },

              body:
                JSON.stringify(
                  body,
                ),
            },
          );

        if (
          !response.ok
        ) {
          const responseBody =
            await response
              .json()
              .catch(
                () =>
                  null,
              ) as
                ApiErrorResponse |
                null;

          setError(
            responseBody?.error ===
              'invalid_nutrition_meal'
              ? 'El valor no es válido.'
              : 'No se ha podido guardar.',
          );

          return false;
        }

        router.refresh();

        return true;

      } catch {

        setError(
          'No se ha podido conectar con Nutrición.',
        );

        return false;

      } finally {

        setSaving(
          false,
        );
      }
    };

  const cancelName =
    () => {

      setName(
        meal.name,
      );

      setEditing(
        null,
      );

      setError(
        null,
      );
    };

  const saveName =
    async () => {

      const normalized =
        name.trim();

      if (
        normalized ===
        meal.name
      ) {
        setName(
          meal.name,
        );

        setEditing(
          null,
        );

        return;
      }

      if (!normalized) {
        setError(
          'El nombre no puede estar vacío.',
        );

        return;
      }

      const saved =
        await patchMeal({
          name:
            normalized,
        });

      if (saved) {
        setName(
          normalized,
        );

        setEditing(
          null,
        );
      }
    };

  const cancelTime =
    () => {

      setPlannedTime(
        meal.plannedTime ??
        '',
      );

      setEditing(
        null,
      );

      setError(
        null,
      );
    };

  const saveTime =
    async () => {

      const normalized =
        plannedTime ||
        null;

      if (
        normalized ===
        meal.plannedTime
      ) {
        setEditing(
          null,
        );

        return;
      }

      const saved =
        await patchMeal({
          plannedTime:
            normalized,
        });

      if (saved) {
        setEditing(
          null,
        );
      }
    };

  const handleNameKeyDown =
    (
      event:
        KeyboardEvent<
          HTMLInputElement
        >,
    ) => {

      if (
        event.key ===
        'Enter'
      ) {
        event.preventDefault();

        void saveName();
      }

      if (
        event.key ===
        'Escape'
      ) {
        event.preventDefault();

        cancelName();
      }
    };

  const handleTimeKeyDown =
    (
      event:
        KeyboardEvent<
          HTMLInputElement
        >,
    ) => {

      if (
        event.key ===
        'Enter'
      ) {
        event.preventDefault();

        void saveTime();
      }

      if (
        event.key ===
        'Escape'
      ) {
        event.preventDefault();

        cancelTime();
      }
    };

  const deleteMeal =
    async () => {

      setMenuOpen(
        false,
      );

      const confirmed =
        window.confirm(
          `¿Eliminar “${meal.name}”? También se eliminarán sus alimentos y cantidades.`,
        );

      if (!confirmed) {
        return;
      }

      setDeleting(
        true,
      );

      setError(
        null,
      );

      try {

        const response =
          await fetch(
            `/api/nutrition/meals/${encodeURIComponent(
              meal.id,
            )}`,
            {
              method:
                'DELETE',
            },
          );

        if (
          !response.ok
        ) {
          setError(
            'No se ha podido eliminar la comida.',
          );

          return;
        }

        setMenuOpen(
          false,
        );

        router.refresh();

      } catch {

        setError(
          'No se ha podido conectar con Nutrición.',
        );

      } finally {

        setDeleting(
          false,
        );
      }
    };

  return (
    <>
      <div
        className={
          styles.identity
        }
      >
        {editing ===
        'name' ? (
          <input
            ref={
              nameInputRef
            }
            className={
              styles.nameInput
            }
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
            onBlur={
              () => {
                if (
                  !saving
                ) {
                  void saveName();
                }
              }
            }
            onKeyDown={
              handleNameKeyDown
            }
            maxLength={
              120
            }
            disabled={
              saving
            }
            aria-label="Nombre de la comida"
          />
        ) : (
          <button
            type="button"
            className={
              styles.nameButton
            }
            onClick={
              () => {

                setMenuOpen(
                  false,
                );

                setEditing(
                  'name',
                );
              }
            }
            title="Editar nombre"
          >
            {meal.name}
          </button>
        )}
      </div>

      <div
        className={
          styles.controls
        }
      >
        {editing ===
        'time' ? (
          <input
            ref={
              timeInputRef
            }
            className={
              styles.timeInput
            }
            type="time"
            value={
              plannedTime
            }
            onChange={
              (
                event,
              ) => {

                setPlannedTime(
                  event
                    .target
                    .value,
                );

                setError(
                  null,
                );
              }
            }
            onBlur={
              () => {
                if (
                  !saving
                ) {
                  void saveTime();
                }
              }
            }
            onKeyDown={
              handleTimeKeyDown
            }
            disabled={
              saving
            }
            aria-label="Hora de la comida"
          />
        ) : (
          <button
            type="button"
            className={
              styles.timeButton
            }
            onClick={
              () => {

                setMenuOpen(
                  false,
                );

                setEditing(
                  'time',
                );
              }
            }
            title="Editar hora"
          >
            {meal.plannedTime ??
              'Sin hora'}
          </button>
        )}

        <div
          ref={
            menuRef
          }
          className={
            styles.menu
          }
        >
          <button
            type="button"
            className={
              styles.menuButton
            }
            onClick={
              () =>
                setMenuOpen(
                  current =>
                    !current,
                )
            }
            aria-label="Opciones de la comida"
            aria-expanded={
              menuOpen
            }
          >
            <Ellipsis />
          </button>

          {menuOpen && (
            <div
              className={
                styles.menuPopover
              }
            >
              <button
                type="button"
                className={
                  styles.deleteButton
                }
                onClick={
                  () =>
                    void deleteMeal()
                }
                disabled={
                  deleting
                }
              >
                <Trash2 />

                {deleting
                  ? 'Eliminando…'
                  : 'Eliminar comida'}
              </button>
            </div>
          )}
        </div>
      </div>

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
    </>
  );
}
