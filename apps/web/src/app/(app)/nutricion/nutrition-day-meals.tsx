'use client';

import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useDroppable,
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
  Apple,
  Beef,
  Pill,
  Droplets,
  GripVertical,
  Leaf,
  Milk,
  MoreHorizontal,
  Nut,
  Trash2,
  Wheat,
  ArrowRightLeft,
  Ban,
  Check,
  RotateCcw,
} from 'lucide-react';

import {
  useRouter,
} from 'next/navigation';

import {
  type KeyboardEvent,
  useEffect,
  useId,
  useRef,
  useState,
} from 'react';

import type {
  NutritionFoodResponse,
  NutritionMealDetailResponse,
  NutritionMealItemDetailResponse,
  NutritionPersonResponse,
  NutritionMealItemActualResponse,
} from '../../../lib/nutrition-api';

import {
  AddFoodForm,
} from './add-food-form';

import {
  MealHeadingEditor,
} from './meal-heading-editor';

import {
  getFoodVisualProfile,
  type FoodVisualCategory,
} from './food-visual-profile';

import {
  ReplaceFoodModal,
} from './replace-food-modal';

import {
  createPortal,
} from 'react-dom';

import styles from './nutrition-day-meals.module.css';

interface PersonalMealItem
extends NutritionMealItemDetailResponse {
  personalQuantity:
    number;

  actual:
    NutritionMealItemActualResponse | null;
}

export interface PersonalNutritionMeal
extends Omit<
  NutritionMealDetailResponse,
  'items'
> {
  items:
    PersonalMealItem[];

  totalItemCount:
    number;
}

interface NutritionDayMealsProps {
  meals:
    PersonalNutritionMeal[];

  people:
    NutritionPersonResponse[];

  userId:
    string;
}

const unitLabel =
  (
    food:
      Pick<
        NutritionFoodResponse,
        'referenceUnit'
      >,
  ): string => {

    switch (
      food.referenceUnit
    ) {
      case 'G':
        return 'g';

      case 'KG':
        return 'kg';

      case 'ML':
        return 'ml';

      case 'L':
        return 'l';

      case 'UNIT':
        return 'ud';
    }
  };

const formatNumber =
  (
    value:
      number,
  ): string =>
    new Intl.NumberFormat(
      'es-ES',
      {
        maximumFractionDigits:
          3,
      },
    ).format(
      value,
    );

const foodIcon =
  (
    category:
      FoodVisualCategory,
  ) => {

    switch (
      category
    ) {
      case 'carbohydrate':
        return <Wheat />;

      case 'protein':
        return <Beef />;

      case 'fat':
        return <Nut />;

      case 'dairy':
        return <Milk />;

      case 'fruit':
        return <Apple />;

      case 'vegetable':
        return <Leaf />;

      case 'supplement':
        return <Pill />;

      case 'balanced':
        return <Droplets />;
    }
  };

interface SortableFoodRowProps {
  detail:
    PersonalMealItem;

  userId:
    string;
}

