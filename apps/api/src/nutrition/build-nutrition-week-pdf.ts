import type {
  NutritionFoodSnapshot,
  NutritionMealItemActual,
  NutritionNutrients,
  NutritionWeeklyPlanDetail,
} from '@dkturbo/nutrition';

import {
  ReportPdf,
} from '../pdf/report-pdf.js';

interface BuildNutritionWeekPdfInput {
  personId:
    string;

  personName:
    string;

  detail:
    NutritionWeeklyPlanDetail;
}

const formatNumber =
  (
    value:
      number,
  ): string =>
    Number.isInteger(
      value,
    )
      ? String(
          value,
        )
      : String(
          Math.round(
            value * 10,
          ) / 10,
        );

const unitLabel =
  (
    unit:
      NutritionFoodSnapshot['referenceUnit'],
  ): string => {

    switch (
      unit
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

const formatQuantity =
  (
    quantity:
      number,

    food:
      NutritionFoodSnapshot,
  ): string =>
    `${formatNumber(
      quantity,
    )} ${unitLabel(
      food.referenceUnit,
    )}`;

const formatDate =
  (
    value:
      string,
  ): string => {

    const date =
      new Date(
        `${value}T12:00:00Z`,
      );

    const formatted =
      new Intl.DateTimeFormat(
        'es-ES',
        {
          weekday:
            'long',

          day:
            '2-digit',

          timeZone:
            'UTC',
        },
      ).format(
        date,
      );

    return formatted.toLocaleUpperCase(
      'es-ES',
    );
  };

const formatRange =
  (
    start:
      string,

    end:
      string,
  ): string => {

    const startDate =
      new Date(
        `${start}T12:00:00Z`,
      );

    const endDate =
      new Date(
        `${end}T12:00:00Z`,
      );

    const startLabel =
      new Intl.DateTimeFormat(
        'es-ES',
        {
          day:
            '2-digit',

          month:
            'short',

          timeZone:
            'UTC',
        },
      ).format(
        startDate,
      );

    const endLabel =
      new Intl.DateTimeFormat(
        'es-ES',
        {
          day:
            '2-digit',

          month:
            'short',

          year:
            'numeric',

          timeZone:
            'UTC',
        },
      ).format(
        endDate,
      );

    return `${startLabel} - ${endLabel}`;
  };

const emptyNutrients =
  (): NutritionNutrients => ({
    caloriesKcal:
      0,

    proteinG:
      0,

    carbohydratesG:
      0,

    fatG:
      0,

    fiberG:
      0,
  });

const addNutrients =
  (
    left:
      NutritionNutrients,

    right:
      NutritionNutrients,
  ): NutritionNutrients => ({
    caloriesKcal:
      left.caloriesKcal +
      right.caloriesKcal,

    proteinG:
      left.proteinG +
      right.proteinG,

    carbohydratesG:
      left.carbohydratesG +
      right.carbohydratesG,

    fatG:
      left.fatG +
      right.fatG,

    fiberG:
      left.fiberG +
      right.fiberG,
  });

const actualForItem =
  (
    actuals:
      NutritionMealItemActual[],

    mealItemId:
      string,

    personId:
      string,
  ): NutritionMealItemActual | null =>
    actuals.find(
      actual =>
        actual.userId ===
          personId &&
        actual.mealItemId ===
          mealItemId,
    ) ??
    null;

const formatActual =
  (
    actual:
      NutritionMealItemActual | null,

    plannedFood:
      NutritionFoodSnapshot,

    plannedQuantity:
      number,
  ): string => {

    if (!actual) {
      return '—';
    }

    if (
      actual.status ===
      'SKIPPED'
    ) {
      return 'Omitido';
    }

    if (
      actual.status ===
        'EATEN' &&
      actual.actualFoodId ===
        actual.plannedFoodId &&
      actual.actualQuantity ===
        plannedQuantity
    ) {
      return '=';
    }

    if (
      !actual.actualFoodSnapshot ||
      actual.actualQuantity ===
        null
    ) {
      return '—';
    }

    const actualQuantity =
      formatQuantity(
        actual.actualQuantity,
        actual.actualFoodSnapshot,
      );

    if (
      actual.actualFoodId ===
      actual.plannedFoodId &&
      actual.actualFoodSnapshot.name ===
        plannedFood.name
    ) {
      return actualQuantity;
    }

    return `${actual.actualFoodSnapshot.name} · ${actualQuantity}`;
  };

const writeMacros =
  (
    report:
      ReportPdf,

    planned:
      NutritionNutrients,

    actual:
      NutritionNutrients,
  ): void => {

    report.comparisonHeader();

    report.comparisonRow(
      'Energía',
      `${formatNumber(
        planned.caloriesKcal,
      )} kcal`,
      `${formatNumber(
        actual.caloriesKcal,
      )} kcal`,
      {
        emphasis:
          true,
      },
    );

    report.comparisonRow(
      'Proteína',
      `${formatNumber(
        planned.proteinG,
      )} g`,
      `${formatNumber(
        actual.proteinG,
      )} g`,
    );

    report.comparisonRow(
      'Carbohidratos',
      `${formatNumber(
        planned.carbohydratesG,
      )} g`,
      `${formatNumber(
        actual.carbohydratesG,
      )} g`,
    );

    report.comparisonRow(
      'Grasas',
      `${formatNumber(
        planned.fatG,
      )} g`,
      `${formatNumber(
        actual.fatG,
      )} g`,
    );

    report.comparisonRow(
      'Fibra',
      `${formatNumber(
        planned.fiberG,
      )} g`,
      `${formatNumber(
        actual.fiberG,
      )} g`,
    );
  };

export const buildNutritionWeekPdf =
  async (
    input:
      BuildNutritionWeekPdfInput,
  ): Promise<Uint8Array> => {

    const report =
      await ReportPdf.create(
        'Resumen semanal · Nutrición',
      );

    report.title(
      'DKTURBO OS · NUTRICIÓN',
      input.personName.toLocaleUpperCase(
        'es-ES',
      ),
      `${formatRange(
        input.detail.plan.startDate,
        input.detail.plan.endDate,
      )} · ${input.detail.plan.title}`,
    );

    report.spacer(
      8,
    );

    let weeklyPlanned =
      emptyNutrients();

    let weeklyActual =
      emptyNutrients();

    for (
      const dayDetail
      of input.detail.days
    ) {

      const progress =
        dayDetail.progressByUser.find(
          item =>
            item.userId ===
            input.personId,
        );

      const planned =
        progress?.planned ??
        emptyNutrients();

      const actual =
        progress?.actual ??
        emptyNutrients();

      weeklyPlanned =
        addNutrients(
          weeklyPlanned,
          planned,
        );

      weeklyActual =
        addNutrients(
          weeklyActual,
          actual,
        );

      const personalMeals =
        dayDetail.meals
          .map(
            meal => ({
              ...meal,

              items:
                meal.items.filter(
                  item =>
                    item.quantities.some(
                      quantity =>
                        quantity.userId ===
                        input.personId,
                    ),
                ),
            }),
          )
          .filter(
            meal =>
              meal.items.length >
              0,
          );

      const personalActuals =
        dayDetail.actuals.filter(
          item =>
            item.userId ===
            input.personId,
        );

      if (
        personalMeals.length ===
          0 &&
        personalActuals.length ===
          0
      ) {
        continue;
      }

      report.section(
        formatDate(
          dayDetail.day.date,
        ),
      );

      for (
        const mealDetail
        of personalMeals
      ) {

        const heading =
          mealDetail.meal.plannedTime
            ? `${mealDetail.meal.name.toLocaleUpperCase(
                'es-ES',
              )} · ${mealDetail.meal.plannedTime}`
            : mealDetail.meal.name.toLocaleUpperCase(
                'es-ES',
              );

        report.subsection(
          heading,
        );

        report.comparisonHeader();

        for (
          const itemDetail
          of mealDetail.items
        ) {

          const quantity =
            itemDetail.quantities.find(
              item =>
                item.userId ===
                input.personId,
            );

          if (!quantity) {
            continue;
          }

          const plannedFood:
            NutritionFoodSnapshot = {
              name:
                itemDetail.food.name,

              brand:
                itemDetail.food.brand,

              category:
                itemDetail.food.category,

              referenceAmount:
                itemDetail.food.referenceAmount,

              referenceUnit:
                itemDetail.food.referenceUnit,

              caloriesKcal:
                itemDetail.food.caloriesKcal,

              proteinG:
                itemDetail.food.proteinG,

              carbohydratesG:
                itemDetail.food.carbohydratesG,

              fatG:
                itemDetail.food.fatG,

              fiberG:
                itemDetail.food.fiberG,
            };

          const itemActual =
            actualForItem(
              personalActuals,
              itemDetail.item.id,
              input.personId,
            );

          report.comparisonRow(
            itemDetail.food.name,
            formatQuantity(
              quantity.quantity,
              plannedFood,
            ),
            formatActual(
              itemActual,
              plannedFood,
              quantity.quantity,
            ),
          );

          if (
            itemActual?.notes
          ) {
            report.text(
              `Nota: ${itemActual.notes}`,
              {
                muted:
                  true,

                size:
                  7.2,

                indent:
                  118,
              },
            );
          }
        }

        report.spacer(
          5,
        );
      }

      /*
       * Historical actuals survive deletion of the
       * original meal item. Keep them visible rather
       * than silently losing recorded intake.
       */
      const orphanActuals =
        personalActuals.filter(
          actual =>
            actual.mealItemId ===
            null,
        );

      if (
        orphanActuals.length >
        0
      ) {

        report.subsection(
          'REGISTROS CONSERVADOS',
        );

        report.comparisonHeader();

        for (
          const orphan
          of orphanActuals
        ) {

          report.comparisonRow(
            orphan.plannedFoodSnapshot.name,

            formatQuantity(
              orphan.plannedQuantity,
              orphan.plannedFoodSnapshot,
            ),

            formatActual(
              orphan,
              orphan.plannedFoodSnapshot,
              orphan.plannedQuantity,
            ),
          );

          if (
            orphan.notes
          ) {
            report.text(
              `Nota: ${orphan.notes}`,
              {
                muted:
                  true,

                size:
                  7.2,

                indent:
                  118,
              },
            );
          }
        }
      }

      report.spacer(
        7,
      );

      report.text(
        'TOTAL DÍA',
        {
          bold:
            true,

          size:
            9,
        },
      );

      writeMacros(
        report,
        planned,
        actual,
      );

      report.spacer(
        12,
      );
    }

    report.section(
      'TOTAL SEMANA',
    );

    writeMacros(
      report,
      weeklyPlanned,
      weeklyActual,
    );

    return report.save();
  };
