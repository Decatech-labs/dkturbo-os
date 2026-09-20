import {
  Apple,
  ArrowLeft,
  CalendarDays,
  ChevronRight,
  Clock3,
  UsersRound,
} from 'lucide-react';

import Link from 'next/link';

import {
  requireAccessPermission,
} from '../../../lib/access-server';

import {
  requireCurrentSession,
} from '../../../lib/auth-server';

import {
  getNutritionPlanDetail,
  getNutritionPlans,
  type NutritionNutrientsResponse,
} from '../../../lib/nutrition-api';

export const dynamic =
  'force-dynamic';

const getTodayDate =
  (): string => {

    const parts =
      new Intl.DateTimeFormat(
        'en-CA',
        {
          timeZone:
            'Europe/Madrid',

          year:
            'numeric',

          month:
            '2-digit',

          day:
            '2-digit',
        },
      ).formatToParts(
        new Date(),
      );

    const year =
      parts.find(
        (part) =>
          part.type ===
          'year',
      )?.value;

    const month =
      parts.find(
        (part) =>
          part.type ===
          'month',
      )?.value;

    const day =
      parts.find(
        (part) =>
          part.type ===
          'day',
      )?.value;

    if (
      !year ||
      !month ||
      !day
    ) {
      throw new Error(
        'Unable to resolve current Nutrition date',
      );
    }

    return `${year}-${month}-${day}`;
  };

const formatDate =
  (
    value:
      string,
  ): string => {

    const [
      year,
      month,
      day,
    ] =
      value
        .split('-')
        .map(Number);

    if (
      !year ||
      !month ||
      !day
    ) {
      return value;
    }

    return new Intl
      .DateTimeFormat(
        'es-ES',
        {
          weekday:
            'long',

          day:
            'numeric',

          month:
            'long',
        },
      )
      .format(
        new Date(
          year,
          month - 1,
          day,
        ),
      );
  };

const formatQuantity =
  (
    quantity:
      number,

    unit:
      string,
  ): string => {

    const normalizedUnit =
      unit === 'G'
        ? 'g'
        : unit === 'KG'
          ? 'kg'
          : unit === 'ML'
            ? 'ml'
            : unit === 'L'
              ? 'l'
              : 'ud';

    return `${quantity} ${normalizedUnit}`;
  };