function SortableFoodRow({
  detail,
  userId,
}: SortableFoodRowProps) {

  const router =
    useRouter();

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } =
    useSortable({
      id:
        detail.item.id,

      data: {
        type:
          'item',

        mealId:
          detail.item.mealId,
      },
    });

  const [
    editingQuantity,
    setEditingQuantity,
  ] =
    useState(
      false,
    );

  const [
    quantity,
    setQuantity,
  ] =
    useState(
      String(
        detail.personalQuantity,
      ),
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

  const setActual =
    async (
      body:
        | {
            status:
              'EATEN';
          }
        | {
            status:
              'SKIPPED';

            notes:
              string | null;
          },
    ) => {

      if (
        actualSaving
      ) {
        return;
      }

      setActualSaving(
        true,
      );

      setError(
        null,
      );

      try {

        const response =
          await fetch(
            `/api/nutrition/meal-items/${encodeURIComponent(
              detail.item.id,
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
                JSON.stringify(
                  body,
                ),
            },
          );

        if (
          !response.ok
        ) {
          setError(
            'No se ha podido registrar el consumo.',
          );

          return;
        }

        setMenuOpen(
          false,
        );

        router.refresh();

      } catch {

        setError(
          'No se ha podido conectar.',
        );

      } finally {

        setActualSaving(
          false,
        );
      }
    };

  const resetActual =
    async () => {

      if (
        actualSaving
      ) {
        return;
      }

      setActualSaving(
        true,
      );

      setError(
        null,
      );

      try {

        const response =
          await fetch(
            `/api/nutrition/meal-items/${encodeURIComponent(
              detail.item.id,
            )}/actuals/${encodeURIComponent(
              userId,
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
            'No se ha podido restablecer.',
          );

          return;
        }

        setMenuOpen(
          false,
        );

        router.refresh();

      } catch {

        setError(
          'No se ha podido conectar.',
        );

      } finally {

        setActualSaving(
          false,
        );
      }
    };

  const [
    removing,
    setRemoving,
  ] =
    useState(
      false,
    );

  const [
    actualSaving,
    setActualSaving,
  ] =
    useState(
      false,
    );

  const [
    replaceOpen,
    setReplaceOpen,
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

  const skipBlurRef =
    useRef(
      false,
    );

  const menuRef =
    useRef<HTMLDivElement>(
      null,
    );

  const menuButtonRef =
    useRef<HTMLButtonElement>(
      null,
    );

  const menuPopoverRef =
    useRef<HTMLDivElement>(
      null,
    );

  const [
    menuPosition,
    setMenuPosition,
  ] =
    useState<{
      top:
        number;

      left:
        number;
    } | null>(
      null,
    );

  useEffect(
    () => {

      setQuantity(
        String(
          detail.personalQuantity,
        ),
      );

    },
    [
      detail.personalQuantity,
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

          const insideTrigger =
            menuRef.current
              ?.contains(
                target,
              ) ??
            false;

          const insidePopover =
            menuPopoverRef.current
              ?.contains(
                target,
              ) ??
            false;

          if (
            !insideTrigger &&
            !insidePopover
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

  useEffect(
    () => {

      if (
        !menuOpen ||
        !menuButtonRef.current
      ) {
        setMenuPosition(
          null,
        );

        return;
      }

      const updatePosition =
        () => {

          const button =
            menuButtonRef.current;

          if (!button) {
            return;
          }

          const rect =
            button.getBoundingClientRect();

          const menuWidth =
            210;

          const menuHeight =
            menuPopoverRef.current
              ?.getBoundingClientRect()
              .height ??
            230;

          const margin =
            10;

          const gap =
            6;

          const availableBelow =
            window.innerHeight -
            rect.bottom -
            margin;

          const availableAbove =
            rect.top -
            margin;

          const openAbove =
            availableBelow <
              menuHeight &&
            availableAbove >
              availableBelow;

          const unclampedTop =
            openAbove
              ? rect.top -
                menuHeight -
                gap
              : rect.bottom +
                gap;

          const top =
            Math.max(
              margin,
              Math.min(
                unclampedTop,
                window.innerHeight -
                  menuHeight -
                  margin,
              ),
            );

          const left =
            Math.max(
              margin,
              Math.min(
                rect.right -
                  menuWidth,
                window.innerWidth -
                  menuWidth -
                  margin,
              ),
            );

          setMenuPosition({
            top,
            left,
          });
        };

      updatePosition();

      const frame =
        requestAnimationFrame(
          updatePosition,
        );

      window.addEventListener(
        'resize',
        updatePosition,
      );

      window.addEventListener(
        'scroll',
        updatePosition,
        true,
      );

      return () => {

        cancelAnimationFrame(
          frame,
        );

        window.removeEventListener(
          'resize',
          updatePosition,
        );

        window.removeEventListener(
          'scroll',
          updatePosition,
          true,
        );
      };
    },
    [
      menuOpen,
    ],
  );

  const saveQuantity =
    async () => {

      const numericQuantity =
        Number(
          quantity,
        );

      if (
        !Number.isFinite(
          numericQuantity,
        ) ||
        numericQuantity <
          0
      ) {
        setError(
          'Cantidad no válida.',
        );

        return;
      }

      if (
        numericQuantity ===
        detail.personalQuantity
      ) {
        setEditingQuantity(
          false,
        );

        return;
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
            `/api/nutrition/meal-items/${encodeURIComponent(
              detail.item.id,
            )}/quantities/${encodeURIComponent(
              userId,
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
                  quantity:
                    numericQuantity,
                }),
            },
          );

        if (
          !response.ok
        ) {
          setError(
            'No se ha podido guardar.',
          );

          return;
        }

        setEditingQuantity(
          false,
        );

        router.refresh();

      } catch {

        setError(
          'No se ha podido conectar.',
        );

      } finally {

        setSaving(
          false,
        );
      }
    };

  const handleQuantityKeyDown =
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

        void saveQuantity();
      }

      if (
        event.key ===
        'Escape'
      ) {
        event.preventDefault();

        skipBlurRef.current =
          true;

        setQuantity(
          String(
            detail.personalQuantity,
          ),
        );

        setEditingQuantity(
          false,
        );

        event.currentTarget
          .blur();
      }
    };

  const remove =
    async () => {

      setMenuOpen(
        false,
      );

      const confirmed =
        window.confirm(
          `¿Quitar “${detail.food.name}” de esta comida?`,
        );

      if (!confirmed) {
        return;
      }

      setRemoving(
        true,
      );

      setError(
        null,
      );

      try {

        const response =
          await fetch(
            `/api/nutrition/meal-items/${encodeURIComponent(
              detail.item.id,
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
            'No se ha podido quitar el alimento.',
          );

          return;
        }

        setMenuOpen(
          false,
        );

        router.refresh();

      } catch {

        setError(
          'No se ha podido conectar.',
        );

      } finally {

        setRemoving(
          false,
        );
      }
    };

  const visualProfile =
    getFoodVisualProfile(
      detail.food,
    );

  const actualStatus =
    detail.actual?.status ??
    'PENDING';

  const actualStatusLabel =
    actualStatus ===
      'EATEN'
      ? 'Comido'
      : actualStatus ===
          'SKIPPED'
        ? 'Omitido'
        : actualStatus ===
            'REPLACED'
          ? 'Sustituido'
          : 'Pendiente';

  const replacementSnapshot =
    actualStatus ===
      'REPLACED'
      ? detail.actual
          ?.actualFoodSnapshot ??
        null
      : null;

  const replacementQuantity =
    actualStatus ===
      'REPLACED'
      ? detail.actual
          ?.actualQuantity ??
        null
      : null;

  const replacementLabel =
    replacementSnapshot &&
    replacementQuantity !==
      null
      ? `${replacementSnapshot.name} · ${formatNumber(
          replacementQuantity,
        )} ${unitLabel(
          replacementSnapshot,
        )}`
      : null;

  return (
    <>
    <div
      ref={
        setNodeRef
      }
      className={[
        styles.foodRow,
        styles[
          `foodRow_${actualStatus}`
        ],
        isDragging
          ? styles.dragging
          : '',
      ]
        .filter(
          Boolean,
        )
        .join(
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
      <button
        type="button"
        className={
          styles.dragHandle
        }
        aria-label={`Mover ${detail.food.name}`}
        {...attributes}
        {...listeners}
      >
        <GripVertical />
      </button>

      <div
        className={
          styles.foodIdentity
        }
      >
        <div
          className={[
            styles.foodIcon,
            styles[
              `foodIcon_${visualProfile.category}`
            ],
          ].join(
            ' ',
          )}
          aria-hidden="true"
        >
          {foodIcon(
            visualProfile.category,
          )}
        </div>

        <div
          className={
            styles.foodText
          }
        >
          <span
            className={
              styles.foodName
            }
          >
            {
              detail.food.name
            }
          </span>

          <span
            className={
              styles.foodMeta
            }
          >
            {
              detail.food.brand
                ? `${detail.food.brand} · `
                : ''
            }

            {
              visualProfile.label
            }
          </span>

          {replacementLabel && (
            <span
              className={
                styles.actualReplacement
              }
            >
              <ArrowRightLeft
                aria-hidden="true"
              />

              <span>
                Real:
              </span>

              <strong>
                {replacementLabel}
              </strong>
            </span>
          )}
        </div>
      </div>

      <div
        className={
          styles.rowControls
        }
      >
                {actualStatus ===
        'PENDING' ? (
          <button
            type="button"
            className={
              styles.quickEatenButton
            }
            onClick={
              () =>
                void setActual({
                  status:
                    'EATEN',
                })
            }
            disabled={
              actualSaving
            }
            title="Marcar como comido"
            aria-label={`Marcar ${detail.food.name} como comido`}
          >
            <Check />
          </button>
        ) : (
          <span
            className={[
              styles.statusBadge,

              styles[
                `statusBadge_${actualStatus}`
              ],
            ].join(
              ' ',
            )}
            title={
              actualStatusLabel
            }
          >
          {actualStatus ===
              'EATEN' && (
                <Check />
              )}

            {actualStatus ===
              'SKIPPED' && (
                <Ban />
              )}

            {actualStatus ===
              'REPLACED' && (
                <ArrowRightLeft />
              )}

            <span>
              {actualStatusLabel}
            </span>
          </span>
        )}
        {editingQuantity ? (
          <div
            className={
              styles.quantityEditor
            }
          >
            <input
              autoFocus
              type="number"
              min="0"
              step="0.001"
              value={
                quantity
              }
              disabled={
                saving
              }
              onChange={
                event => {

                  setQuantity(
                    event
                      .target
                      .value,
                  );

                  setError(
                    null,
                  );
                }
              }
              onKeyDown={
                handleQuantityKeyDown
              }
              onBlur={
                () => {

                  if (
                    skipBlurRef
                      .current
                  ) {
                    skipBlurRef.current =
                      false;

                    return;
                  }

                  if (
                    !saving
                  ) {
                    void saveQuantity();
                  }
                }
              }
              aria-label={`Cantidad de ${detail.food.name}`}
            />

            <span>
              {unitLabel(
                detail.food,
              )}
            </span>
          </div>
        ) : (
          <button
            type="button"
            className={
              styles.quantityButton
            }
            onClick={
              () => {

                setMenuOpen(
                  false,
                );

                setEditingQuantity(
                  true,
                );
              }
            }
            title="Editar cantidad"
          >
            {formatNumber(
              detail.personalQuantity,
            )}{' '}
            {unitLabel(
              detail.food,
            )}
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
            ref={
              menuButtonRef
            }
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
            aria-label={`Opciones de ${detail.food.name}`}
            aria-expanded={
              menuOpen
            }
          >
            <MoreHorizontal />
          </button>

                    {menuOpen &&
            menuPosition &&
            createPortal(
              <div
                ref={
                  menuPopoverRef
                }
                className={
                  styles.menuPopover
                }
                style={{
                  top:
                    menuPosition.top,

                  left:
                    menuPosition.left,
                }}
              >
                {actualStatus !==
                  'EATEN' && (
                  <button
                    type="button"
                    className={
                      styles.actionButton
                    }
                    onClick={
                      () =>
                        void setActual({
                          status:
                            'EATEN',
                        })
                    }
                    disabled={
                      actualSaving
                    }
                  >
                    <Check />

                    Marcar como comido
                  </button>
                )}

                {actualStatus !==
                  'SKIPPED' && (
                  <button
                    type="button"
                    className={
                      styles.actionButton
                    }
                    onClick={
                      () =>
                        void setActual({
                          status:
                            'SKIPPED',

                          notes:
                            null,
                        })
                    }
                    disabled={
                      actualSaving
                    }
                  >
                    <Ban />

                    Marcar como no comido
                  </button>
                )}

                <button
                  type="button"
                  className={
                    styles.actionButton
                  }
                  onClick={
                    () => {

                      setMenuOpen(
                        false,
                      );

                      setReplaceOpen(
                        true,
                      );
                    }
                  }
                  disabled={
                    actualSaving
                  }
                >
                  <ArrowRightLeft />

                  Sustituir alimento
                </button>

                {detail.actual && (
                  <button
                    type="button"
                    className={
                      styles.actionButton
                    }
                    onClick={
                      () =>
                        void resetActual()
                    }
                    disabled={
                      actualSaving
                    }
                  >
                    <RotateCcw />

                    Restablecer
                  </button>
                )}

                <div
                  className={
                    styles.menuSeparator
                  }
                />

                <button
                  type="button"
                  className={
                    styles.deleteButton
                  }
                  onClick={
                    () =>
                      void remove()
                  }
                  disabled={
                    removing
                  }
                >
                  <Trash2 />

                  {removing
                    ? 'Quitando…'
                    : 'Quitar de esta comida'}
                </button>
              </div>,
              document.body,
            )}
        </div>
      </div>

      {error && (
        <span
          className={
            styles.rowError
          }
          role="alert"
        >
          {error}
        </span>
      )}
    </div>

      <ReplaceFoodModal
        mealItemId={
          detail.item.id
        }
        userId={
          userId
        }
        plannedFoodName={
          detail.food.name
        }
        open={
          replaceOpen
        }
        onClose={
          () =>
            setReplaceOpen(
              false,
            )
        }
        onSaved={
          () =>
            router.refresh()
        }
      />
    </>
  );
}

interface MealDropZoneProps {
  meal:
    PersonalNutritionMeal;

  userId:
    string;
}

function MealDropZone({
  meal,
  userId,
}: MealDropZoneProps) {

  const {
    setNodeRef,
    isOver,
  } =
    useDroppable({
      id:
        `meal:${meal.meal.id}`,

      data: {
        type:
          'meal',

        mealId:
          meal.meal.id,
      },
    });

  return (
    <div
      ref={
        setNodeRef
      }
      className={[
        'nutrition-day-meal-foods',
        styles.dropZone,
        isOver
          ? styles.dropZoneOver
          : '',
      ]
        .filter(
          Boolean,
        )
        .join(
          ' ',
        )}
    >
      <SortableContext
        items={
          meal.items.map(
            detail =>
              detail.item.id,
          )
        }
        strategy={
          verticalListSortingStrategy
        }
      >
        {meal.items.length >
        0 ? (
          meal.items.map(
            detail => (
              <SortableFoodRow
                key={
                  detail.item.id
                }
                detail={
                  detail
                }
                userId={
                  userId
                }
              />
            ),
          )
        ) : (
          <div className="nutrition-day-meal-empty">
            <span>
              Arrastra aquí un alimento o añade uno.
            </span>
          </div>
        )}
      </SortableContext>
    </div>
  );
}

export function NutritionDayMeals({
  meals,
  people,
  userId,
}: NutritionDayMealsProps) {

  const router =
    useRouter();

  const [
    orderedMeals,
    setOrderedMeals,
  ] =
    useState(
      meals,
    );

  const [
    moving,
    setMoving,
  ] =
    useState(
      false,
    );

  const [
    moveError,
    setMoveError,
  ] =
    useState<
      string | null
    >(
      null,
    );

  useEffect(
    () => {

      setOrderedMeals(
        meals,
      );

    },
    [
      meals,
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

  const handleDragEnd =
    async (
      event:
        DragEndEvent,
    ) => {

      const {
        active,
        over,
      } =
        event;

      if (
        !over ||
        moving
      ) {
        return;
      }

      const activeId =
        String(
          active.id,
        );

      const sourceMeal =
        orderedMeals.find(
          meal =>
            meal.items.some(
              detail =>
                detail.item.id ===
                activeId,
            ),
        );

      if (!sourceMeal) {
        return;
      }

      const activeDetail =
        sourceMeal.items.find(
          detail =>
            detail.item.id ===
            activeId,
        );

      if (!activeDetail) {
        return;
      }

      const targetMealId =
        typeof over
          .data
          .current
          ?.mealId ===
        'string'
          ? over.data.current
              .mealId
          : null;

      if (!targetMealId) {
        return;
      }

      const targetMeal =
        orderedMeals.find(
          meal =>
            meal.meal.id ===
            targetMealId,
        );

      if (!targetMeal) {
        return;
      }

      const overType =
        over.data.current
          ?.type;

      const targetDetail =
        overType ===
        'item'
          ? targetMeal.items.find(
              detail =>
                detail.item.id ===
                String(
                  over.id,
                ),
            )
          : undefined;

      if (
        sourceMeal.meal.id ===
          targetMeal.meal.id &&
        targetDetail?.item.id ===
          activeId
      ) {
        return;
      }

      const targetPosition =
        targetDetail
          ? targetDetail
              .item
              .position
          : targetMeal
              .totalItemCount;

      const previous =
        orderedMeals;

      const next =
        orderedMeals.map(
          meal => ({
            ...meal,

            items: [
              ...meal.items,
            ],
          }),
        );

      if (
        sourceMeal.meal.id ===
        targetMeal.meal.id
      ) {

        const mealIndex =
          next.findIndex(
            meal =>
              meal.meal.id ===
              sourceMeal
                .meal
                .id,
          );

        if (
          mealIndex ===
          -1
        ) {
          return;
        }

        const currentItems =
          next[
            mealIndex
          ]!.items;

        const oldIndex =
          currentItems
            .findIndex(
              detail =>
                detail
                  .item
                  .id ===
                activeId,
            );

        const newIndex =
          targetDetail
            ? currentItems
                .findIndex(
                  detail =>
                    detail
                      .item
                      .id ===
                    targetDetail
                      .item
                      .id,
                )
            : currentItems
                .length -
              1;

        if (
          oldIndex ===
            -1 ||
          newIndex ===
            -1
        ) {
          return;
        }

        next[
          mealIndex
        ] = {
          ...next[
            mealIndex
          ]!,

          items:
            arrayMove(
              currentItems,
              oldIndex,
              newIndex,
            ),
        };

      } else {

        const sourceIndex =
          next.findIndex(
            meal =>
              meal.meal.id ===
              sourceMeal
                .meal
                .id,
          );

        const targetIndex =
          next.findIndex(
            meal =>
              meal.meal.id ===
              targetMeal
                .meal
                .id,
          );

        if (
          sourceIndex ===
            -1 ||
          targetIndex ===
            -1
        ) {
          return;
        }

        next[
          sourceIndex
        ] = {
          ...next[
            sourceIndex
          ]!,

          totalItemCount:
            Math.max(
              0,
              next[
                sourceIndex
              ]!
                .totalItemCount -
                1,
            ),

          items:
            next[
              sourceIndex
            ]!
              .items
              .filter(
                detail =>
                  detail
                    .item
                    .id !==
                  activeId,
              ),
        };

        const destination =
          [
            ...next[
              targetIndex
            ]!.items,
          ];

        const visibleTargetIndex =
          targetDetail
            ? destination
                .findIndex(
                  detail =>
                    detail
                      .item
                      .id ===
                    targetDetail
                      .item
                      .id,
                )
            : destination.length;

        destination.splice(
          visibleTargetIndex <
            0
            ? destination.length
            : visibleTargetIndex,
          0,
          {
            ...activeDetail,

            item: {
              ...activeDetail.item,

              mealId:
                targetMealId,
            },
          },
        );

        next[
          targetIndex
        ] = {
          ...next[
            targetIndex
          ]!,

          totalItemCount:
            next[
              targetIndex
            ]!
              .totalItemCount +
            1,

          items:
            destination,
        };
      }

      setOrderedMeals(
        next,
      );

      setMoving(
        true,
      );

      setMoveError(
        null,
      );

      try {

        const response =
          await fetch(
            `/api/nutrition/meal-items/${encodeURIComponent(
              activeId,
            )}/move`,
            {
              method:
                'POST',

              headers: {
                'content-type':
                  'application/json',
              },

              body:
                JSON.stringify({
                  targetMealId,

                  targetPosition,
                }),
            },
          );

        if (
          !response.ok
        ) {
          setOrderedMeals(
            previous,
          );

          setMoveError(
            'No se ha podido mover el alimento.',
          );

          return;
        }

        router.refresh();

      } catch {

        setOrderedMeals(
          previous,
        );

        setMoveError(
          'No se ha podido conectar con Nutrición.',
        );

      } finally {

        setMoving(
          false,
        );
      }
    };

  const dndContextId =
    useId();

  return (
    <>
      <DndContext
        id={
          dndContextId
        }
        sensors={
          sensors
        }
        collisionDetection={
          closestCenter
        }
        onDragEnd={
          handleDragEnd
        }
      >
        <div className="nutrition-day-meals">
          {orderedMeals.map(
            mealDetail => (
              <article
                key={
                  mealDetail
                    .meal
                    .id
                }
                className="nutrition-day-meal-card"
              >
                <header>
                  <MealHeadingEditor
                    meal={
                      mealDetail
                        .meal
                    }
                  />
                </header>

                <MealDropZone
                  meal={
                    mealDetail
                  }
                  userId={
                    userId
                  }
                />

                <div className="nutrition-day-meal-actions">
                  <AddFoodForm
                    mealId={
                      mealDetail
                        .meal
                        .id
                    }
                    position={
                      mealDetail
                        .totalItemCount
                    }
                    people={
                      people
                    }
                  />
                </div>
              </article>
            ),
          )}
        </div>
      </DndContext>

      {moveError && (
        <div
          className={
            styles.boardError
          }
          role="alert"
        >
          {moveError}
        </div>
      )}
    </>
  );
}
