'use client';

import {
  Apple,
  Ellipsis,
  Pencil,
  Plus,
  Search,
  Trash2,
  X,
} from 'lucide-react';

import {
  useRouter,
} from 'next/navigation';

import {
  type FormEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import type {
  NutritionFoodPreparationConversionResponse,
  NutritionFoodResponse,
  NutritionPersonResponse,
} from '../../../lib/nutrition-api';

import {
  getFoodCategoryLabel,
  inferFoodCategory,
  nutritionFoodCategories,
  type NutritionFoodCategory,
} from './food-categories';

import styles from './add-food-form.module.css';

interface AddFoodFormProps {
  mealId:
    string;

  position:
    number;

  people:
    NutritionPersonResponse[];
}

interface AddFoodResponse {
  error?:
    string;
}

type CreateFoodResponse =
  NutritionFoodResponse;

type NutritionUnit =
  | 'G'
  | 'KG'
  | 'ML'
  | 'L'
  | 'UNIT';

export function AddFoodForm({
  mealId,
  position,
  people,
}: AddFoodFormProps) {

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
    query,
    setQuery,
  ] =
    useState(
      '',
    );

  const [
    categoryFilter,
    setCategoryFilter,
  ] =
    useState<
      NutritionFoodCategory | null
    >(
      null,
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
    editingFood,
    setEditingFood,
  ] =
    useState<
      NutritionFoodResponse | null
    >(
      null,
    );

  const [
    catalogMenuFoodId,
    setCatalogMenuFoodId,
  ] =
    useState<
      string | null
    >(
      null,
    );

  const [
    catalogRevision,
    setCatalogRevision,
  ] =
    useState(
      0,
    );

  const catalogMenuRef =
    useRef<HTMLDivElement>(
      null,
    );

  const [
    quantities,
    setQuantities,
  ] =
    useState<
      Record<
        string,
        string
      >
    >(
      {},
    );

  const [
    creatingFood,
    setCreatingFood,
  ] =
    useState(
      false,
    );

  const [
    foodName,
    setFoodName,
  ] =
    useState(
      '',
    );

  const [
    brand,
    setBrand,
  ] =
    useState(
      '',
    );

  const [
    category,
    setCategory,
  ] =
    useState<
      NutritionFoodCategory
    >(
      'OTHER',
    );

  const [
    categoryManuallyChanged,
    setCategoryManuallyChanged,
  ] =
    useState(
      false,
    );

  const [
    referenceAmount,
    setReferenceAmount,
  ] =
    useState(
      '100',
    );

  const [
    referenceUnit,
    setReferenceUnit,
  ] =
    useState<
      NutritionUnit
    >(
      'G',
    );

  const [
    caloriesKcal,
    setCaloriesKcal,
  ] =
    useState(
      '',
    );

  const [
    proteinG,
    setProteinG,
  ] =
    useState(
      '',
    );

  const [
    carbohydratesG,
    setCarbohydratesG,
  ] =
    useState(
      '',
    );

  const [
    fatG,
    setFatG,
  ] =
    useState(
      '',
    );

  const [
    fiberG,
    setFiberG,
  ] =
    useState(
      '',
    );

  const [
    preparationConversions,
    setPreparationConversions,
  ] =
    useState<
      NutritionFoodPreparationConversionResponse[]
    >(
      [],
    );

  const [
    preparationName,
    setPreparationName,
  ] =
    useState(
      'Cocido',
    );

  const [
    preparationRawAmount,
    setPreparationRawAmount,
  ] =
    useState(
      '100',
    );

  const [
    preparationPreparedAmount,
    setPreparationPreparedAmount,
  ] =
    useState(
      '',
    );

  const [
    preparationUnit,
    setPreparationUnit,
  ] =
    useState<
      NutritionUnit
    >(
      'G',
    );

  const [
    preparationIsDefault,
    setPreparationIsDefault,
  ] =
    useState(
      true,
    );

  const [
    editingPreparationId,
    setEditingPreparationId,
  ] =
    useState<
      string | null
    >(
      null,
    );

  const [
    loadingPreparations,
    setLoadingPreparations,
  ] =
    useState(
      false,
    );

  const [
    savingPreparation,
    setSavingPreparation,
  ] =
    useState(
      false,
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

  const getUnitLabel =
    (
      unit:
        NutritionUnit,
    ): string => {

      if (
        unit ===
        'G'
      ) {
        return 'g';
      }

      if (
        unit ===
        'KG'
      ) {
        return 'kg';
      }

      if (
        unit ===
        'ML'
      ) {
        return 'ml';
      }

      if (
        unit ===
        'L'
      ) {
        return 'l';
      }

      return 'ud';
    };

  const formatPreparationRatio =
    (
      rawAmount:
        number,

      preparedAmount:
        number,
    ): string => {

      if (
        !Number.isFinite(
          rawAmount,
        ) ||
        rawAmount <=
          0 ||
        !Number.isFinite(
          preparedAmount,
        ) ||
        preparedAmount <=
          0
      ) {
        return '—';
      }

      return (
        preparedAmount /
        rawAmount
      ).toLocaleString(
        'es-ES',
        {
          maximumFractionDigits:
            2,
        },
      );
    };

  const unitLabel =
    useMemo(
      () => {

        if (!selectedFood) {
          return '';
        }

        return selectedFood.referenceUnit ===
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
                : 'ud';
      },
      [
        selectedFood,
      ],
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
                  )}${
                    categoryFilter
                      ? `&category=${encodeURIComponent(
                          categoryFilter,
                        )}`
                      : ''
                  }`,
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

              if (
                !cancelled
              ) {
                setFoods(
                  response.ok
                    ? body
                    : [],
                );
              }

            } finally {

              if (
                !cancelled
              ) {
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
      categoryFilter,
      catalogRevision,
    ],
  );

  useEffect(
    () => {

      if (
        !creatingFood ||
        categoryManuallyChanged
      ) {
        return;
      }

      setCategory(
        inferFoodCategory(
          foodName,
          brand,
        ),
      );

    },
    [
      creatingFood,
      foodName,
      brand,
      categoryManuallyChanged,
    ],
  );

  useEffect(
    () => {

      if (
        catalogMenuFoodId ===
        null
      ) {
        return;
      }

      const handlePointerDown =
        (
          event:
            PointerEvent,
        ) => {

          if (
            catalogMenuRef.current &&
            !catalogMenuRef.current.contains(
              event.target as Node,
            )
          ) {
            setCatalogMenuFoodId(
              null,
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
            setCatalogMenuFoodId(
              null,
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
      catalogMenuFoodId,
    ],
  );

  useEffect(
    () => {

      if (
        !editingFood
      ) {
        setPreparationConversions(
          [],
        );

        return;
      }

      let cancelled =
        false;

      const load =
        async () => {

          setLoadingPreparations(
            true,
          );

          try {

            const response =
              await fetch(
                `/api/nutrition/foods/${encodeURIComponent(
                  editingFood.id,
                )}/preparation-conversions`,
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
                  NutritionFoodPreparationConversionResponse[];

            if (
              !cancelled
            ) {
              setPreparationConversions(
                response.ok
                  ? body
                  : [],
              );
            }

          } finally {

            if (
              !cancelled
            ) {
              setLoadingPreparations(
                false,
              );
            }
          }
        };

      void load();

      return () => {
        cancelled =
          true;
      };

    },
    [
      editingFood,
    ],
  );

  const reset =
    () => {

      setQuery(
        '',
      );

      setFoods(
        [],
      );

      setSelectedFood(
        null,
      );

      setQuantities(
        {},
      );

      setCreatingFood(
        false,
      );

      setFoodName(
        '',
      );

      setBrand(
        '',
      );

      setReferenceAmount(
        '100',
      );

      setReferenceUnit(
        'G',
      );

      setCaloriesKcal(
        '',
      );

      setProteinG(
        '',
      );

      setCarbohydratesG(
        '',
      );

      setFatG(
        '',
      );

      setFiberG(
        '',
      );

      setPreparationConversions(
        [],
      );

      setPreparationName(
        'Cocido',
      );

      setPreparationRawAmount(
        '100',
      );

      setPreparationPreparedAmount(
        '',
      );

      setPreparationUnit(
        'G',
      );

      setPreparationIsDefault(
        true,
      );

      setEditingPreparationId(
        null,
      );

      setLoadingPreparations(
        false,
      );

      setSavingPreparation(
        false,
      );

      setCategoryFilter(
        null,
      );

      setCategory(
        'OTHER',
      );

      setCategoryManuallyChanged(
        false,
      );

      setEditingFood(
        null,
      );

      setCatalogMenuFoodId(
        null,
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

  const beginEditingFood =
    (
      food:
        NutritionFoodResponse,
    ) => {

      setCatalogMenuFoodId(
        null,
      );

      setSelectedFood(
        null,
      );

      setCreatingFood(
        false,
      );

      setEditingFood(
        food,
      );

      setPreparationConversions(
        [],
      );

      setPreparationName(
        'Cocido',
      );

      setPreparationRawAmount(
        '100',
      );

      setPreparationPreparedAmount(
        '',
      );

      setPreparationUnit(
        food.referenceUnit,
      );

      setPreparationIsDefault(
        true,
      );

      setEditingPreparationId(
        null,
      );

      setFoodName(
        food.name,
      );

      setBrand(
        food.brand ??
        '',
      );

      setCategory(
        food.category,
      );

      setCategoryManuallyChanged(
        true,
      );

      setReferenceAmount(
        String(
          food.referenceAmount,
        ),
      );

      setReferenceUnit(
        food.referenceUnit,
      );

      setCaloriesKcal(
        String(
          food.caloriesKcal,
        ),
      );

      setProteinG(
        String(
          food.proteinG,
        ),
      );

      setCarbohydratesG(
        String(
          food.carbohydratesG,
        ),
      );

      setFatG(
        String(
          food.fatG,
        ),
      );

      setFiberG(
        food.fiberG ===
          null
          ? ''
          : String(
              food.fiberG,
            ),
      );

      setError(
        null,
      );
    };

  const createFood =
    async (): Promise<
      NutritionFoodResponse | null
    > => {

      const response =
        await fetch(
          '/api/nutrition/foods',
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
                  foodName.trim(),

                brand:
                  brand.trim() ||
                  null,

                category,

                referenceAmount:
                  Number(
                    referenceAmount,
                  ),

                referenceUnit,

                caloriesKcal:
                  Number(
                    caloriesKcal,
                  ),

                proteinG:
                  Number(
                    proteinG,
                  ),

                carbohydratesG:
                  Number(
                    carbohydratesG,
                  ),

                fatG:
                  Number(
                    fatG,
                  ),

                fiberG:
                  fiberG.trim()
                    ? Number(
                        fiberG,
                      )
                    : null,
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
            CreateFoodResponse |
            null;

      if (
        !response.ok ||
        !body?.id
      ) {
        setError(
          'No se ha podido crear el alimento.',
        );

        return null;
      }

      return body;
    };

  const updateExistingFood =
    async (): Promise<boolean> => {

      if (
        !editingFood
      ) {
        return false;
      }

      const response =
        await fetch(
          `/api/nutrition/foods/${encodeURIComponent(
            editingFood.id,
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
                name:
                  foodName.trim(),

                brand:
                  brand.trim() ||
                  null,

                category,

                referenceAmount:
                  Number(
                    referenceAmount,
                  ),

                referenceUnit,

                caloriesKcal:
                  Number(
                    caloriesKcal,
                  ),

                proteinG:
                  Number(
                    proteinG,
                  ),

                carbohydratesG:
                  Number(
                    carbohydratesG,
                  ),

                fatG:
                  Number(
                    fatG,
                  ),

                fiberG:
                  fiberG.trim()
                    ? Number(
                        fiberG,
                      )
                    : null,
              }),
          },
        );

      if (
        !response.ok
      ) {
        setError(
          'No se ha podido guardar el alimento.',
        );

        return false;
      }

      setEditingFood(
        null,
      );

      setFoodName(
        '',
      );

      setBrand(
        '',
      );

      setCategory(
        'OTHER',
      );

      setCategoryManuallyChanged(
        false,
      );

      setReferenceAmount(
        '100',
      );

      setReferenceUnit(
        'G',
      );

      setCaloriesKcal(
        '',
      );

      setProteinG(
        '',
      );

      setCarbohydratesG(
        '',
      );

      setFatG(
        '',
      );

      setFiberG(
        '',
      );

      setCatalogRevision(
        current =>
          current + 1,
      );

      router.refresh();

      return true;
    };

  const resetPreparationEditor =
    () => {

      setPreparationName(
        'Cocido',
      );

      setPreparationRawAmount(
        '100',
      );

      setPreparationPreparedAmount(
        '',
      );

      setPreparationUnit(
        editingFood?.referenceUnit ??
        referenceUnit,
      );

      setPreparationIsDefault(
        preparationConversions.length ===
          0,
      );

      setEditingPreparationId(
        null,
      );
    };

  const beginEditingPreparation =
    (
      conversion:
        NutritionFoodPreparationConversionResponse,
    ) => {

      setPreparationName(
        conversion.name,
      );

      setPreparationRawAmount(
        String(
          conversion.rawAmount,
        ),
      );

      setPreparationPreparedAmount(
        String(
          conversion.preparedAmount,
        ),
      );

      setPreparationUnit(
        conversion.preparedUnit,
      );

      setPreparationIsDefault(
        conversion.isDefault,
      );

      setEditingPreparationId(
        conversion.id,
      );
    };

  const savePreparation =
    async () => {

      if (
        !editingFood ||
        savingPreparation
      ) {
        return;
      }

      const rawAmount =
        Number(
          preparationRawAmount,
        );

      const preparedAmount =
        Number(
          preparationPreparedAmount,
        );

      if (
        !preparationName.trim() ||
        !Number.isFinite(
          rawAmount,
        ) ||
        rawAmount <=
          0 ||
        !Number.isFinite(
          preparedAmount,
        ) ||
        preparedAmount <=
          0
      ) {
        setError(
          'Revisa la equivalencia de preparación.',
        );

        return;
      }

      setSavingPreparation(
        true,
      );

      setError(
        null,
      );

      try {

        const editing =
          editingPreparationId !==
          null;

        const response =
          await fetch(
            editing
              ? `/api/nutrition/food-preparation-conversions/${encodeURIComponent(
                  editingPreparationId,
                )}`
              : `/api/nutrition/foods/${encodeURIComponent(
                  editingFood.id,
                )}/preparation-conversions`,
            {
              method:
                editing
                  ? 'PATCH'
                  : 'POST',

              headers: {
                'content-type':
                  'application/json',
              },

              body:
                JSON.stringify({
                  name:
                    preparationName.trim(),

                  rawAmount,

                  preparedAmount,

                  preparedUnit:
                    preparationUnit,

                  isDefault:
                    preparationIsDefault,
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
              NutritionFoodPreparationConversionResponse |
              null;

        if (
          !response.ok ||
          !body?.id
        ) {
          setError(
            'No se ha podido guardar la equivalencia.',
          );

          return;
        }

        setPreparationConversions(
          current => {

            const next =
              editing
                ? current.map(
                    conversion =>
                      conversion.id ===
                      body.id
                        ? body
                        : preparationIsDefault
                          ? {
                              ...conversion,
                              isDefault:
                                false,
                            }
                          : conversion,
                  )
                : [
                    ...current.map(
                      conversion =>
                        preparationIsDefault
                          ? {
                              ...conversion,
                              isDefault:
                                false,
                            }
                          : conversion,
                    ),
                    body,
                  ];

            return next.sort(
              (
                left,
                right,
              ) =>
                Number(
                  right.isDefault,
                ) -
                Number(
                  left.isDefault,
                ),
            );
          },
        );

        resetPreparationEditor();

      } catch {

        setError(
          'No se ha podido conectar con Nutrición.',
        );

      } finally {

        setSavingPreparation(
          false,
        );
      }
    };

  const deletePreparation =
    async (
      conversion:
        NutritionFoodPreparationConversionResponse,
    ) => {

      const confirmed =
        window.confirm(
          `¿Eliminar la equivalencia “${conversion.name}”?`,
        );

      if (!confirmed) {
        return;
      }

      setError(
        null,
      );

      try {

        const response =
          await fetch(
            `/api/nutrition/food-preparation-conversions/${encodeURIComponent(
              conversion.id,
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
            'No se ha podido eliminar la equivalencia.',
          );

          return;
        }

        setPreparationConversions(
          current =>
            current.filter(
              item =>
                item.id !==
                conversion.id,
            ),
        );

        if (
          editingPreparationId ===
          conversion.id
        ) {
          resetPreparationEditor();
        }

      } catch {

        setError(
          'No se ha podido conectar con Nutrición.',
        );
      }
    };

  const archiveCatalogFood =
    async (
      food:
        NutritionFoodResponse,
    ) => {

      setCatalogMenuFoodId(
        null,
      );

      const confirmed =
        window.confirm(
          `¿Eliminar “${food.name}” del catálogo? Las comidas y dietas donde ya se haya utilizado conservarán el alimento.`,
        );

      if (!confirmed) {
        return;
      }

      setError(
        null,
      );

      try {

        const response =
          await fetch(
            `/api/nutrition/foods/${encodeURIComponent(
              food.id,
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
            'No se ha podido eliminar el alimento del catálogo.',
          );

          return;
        }

        setCatalogRevision(
          current =>
            current + 1,
        );

      } catch {

        setError(
          'No se ha podido conectar con Nutrición.',
        );
      }
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

      setError(
        null,
      );

      setSubmitting(
        true,
      );

      try {

        if (
          editingFood
        ) {
          await updateExistingFood();

          return;
        }

        let food =
          selectedFood;

        if (
          creatingFood
        ) {
          food =
            await createFood();

          if (!food) {
            return;
          }
        }

        if (!food) {
          setError(
            'Selecciona o crea un alimento.',
          );

          return;
        }

        const normalizedQuantities =
          people
            .map(
              (
                person,
              ) => {

                const raw =
                  quantities[
                    person.id
                  ];

                if (
                  raw ===
                    undefined ||
                  raw.trim() ===
                    ''
                ) {
                  return null;
                }

                return {
                  userId:
                    person.id,

                  quantity:
                    Number(
                      raw,
                    ),
                };
              },
            )
            .filter(
              (
                value,
              ): value is {
                userId:
                  string;

                quantity:
                  number;
              } =>
                value !==
                null,
            );

        if (
          normalizedQuantities.length ===
          0
        ) {
          if (
            creatingFood
          ) {
            setOpen(
              false,
            );

            reset();

            router.refresh();

            return;
          }

          setError(
            'Indica al menos una cantidad.',
          );

          return;
        }

        const response =
          await fetch(
            `/api/nutrition/meals/${encodeURIComponent(
              mealId,
            )}/items`,
            {
              method:
                'POST',

              headers: {
                'content-type':
                  'application/json',
              },

              body:
                JSON.stringify({
                  foodId:
                    food.id,

                  position,

                  notes:
                    null,

                  quantities:
                    normalizedQuantities,
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
              AddFoodResponse |
              null;

        if (
          !response.ok
        ) {
          setError(
            body?.error ===
              'invalid_meal_food'
              ? 'Revisa las cantidades.'
              : 'No se ha podido añadir el alimento.',
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
          styles.trigger
        }
        onClick={
          () =>
            setOpen(
              true,
            )
        }
      >
        <Plus />

        Añadir alimento
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
            aria-labelledby="nutrition-add-food-title"
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
                <Apple />
              </div>

              <div>
                <h2
                  id="nutrition-add-food-title"
                >
                  Añadir alimento
                </h2>

                <p>
                  Busca en el catálogo o crea uno nuevo.
                </p>
              </div>

              <button
                type="button"
                className={
                  styles.close
                }
                onClick={
                  close
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

              {!creatingFood &&
                !editingFood &&
                !selectedFood && (
                <>
                  <div
                    className={
                      styles.searchField
                    }
                  >
                    <Search />

                    <input
                      type="search"
                      value={
                        query
                      }
                      onChange={
                        (
                          event,
                        ) =>
                          setQuery(
                            event
                              .target
                              .value,
                          )
                      }
                      placeholder="Buscar alimento"
                      autoFocus
                    />
                  </div>

                  <div
                    className={
                      styles.categoryFilters
                    }
                  >
                    <button
                      type="button"
                      className={
                        categoryFilter ===
                        null
                          ? styles.categoryFilterActive
                          : undefined
                      }
                      onClick={
                        () =>
                          setCategoryFilter(
                            null,
                          )
                      }
                    >
                      Todos
                    </button>

                    {nutritionFoodCategories
                      .filter(
                        option =>
                          option.value !==
                          'OTHER',
                      )
                      .map(
                        option => (
                          <button
                            key={
                              option.value
                            }
                            type="button"
                            className={
                              categoryFilter ===
                              option.value
                                ? styles.categoryFilterActive
                                : undefined
                            }
                            onClick={
                              () =>
                                setCategoryFilter(
                                  option.value,
                                )
                            }
                          >
                            {
                              option.label
                            }
                          </button>
                        ),
                      )}
                  </div>

                  <div
                    className={
                      styles.foodResults
                    }
                  >
                    {loading ? (
                      <div
                        className={
                          styles.status
                        }
                      >
                        Buscando…
                      </div>
                    ) : foods.length >
                      0 ? (
                      foods.map(
                        food => (
                          <div
                            key={
                              food.id
                            }
                            className={
                              styles.foodResult
                            }
                          >
                            <button
                              type="button"
                              className={
                                styles.foodResultMain
                              }
                              onClick={
                                () => {

                                  setCatalogMenuFoodId(
                                    null,
                                  );

                                  setSelectedFood(
                                    food,
                                  );
                                }
                              }
                            >
                              <span>
                                <strong>
                                  {
                                    food.name
                                  }
                                </strong>

                                <small>
                                  {food.brand
                                    ? `${food.brand} · `
                                    : ''}

                                  {getFoodCategoryLabel(
                                    food.category,
                                  )}
                                </small>
                              </span>

                              <span>
                                {
                                  food.caloriesKcal
                                }{' '}
                                kcal /{' '}
                                {
                                  food.referenceAmount
                                }{' '}
                                {
                                  food.referenceUnit ===
                                  'G'
                                    ? 'g'
                                    : food.referenceUnit
                                }
                              </span>
                            </button>

                            <div
                              ref={
                                catalogMenuFoodId ===
                                food.id
                                  ? catalogMenuRef
                                  : undefined
                              }
                              className={
                                styles.foodResultMenu
                              }
                            >
                              <button
                                type="button"
                                className={
                                  styles.foodResultMenuButton
                                }
                                onClick={
                                  () =>
                                    setCatalogMenuFoodId(
                                      current =>
                                        current ===
                                        food.id
                                          ? null
                                          : food.id,
                                    )
                                }
                                aria-label={`Opciones de ${food.name}`}
                                aria-expanded={
                                  catalogMenuFoodId ===
                                  food.id
                                }
                              >
                                <Ellipsis />
                              </button>

                              {catalogMenuFoodId ===
                                food.id && (
                                <div
                                  className={
                                    styles.foodResultPopover
                                  }
                                >
                                  <button
                                    type="button"
                                    onClick={
                                      () =>
                                        beginEditingFood(
                                          food,
                                        )
                                    }
                                  >
                                    <Pencil />

                                    Editar alimento
                                  </button>

                                  <button
                                    type="button"
                                    className={
                                      styles.foodResultDelete
                                    }
                                    onClick={
                                      () =>
                                        void archiveCatalogFood(
                                          food,
                                        )
                                    }
                                  >
                                    <Trash2 />

                                    Eliminar del catálogo
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        ),
                      )
                    ) : (
                      <div
                        className={
                          styles.status
                        }
                      >
                        No hay resultados.
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    className={
                      styles.createFoodButton
                    }
                    onClick={
                      () => {

                        setCreatingFood(
                          true,
                        );

                        setFoodName(
                          query,
                        );
                      }
                    }
                  >
                    <Plus />

                    Crear alimento nuevo
                  </button>
                </>
              )}

              {(creatingFood ||
                editingFood) && (
                <div
                  className={
                    styles.createFood
                  }
                >
                  <div
                    className={
                      styles.editorHeading
                    }
                  >
                    <div>
                      <strong>
                        {editingFood
                          ? 'Editar alimento'
                          : 'Crear alimento'}
                      </strong>

                      <span>
                        {editingFood
                          ? 'Modifica los datos del alimento del catálogo.'
                          : 'Añade un alimento nuevo al catálogo.'}
                      </span>
                    </div>

                    {editingFood && (
                      <span
                        className={
                          styles.editorBadge
                        }
                      >
                        Catálogo
                      </span>
                    )}
                  </div>

                  <div
                    className={
                      styles.createGrid
                    }
                  >
                    <label>
                      <span>
                        Nombre
                      </span>

                      <input
                        value={
                          foodName
                        }
                        onChange={
                          (
                            event,
                          ) =>
                            setFoodName(
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
                        Marca
                      </span>

                      <input
                        value={
                          brand
                        }
                        onChange={
                          (
                            event,
                          ) =>
                            setBrand(
                              event
                                .target
                                .value,
                            )
                        }
                      />
                    </label>

                    <label>
                      <span>
                        Categoría
                      </span>

                      <select
                        value={
                          category
                        }
                        onChange={
                          event => {

                            setCategory(
                              event.target
                                .value as
                                NutritionFoodCategory,
                            );

                            setCategoryManuallyChanged(
                              true,
                            );
                          }
                        }
                      >
                        {nutritionFoodCategories.map(
                          option => (
                            <option
                              key={
                                option.value
                              }
                              value={
                                option.value
                              }
                            >
                              {
                                option.label
                              }
                            </option>
                          ),
                        )}
                      </select>

                      <small
                        className={
                          styles.categoryHint
                        }
                      >
                        {categoryManuallyChanged
                          ? 'Elegida manualmente'
                          : 'Sugerida automáticamente'}
                      </small>
                    </label>

                    <label>
                      <span>
                        Referencia
                      </span>

                      <input
                        type="number"
                        min="0.01"
                        step="any"
                        value={
                          referenceAmount
                        }
                        onChange={
                          (
                            event,
                          ) =>
                            setReferenceAmount(
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
                        Unidad
                      </span>

                      <select
                        value={
                          referenceUnit
                        }
                        onChange={
                          (
                            event,
                          ) =>
                            setReferenceUnit(
                              event
                                .target
                                .value as
                                NutritionUnit,
                            )
                        }
                      >
                        <option value="G">
                          g
                        </option>
                        <option value="KG">
                          kg
                        </option>
                        <option value="ML">
                          ml
                        </option>
                        <option value="L">
                          l
                        </option>
                        <option value="UNIT">
                          unidad
                        </option>
                      </select>
                    </label>

                    <label>
                      <span>
                        kcal
                      </span>

                      <input
                        type="number"
                        min="0"
                        step="any"
                        value={
                          caloriesKcal
                        }
                        onChange={
                          (
                            event,
                          ) =>
                            setCaloriesKcal(
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
                        Proteína
                      </span>

                      <input
                        type="number"
                        min="0"
                        step="any"
                        value={
                          proteinG
                        }
                        onChange={
                          (
                            event,
                          ) =>
                            setProteinG(
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
                        Carbohidratos
                      </span>

                      <input
                        type="number"
                        min="0"
                        step="any"
                        value={
                          carbohydratesG
                        }
                        onChange={
                          (
                            event,
                          ) =>
                            setCarbohydratesG(
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
                        Grasas
                      </span>

                      <input
                        type="number"
                        min="0"
                        step="any"
                        value={
                          fatG
                        }
                        onChange={
                          (
                            event,
                          ) =>
                            setFatG(
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
                        Fibra
                      </span>

                      <input
                        type="number"
                        min="0"
                        step="any"
                        value={
                          fiberG
                        }
                        onChange={
                          (
                            event,
                          ) =>
                            setFiberG(
                              event
                                .target
                                .value,
                            )
                        }
                      />
                    </label>
                  </div>

                  {editingFood && (
                    <section
                      className={
                        styles.preparationSection
                      }
                    >
                      <div
                        className={
                          styles.preparationHeading
                        }
                      >
                        <div>
                          <strong>
                            Equivalencias de preparación
                          </strong>

                          <span>
                            Guarda una vez cuánto pesa este alimento después de cocinarlo.
                          </span>
                        </div>
                      </div>

                      {loadingPreparations ? (
                        <div
                          className={
                            styles.preparationEmpty
                          }
                        >
                          Cargando equivalencias…
                        </div>
                      ) : preparationConversions.length >
                        0 ? (
                        <div
                          className={
                            styles.preparationList
                          }
                        >
                          {preparationConversions.map(
                            conversion => (
                              <article
                                key={
                                  conversion.id
                                }
                                className={
                                  styles.preparationCard
                                }
                              >
                                <div>
                                  <div
                                    className={
                                      styles.preparationTitle
                                    }
                                  >
                                    <strong>
                                      {
                                        conversion.name
                                      }
                                    </strong>

                                    {conversion.isDefault && (
                                      <span>
                                        Predeterminada
                                      </span>
                                    )}
                                  </div>

                                  <div
                                    className={
                                      styles.preparationValues
                                    }
                                  >
                                    <span>
                                      {
                                        conversion.rawAmount
                                      }{' '}
                                      {getUnitLabel(
                                        editingFood.referenceUnit,
                                      )}{' '}
                                      crudo
                                    </span>

                                    <span>
                                      →
                                    </span>

                                    <span>
                                      {
                                        conversion.preparedAmount
                                      }{' '}
                                      {getUnitLabel(
                                        conversion.preparedUnit,
                                      )}{' '}
                                      preparado
                                    </span>
                                  </div>

                                  <small>
                                    Ratio ×
                                    {formatPreparationRatio(
                                      conversion.rawAmount,
                                      conversion.preparedAmount,
                                    )}
                                  </small>
                                </div>

                                <div
                                  className={
                                    styles.preparationActions
                                  }
                                >
                                  <button
                                    type="button"
                                    onClick={
                                      () =>
                                        beginEditingPreparation(
                                          conversion,
                                        )
                                    }
                                  >
                                    <Pencil />
                                    Editar
                                  </button>

                                  <button
                                    type="button"
                                    className={
                                      styles.preparationDelete
                                    }
                                    onClick={
                                      () =>
                                        void deletePreparation(
                                          conversion,
                                        )
                                    }
                                  >
                                    <Trash2 />
                                    Eliminar
                                  </button>
                                </div>
                              </article>
                            ),
                          )}
                        </div>
                      ) : (
                        <div
                          className={
                            styles.preparationEmpty
                          }
                        >
                          Todavía no hay equivalencias guardadas.
                        </div>
                      )}

                      <div
                        className={
                          styles.preparationEditor
                        }
                      >
                        <div
                          className={
                            styles.preparationEditorTitle
                          }
                        >
                          <strong>
                            {editingPreparationId
                              ? 'Editar preparación'
                              : 'Añadir preparación'}
                          </strong>
                        </div>

                        <div
                          className={
                            styles.preparationGrid
                          }
                        >
                          <label>
                            <span>
                              Método
                            </span>

                            <input
                              value={
                                preparationName
                              }
                              onChange={
                                event =>
                                  setPreparationName(
                                    event.target.value,
                                  )
                              }
                              placeholder="Cocido, plancha, horno…"
                            />
                          </label>

                          <label>
                            <span>
                              Cantidad en crudo
                            </span>

                            <div
                              className={
                                styles.preparationInputWithUnit
                              }
                            >
                              <input
                                type="number"
                                min="0.01"
                                step="any"
                                value={
                                  preparationRawAmount
                                }
                                onChange={
                                  event =>
                                    setPreparationRawAmount(
                                      event.target.value,
                                    )
                                }
                              />

                              <span>
                                {getUnitLabel(
                                  editingFood.referenceUnit,
                                )}
                              </span>
                            </div>
                          </label>

                          <label>
                            <span>
                              Cantidad preparada
                            </span>

                            <div
                              className={
                                styles.preparationInputWithUnit
                              }
                            >
                              <input
                                type="number"
                                min="0.01"
                                step="any"
                                value={
                                  preparationPreparedAmount
                                }
                                onChange={
                                  event =>
                                    setPreparationPreparedAmount(
                                      event.target.value,
                                    )
                                }
                              />

                              <span>
                                {getUnitLabel(
                                  preparationUnit,
                                )}
                              </span>
                            </div>
                          </label>

                          <label>
                            <span>
                              Unidad preparada
                            </span>

                            <select
                              value={
                                preparationUnit
                              }
                              onChange={
                                event =>
                                  setPreparationUnit(
                                    event.target
                                      .value as
                                      NutritionUnit,
                                  )
                              }
                            >
                              <option value="G">
                                g
                              </option>

                              <option value="KG">
                                kg
                              </option>

                              <option value="ML">
                                ml
                              </option>

                              <option value="L">
                                l
                              </option>

                              <option value="UNIT">
                                unidad
                              </option>
                            </select>
                          </label>
                        </div>

                        <label
                          className={
                            styles.preparationDefault
                          }
                        >
                          <input
                            type="checkbox"
                            checked={
                              preparationIsDefault
                            }
                            onChange={
                              event =>
                                setPreparationIsDefault(
                                  event.target.checked,
                                )
                            }
                          />

                          <span>
                            Usar como preparación predeterminada
                          </span>
                        </label>

                        {preparationRawAmount &&
                          preparationPreparedAmount &&
                          Number(
                            preparationRawAmount,
                          ) >
                            0 &&
                          Number(
                            preparationPreparedAmount,
                          ) >
                            0 && (
                          <div
                            className={
                              styles.preparationPreview
                            }
                          >
                            <strong>
                              {
                                preparationRawAmount
                              }{' '}
                              {getUnitLabel(
                                editingFood.referenceUnit,
                              )}{' '}
                              crudo
                            </strong>

                            <span>
                              →
                            </span>

                            <strong>
                              {
                                preparationPreparedAmount
                              }{' '}
                              {getUnitLabel(
                                preparationUnit,
                              )}{' '}
                              preparado
                            </strong>

                            <small>
                              ×
                              {formatPreparationRatio(
                                Number(
                                  preparationRawAmount,
                                ),
                                Number(
                                  preparationPreparedAmount,
                                ),
                              )}
                            </small>
                          </div>
                        )}

                        <div
                          className={
                            styles.preparationEditorActions
                          }
                        >
                          {editingPreparationId && (
                            <button
                              type="button"
                              onClick={
                                resetPreparationEditor
                              }
                            >
                              Cancelar edición
                            </button>
                          )}

                          <button
                            type="button"
                            className={
                              styles.preparationSave
                            }
                            disabled={
                              savingPreparation
                            }
                            onClick={
                              () =>
                                void savePreparation()
                            }
                          >
                            {savingPreparation
                              ? 'Guardando…'
                              : editingPreparationId
                                ? 'Guardar preparación'
                                : 'Añadir preparación'}
                          </button>
                        </div>
                      </div>
                    </section>
                  )}

                  <button
                    type="button"
                    className={
                      styles.backButton
                    }
                    onClick={
                      () => {

                        setCreatingFood(
                          false,
                        );

                        setEditingFood(
                          null,
                        );

                        setCategoryManuallyChanged(
                          false,
                        );

                        setFoodName(
                          '',
                        );

                        setBrand(
                          '',
                        );

                        setCategory(
                          'OTHER',
                        );

                        setReferenceAmount(
                          '100',
                        );

                        setReferenceUnit(
                          'G',
                        );

                        setCaloriesKcal(
                          '',
                        );

                        setProteinG(
                          '',
                        );

                        setCarbohydratesG(
                          '',
                        );

                        setFatG(
                          '',
                        );

                        setFiberG(
                          '',
                        );

                        setError(
                          null,
                        );
                      }
                    }
                  >
                    Volver al catálogo
                  </button>
                </div>
              )}

              {selectedFood && (
                <section
                  className={
                    styles.selectedFood
                  }
                >
                  <header>
                    <div>
                      <strong>
                        {
                          selectedFood.name
                        }
                      </strong>

                      {selectedFood.brand && (
                        <span>
                          {
                            selectedFood.brand
                          }
                        </span>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={
                        () =>
                          setSelectedFood(
                            null,
                          )
                      }
                    >
                      Cambiar
                    </button>
                  </header>
                </section>
              )}

              {(selectedFood ||
                creatingFood ||
                editingFood) && (
                <section
                  className={
                    styles.quantities
                  }
                >
                  <h3>
                    Cantidades
                  </h3>

                  {people.map(
                    (
                      person,
                    ) => (
                      <label
                        key={
                          person.id
                        }
                      >
                        <span>
                          {
                            person.name
                          }
                        </span>

                        <div>
                          <input
                            type="number"
                            min="0"
                            step="any"
                            value={
                              quantities[
                                person.id
                              ] ??
                              ''
                            }
                            onChange={
                              (
                                event,
                              ) =>
                                setQuantities(
                                  (
                                    current,
                                  ) => ({
                                    ...current,

                                    [person.id]:
                                      event
                                        .target
                                        .value,
                                  }),
                                )
                            }
                            placeholder="0"
                          />

                          {selectedFood && (
                            <span>
                              {
                                unitLabel
                              }
                            </span>
                          )}
                        </div>
                      </label>
                    ),
                  )}
                </section>
              )}

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

              {(selectedFood ||
                creatingFood ||
                editingFood) && (
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
                      ? editingFood
                        ? 'Guardando…'
                        : 'Añadiendo…'
                      : editingFood
                        ? 'Guardar cambios'
                        : 'Añadir'}
                  </button>
                </footer>
              )}

            </form>

          </section>
        </div>
      )}
    </>
  );
}