const emptyNutrients =
  (): NutritionNutrientsResponse => ({
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

export default async function NutritionPage() {

  await requireAccessPermission(
    'app.nutrition.access',
  );

  const session =
    await requireCurrentSession();

  const plans =
    await getNutritionPlans();

  const today =
    getTodayDate();

  const currentPlan =
    plans.find(
      (plan) =>
        plan.startDate <=
          today &&
        plan.endDate >=
          today,
    ) ??
    [...plans]
      .sort(
        (a, b) =>
          b.startDate.localeCompare(
            a.startDate,
          ),
      )[0] ??
    null;

  if (!currentPlan) {
    return (
      <main className="training-page">

        <header className="training-page-header">

          <Link
            href="/"
            className="system-back"
            aria-label="Volver al inicio"
          >
            <ArrowLeft />
          </Link>

          <div>
            <h1>
              Nutrición
            </h1>

            <p>
              Alimentación, macros y planificación familiar.
            </p>
          </div>

        </header>

        <section className="training-empty">

          <div className="training-empty-icon">
            <Apple />
          </div>

          <strong>
            Todavía no hay ninguna dieta
          </strong>

          <span>
            Cuando crees una semana nutricional aparecerá aquí.
          </span>

        </section>

      </main>
    );
  }

  const detail =
    await getNutritionPlanDetail(
      currentPlan.id,
    );

  const todayDetail =
    detail.days.find(
      ({
        day,
      }) =>
        day.date ===
        today,
    ) ??
    detail.days[0] ??
    null;

  const personalProgress =
    todayDetail
      ?.progressByUser
      .find(
        ({
          userId,
        }) =>
          userId ===
          session.user.id,
      ) ??
    null;

  const planned =
    personalProgress
      ?.planned ??
    emptyNutrients();

  const personalMeals =
    todayDetail
      ? todayDetail.meals
          .map(
            (mealDetail) => ({
              ...mealDetail,

              items:
                mealDetail.items
                  .map(
                    (itemDetail) => {

                      const quantity =
                        itemDetail.quantities.find(
                          ({
                            userId,
                          }) =>
                            userId ===
                            session.user.id,
                        );

                      return quantity
                        ? {
                            ...itemDetail,

                            personalQuantity:
                              quantity.quantity,
                          }
                        : null;
                    },
                  )
                  .filter(
                    (
                      item,
                    ): item is NonNullable<
                      typeof item
                    > =>
                      item !==
                      null,
                  ),
            }),
          )
          .filter(
            ({
              items,
            }) =>
              items.length >
              0,
          )
      : [];

  const now =
    new Date();

  const currentMinutes =
    Number(
      new Intl.DateTimeFormat(
        'en-GB',
        {
          timeZone:
            'Europe/Madrid',

          hour:
            '2-digit',

          minute:
            '2-digit',

          hour12:
            false,
        },
      )
        .format(
          now,
        )
        .split(':')[0],
    ) *
      60 +
    Number(
      new Intl.DateTimeFormat(
        'en-GB',
        {
          timeZone:
            'Europe/Madrid',

          hour:
            '2-digit',

          minute:
            '2-digit',

          hour12:
            false,
        },
      )
        .format(
          now,
        )
        .split(':')[1],
    );

  const nextMeal =
    personalMeals
      .filter(
        ({
          meal,
        }) =>
          meal.plannedTime !==
          null,
      )
      .map(
        (mealDetail) => {

          const [
            hours,
            minutes,
          ] =
            mealDetail
              .meal
              .plannedTime!
              .split(':')
              .map(Number);

          return {
            ...mealDetail,

            minutesOfDay:
              (
                hours ??
                0
              ) *
                60 +
              (
                minutes ??
                0
              ),
          };
        },
      )
      .filter(
        ({
          minutesOfDay,
        }) =>
          minutesOfDay >=
          currentMinutes,
      )
      .sort(
        (a, b) =>
          a.minutesOfDay -
          b.minutesOfDay,
      )[0] ??
    null;

  return (
    <main className="training-page">

      <header className="training-page-header">

        <Link
          href="/"
          className="system-back"
          aria-label="Volver al inicio"
        >
          <ArrowLeft />
        </Link>

        <div>
          <h1>
            Nutrición
          </h1>

          <p>
            {currentPlan.title}
          </p>
        </div>

      </header>

      <section className="nutrition-today">

        <div className="training-section-heading">
          <div>
            <span>
              Hoy
            </span>

            <h2>
              {todayDetail
                ? formatDate(
                    todayDetail.day.date,
                  )
                : 'Sin planificación'}
            </h2>
          </div>
        </div>

        {nextMeal ? (
          <article className="nutrition-next-meal">

            <div className="nutrition-next-meal-heading">

              <div>
                <span>
                  Ahora / siguiente
                </span>

                <strong>
                  {nextMeal.meal.name}
                </strong>
              </div>

              {nextMeal.meal.plannedTime && (
                <div className="nutrition-meal-time">
                  <Clock3 />

                  {
                    nextMeal
                      .meal
                      .plannedTime
                  }
                </div>
              )}

            </div>

            <div className="nutrition-food-list">

              {nextMeal.items.map(
                ({
                  item,
                  food,
                  personalQuantity,
                }) => (
                  <div
                    key={
                      item.id
                    }
                    className="nutrition-food-row"
                  >
                    <span>
                      {food.name}
                    </span>

                    <strong>
                      {formatQuantity(
                        personalQuantity,
                        food.referenceUnit,
                      )}
                    </strong>
                  </div>
                ),
              )}

            </div>

          </article>
        ) : (
          <article className="nutrition-next-meal">
            <strong>
              No quedan comidas planificadas para hoy
            </strong>
          </article>
        )}

        <div className="nutrition-macro-grid">

          <div>
            <span>
              Energía
            </span>

            <strong>
              {planned.caloriesKcal}
            </strong>

            <small>
              kcal
            </small>
          </div>

          <div>
            <span>
              Proteína
            </span>

            <strong>
              {planned.proteinG}
            </strong>

            <small>
              g
            </small>
          </div>

          <div>
            <span>
              Carbohidratos
            </span>

            <strong>
              {planned.carbohydratesG}
            </strong>

            <small>
              g
            </small>
          </div>

          <div>
            <span>
              Grasas
            </span>

            <strong>
              {planned.fatG}
            </strong>

            <small>
              g
            </small>
          </div>

        </div>

      </section>

      <section className="nutrition-shortcuts">

        <Link
          href={`/nutricion/semanas/${currentPlan.id}`}
          className="training-athlete-card"
        >
          <div className="training-athlete-icon">
            <CalendarDays />
          </div>

          <div className="training-athlete-content">
            <strong>
              Mi semana
            </strong>

            <span>
              Ver toda tu planificación nutricional.
            </span>
          </div>

          <div className="training-athlete-arrow">
            <ChevronRight />
          </div>
        </Link>

        <Link
          href={`/nutricion/semanas/${currentPlan.id}?view=family`}
          className="training-athlete-card"
        >
          <div className="training-athlete-icon">
            <UsersRound />
          </div>

          <div className="training-athlete-content">
            <strong>
              Familia
            </strong>

            <span>
              Ver cantidades y comidas de todos.
            </span>
          </div>

          <div className="training-athlete-arrow">
            <ChevronRight />
          </div>
        </Link>

      </section>

    </main>
  );
}
