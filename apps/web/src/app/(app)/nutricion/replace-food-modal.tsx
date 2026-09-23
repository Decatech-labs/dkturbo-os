'use client';

import {
  ArrowRightLeft,
  Search,
  X,
} from 'lucide-react';

import {
  type FormEvent,
  useEffect,
  useState,
} from 'react';

import type {
  NutritionFoodResponse,
} from '../../../lib/nutrition-api';

import styles from './replace-food-modal.module.css';

interface ReplaceFoodModalProps {
  mealItemId:
    string;

  userId:
    string;

  plannedFoodName:
    string;

  open:
    boolean;

  onClose:
    () => void;

  onSaved:
    () => void;
}

export function ReplaceFoodModal({
  mealItemId,
  userId,
  plannedFoodName,
  open,
  onClose,
  onSaved,
}: ReplaceFoodModalProps) {

  const [
    query,
    setQuery,
  ] =
    useState(
      '',
    );

  const [
    foods,
    setFoods,
  ] =
    useState<
      NutritionFoodResponse[]
    >(
      [],
    );

  const [
    selectedFood,
    setSelectedFood,
  ] =
    useState<
      NutritionFoodResponse | null
    >(
      null,
    );

  const [
    quantity,
    setQuantity,
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
    loading,
    setLoading,
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
      string | null
    >(
      null,
    );

  useEffect(
    () => {

      if (!open) {
        return;
      }

      let cancelled =
        false;

      const timer =
        window.setTimeout(
          async () => {

            setLoading(
              true,
            );

            try {

              const response =
                await fetch(
                  `/api/nutrition/foods?query=${encodeURIComponent(
                    query,
                  )}`,
                  {
                    cache:
                      'no-store',
                  },
                );

              const body =
                await response
                  .json()
                  .catch(
                    () =>
                      [],
                  ) as
                    NutritionFoodResponse[];

              if (!cancelled) {
                setFoods(
                  response.ok
                    ? body
                    : [],
                );
              }

            } catch {

              if (!cancelled) {
                setFoods(
                  [],
                );

                setError(
                  'No se ha podido cargar el catálogo.',
                );
              }

            } finally {

              if (!cancelled) {
                setLoading(
                  false,
                );
              }
            }
          },
          180,
        );

      return () => {

        cancelled =
          true;

        window.clearTimeout(
          timer,
        );
      };
    },
    [
      open,
      query,
    ],
  );

  useEffect(
    () => {

      if (open) {
        return;
      }

      setQuery(
        '',
      );

      setFoods(
        [],
      );

      setSelectedFood(
        null,
      );

      setQuantity(
        '',
      );

      setNotes(
        '',
      );

      setError(
        null,
      );
    },
    [
      open,
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
            globalThis.KeyboardEvent,
        ) => {

          if (
            event.key ===
              'Escape' &&
            !submitting
          ) {
            onClose();
          }
        };

      document.addEventListener(
        'keydown',
        handleKeyDown,
      );

      return () => {

        document.removeEventListener(
          'keydown',
          handleKeyDown,
        );
      };
    },
    [
      open,
      submitting,
      onClose,
    ],
  );

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
        !selectedFood
      ) {
        setError(
          'Selecciona el alimento que has tomado.',
        );

        return;
      }

      const numericQuantity =
        Number(
          quantity,
        );

      if (
        !Number.isFinite(
          numericQuantity,
        ) ||
        numericQuantity <=
          0
      ) {
        setError(
          'Indica una cantidad válida.',
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
            `/api/nutrition/meal-items/${encodeURIComponent(
              mealItemId,
            )}/actuals/${encodeURIComponent(
              userId,
            )}`,
            {
              method:
                'PUT',

              headers: {
                'content-type':
                  'application/json',
              },

              body:
                JSON.stringify({
                  status:
                    'REPLACED',

                  actualFoodId:
                    selectedFood.id,

                  actualQuantity:
                    numericQuantity,

                  notes:
                    notes.trim() ||
                    null,
                }),
            },
          );

        if (
          !response.ok
        ) {
          setError(
            'No se ha podido guardar la sustitución.',
          );

          return;
        }

        onSaved();
        onClose();

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

  if (!open) {
    return null;
  }

  return (
    <div
      className={
        styles.backdrop
      }
      role="presentation"
      onMouseDown={
        event => {

          if (
            event.target ===
              event.currentTarget &&
            !submitting
          ) {
            onClose();
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
        aria-labelledby="nutrition-replace-food-title"
      >
        <header
          className={
            styles.header
          }
        >
          <div
            className={
              styles.headerIcon
            }
          >
            <ArrowRightLeft />
          </div>

          <div
            className={
              styles.headerText
            }
          >
            <h2
              id="nutrition-replace-food-title"
            >
              Sustituir alimento
            </h2>

            <p>
              En lugar de {plannedFoodName}
            </p>
          </div>

          <button
            type="button"
            className={
              styles.closeButton
            }
            onClick={
              onClose
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
              styles.search
            }
          >
            <Search />

            <input
              type="search"
              value={
                query
              }
              onChange={
                event => {

                  setQuery(
                    event.target.value,
                  );

                  setSelectedFood(
                    null,
                  );

                  setError(
                    null,
                  );
                }
              }
              placeholder="Buscar alimento"
              autoFocus
            />
          </label>

          <div
            className={
              styles.foodList
            }
          >
            {loading ? (
              <span
                className={
                  styles.empty
                }
              >
                Buscando…
              </span>
            ) : foods.length >
              0 ? (
                foods.map(
                  food => (
                    <button
                      key={
                        food.id
                      }
                      type="button"
                      className={[
                        styles.foodOption,

                        selectedFood?.id ===
                          food.id
                          ? styles.foodOptionSelected
                          : '',
                      ]
                        .filter(
                          Boolean,
                        )
                        .join(
                          ' ',
                        )}
                      onClick={
                        () => {

                          setSelectedFood(
                            food,
                          );

                          setError(
                            null,
                          );
                        }
                      }
                    >
                      <strong>
                        {food.name}
                      </strong>

                      <span>
                        {food.brand ??
                          'Sin marca'}
                      </span>
                    </button>
                  ),
                )
              ) : (
                <span
                  className={
                    styles.empty
                  }
                >
                  No hay resultados.
                </span>
              )}
          </div>

          {selectedFood && (
            <div
              className={
                styles.selected
              }
            >
              <div>
                <span>
                  Has tomado
                </span>

                <strong>
                  {selectedFood.name}
                </strong>
              </div>

              <label
                className={
                  styles.quantityField
                }
              >
                <span>
                  Cantidad
                </span>

                <div>
                  <input
                    type="number"
                    min="0.001"
                    step="0.001"
                    value={
                      quantity
                    }
                    onChange={
                      event => {

                        setQuantity(
                          event.target.value,
                        );

                        setError(
                          null,
                        );
                      }
                    }
                    required
                  />

                  <span>
                    {selectedFood.referenceUnit ===
                      'G'
                      ? 'g'
                      : selectedFood.referenceUnit ===
                          'KG'
                        ? 'kg'
                        : selectedFood.referenceUnit ===
                            'ML'
                          ? 'ml'
                          : selectedFood.referenceUnit ===
                              'L'
                            ? 'l'
                            : 'ud'}
                  </span>
                </div>
              </label>
            </div>
          )}

          <label
            className={
              styles.notes
            }
          >
            <span>
              Nota opcional
            </span>

            <textarea
              value={
                notes
              }
              onChange={
                event =>
                  setNotes(
                    event.target.value,
                  )
              }
              placeholder="Ej. no quedaba el alimento planificado"
              rows={
                2
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
              styles.footer
            }
          >
            <button
              type="button"
              className={
                styles.secondaryButton
              }
              onClick={
                onClose
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
                styles.primaryButton
              }
              disabled={
                submitting ||
                !selectedFood
              }
            >
              {submitting
                ? 'Guardando…'
                : 'Guardar sustitución'}
            </button>
          </footer>
        </form>
      </section>
    </div>
  );
}
