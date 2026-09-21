import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  UsersRound,
  UserRound,
} from 'lucide-react';

import Link from 'next/link';

import {
  requireAccessPermission,
} from '../../../../../lib/access-server';

import {
  requireCurrentSession,
} from '../../../../../lib/auth-server';

import {
  getNutritionPeople,
  getNutritionPlanDetail,
  getNutritionPlans,
  type NutritionNutrientsResponse,
  type NutritionPersonResponse,
} from '../../../../../lib/nutrition-api';

export const dynamic =
  'force-dynamic';

interface NutritionWeekPageProps {
  params:
    Promise<{
      planId:
        string;
    }>;

  searchParams:
    Promise<{
      view?:
        string;
    }>;
}

const formatShortDate =
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
          day:
            'numeric',

          month:
            'short',
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

const formatDay =
  (
    value:
      string,
  ): {
    weekday:
      string;

    date:
      string;
  } => {

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
      return {
        weekday:
          value,

        date:
          value,
      };
    }

    const dateValue =
      new Date(
        year,
        month - 1,
        day,
      );

    return {
      weekday:
        new Intl
          .DateTimeFormat(
            'es-ES',
            {
              weekday:
                'long',
            },
          )
          .format(
            dateValue,
          ),

      date:
        new Intl
          .DateTimeFormat(
            'es-ES',
            {
              day:
                'numeric',

              month:
                'short',
            },
          )
          .format(
            dateValue,
          ),
    };
  };

const formatQuantity =
  (
    quantity:
      number,

    unit:
      string,
  ): string => {

    const label =
      unit === 'G'
        ? 'g'
        : unit === 'KG'
          ? 'kg'
          : unit === 'ML'
            ? 'ml'
            : unit === 'L'
              ? 'l'
              : 'ud';

    return `${quantity} ${label}`;
  };

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
      : value.toFixed(
          1,
        );

const NutritionMacroSummary =
  ({
    nutrients,
  }: {
    nutrients:
      NutritionNutrientsResponse;
  }) => (
    <div className="nutrition-week-macros">
      <span>
        <strong>
          {formatNumber(
            nutrients.caloriesKcal,
          )}
        </strong>
        {' '}kcal
      </span>

      <span>
        P{' '}
        <strong>
          {formatNumber(
            nutrients.proteinG,
          )}
        </strong>
      </span>

      <span>
        C{' '}
        <strong>
          {formatNumber(
            nutrients.carbohydratesG,
          )}
        </strong>
      </span>

      <span>
        G{' '}
        <strong>
          {formatNumber(
            nutrients.fatG,
          )}
        </strong>
      </span>
    </div>
  );

const getPersonName =
  (
    people:
      NutritionPersonResponse[],

    userId:
      string,
  ): string =>
    people.find(
      (person) =>
        person.id ===
        userId,
    )?.name ??
    'Usuario';

export default async function NutritionWeekPage({
  params,
  searchParams,
}: NutritionWeekPageProps) {

  await requireAccessPermission(
    'app.nutrition.access',
  );

  const [
    {
      planId,
    },
    query,
    session,
    plans,
    people,
  ] =
    await Promise.all([
      params,
      searchParams,
      requireCurrentSession(),
      getNutritionPlans(),
      getNutritionPeople(),
    ]);

  const detail =
    await getNutritionPlanDetail(
      planId,
    );

  const familyView =
    query.view ===
    'family';

  const sortedPlans =
    [...plans].sort(
      (a, b) =>
        a.startDate.localeCompare(
          b.startDate,
        ),
    );

  const currentIndex =
    sortedPlans.findIndex(
      (plan) =>
        plan.id ===
        planId,
    );

  const previousPlan =
    currentIndex >
    0
      ? sortedPlans[
          currentIndex -
          1
        ] ??
        null
      : null;

  const nextPlan =
    currentIndex >=
      0 &&
    currentIndex <
      sortedPlans.length -
        1
      ? sortedPlans[
          currentIndex +
          1
        ] ??
        null
      : null;

  const today =
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
    ).format(
      new Date(),
    );

  return (
    <main className="app-page nutrition-week-page">

      <header className="training-page-header">

        <Link
          href="/nutricion"
          className="system-back"
          aria-label="Volver a Nutrición"
        >
          <ArrowLeft />
        </Link>

        <div>
          <h1>
            {detail.plan.title}
          </h1>

          <p>
            {formatShortDate(
              detail.plan.startDate,
            )}
            {' — '}
            {formatShortDate(
              detail.plan.endDate,
            )}
          </p>
        </div>

      </header>

      <nav
        className="nutrition-week-navigation"
        aria-label="Navegación entre semanas"
      >

        {previousPlan ? (
          <Link
            href={`/nutricion/semanas/${previousPlan.id}${
              familyView
                ? '?view=family'
                : ''
            }`}
            className="nutrition-week-nav-button"
            aria-label="Semana anterior"
          >
            <ChevronLeft />
          </Link>
        ) : (
          <span className="nutrition-week-nav-button nutrition-week-nav-disabled">
            <ChevronLeft />
          </span>
        )}

        <div>
          <span>
            Semana
          </span>

          <strong>
            {formatShortDate(
              detail.plan.startDate,
            )}
            {' — '}
            {formatShortDate(
              detail.plan.endDate,
            )}
          </strong>
        </div>

        {nextPlan ? (
          <Link
            href={`/nutricion/semanas/${nextPlan.id}${
              familyView
                ? '?view=family'
                : ''
            }`}
            className="nutrition-week-nav-button"
            aria-label="Semana siguiente"
          >
            <ChevronRight />
          </Link>
        ) : (
          <span className="nutrition-week-nav-button nutrition-week-nav-disabled">
            <ChevronRight />
          </span>
        )}

      </nav>

      <nav
        className="nutrition-view-switcher"
        aria-label="Vista nutricional"
      >

        <Link
          href={`/nutricion/semanas/${planId}`}
          className={
            !familyView
              ? 'nutrition-view-option nutrition-view-option-active'
              : 'nutrition-view-option'
          }
        >
          <UserRound />

          Mi semana
        </Link>

        <Link
          href={`/nutricion/semanas/${planId}?view=family`}
          className={
            familyView
              ? 'nutrition-view-option nutrition-view-option-active'
              : 'nutrition-view-option'
          }
        >
          <UsersRound />

          Familia
        </Link>

      </nav>

      <section className="nutrition-week-days">

        {detail.days.map(
          (
            dayDetail,
          ) => {

            const dayLabel =
              formatDay(
                dayDetail.day.date,
              );

            const personalProgress =
              dayDetail
                .progressByUser
                .find(
                  ({
                    userId,
                  }) =>
                    userId ===
                    session.user.id,
                ) ??
              null;

            return (
              <details
                key={
                  dayDetail
                    .day
                    .id
                }
                className="nutrition-week-day"
                open={
                  dayDetail
                    .day
                    .date ===
                  today
                }
              >

                <summary className="nutrition-week-day-summary">

                  <div>
                    <strong>
                      {
                        dayLabel
                          .weekday
                      }
                    </strong>

                    <span>
                      {
                        dayLabel
                          .date
                      }
                    </span>
                  </div>

                  {!familyView &&
                    personalProgress && (
                      <NutritionMacroSummary
                        nutrients={
                          personalProgress.planned
                        }
                      />
                    )}

                </summary>

                <div className="nutrition-week-day-content">

                  {dayDetail
                    .meals
                    .length ===
                  0 ? (
                    <div className="nutrition-week-empty">
                      Sin comidas planificadas.
                    </div>
                  ) : (
                    dayDetail
                      .meals
                      .map(
                        (
                          mealDetail,
                        ) => {

                          const personalTotal =
                            mealDetail
                              .totalsByUser
                              .find(
                                ({
                                  userId,
                                }) =>
                                  userId ===
                                  session
                                    .user
                                    .id,
                              );

                          return (
                            <article
                              key={
                                mealDetail
                                  .meal
                                  .id
                              }
                              className="nutrition-week-meal"
                            >

                              <header className="nutrition-week-meal-header">

                                <div>
                                  <strong>
                                    {
                                      mealDetail
                                        .meal
                                        .name
                                    }
                                  </strong>

                                  {mealDetail
                                    .meal
                                    .plannedTime && (
                                      <span>
                                        {
                                          mealDetail
                                            .meal
                                            .plannedTime
                                        }
                                      </span>
                                    )}
                                </div>

                                {!familyView &&
                                  personalTotal && (
                                    <NutritionMacroSummary
                                      nutrients={
                                        personalTotal
                                          .nutrients
                                      }
                                    />
                                  )}

                              </header>

                              <div className="nutrition-week-foods">

                                {mealDetail
                                  .items
                                  .map(
                                    (
                                      itemDetail,
                                    ) => {

                                      if (
                                        !familyView
                                      ) {

                                        const quantity =
                                          itemDetail
                                            .quantities
                                            .find(
                                              ({
                                                userId,
                                              }) =>
                                                userId ===
                                                session
                                                  .user
                                                  .id,
                                            );

                                        if (
                                          !quantity
                                        ) {
                                          return null;
                                        }

                                        return (
                                          <div
                                            key={
                                              itemDetail
                                                .item
                                                .id
                                            }
                                            className="nutrition-week-food-personal"
                                          >
                                            <span>
                                              {
                                                itemDetail
                                                  .food
                                                  .name
                                              }
                                            </span>

                                            <strong>
                                              {formatQuantity(
                                                quantity.quantity,
                                                itemDetail
                                                  .food
                                                  .referenceUnit,
                                              )}
                                            </strong>
                                          </div>
                                        );
                                      }

                                      return (
                                        <div
                                          key={
                                            itemDetail
                                              .item
                                              .id
                                          }
                                          className="nutrition-week-food-family"
                                        >

                                          <strong>
                                            {
                                              itemDetail
                                                .food
                                                .name
                                            }
                                          </strong>

                                          <div>
                                            {itemDetail
                                              .quantities
                                              .map(
                                                (
                                                  quantity,
                                                ) => (
                                                  <div
                                                    key={
                                                      quantity.id
                                                    }
                                                  >
                                                    <span>
                                                      {getPersonName(
                                                        people,
                                                        quantity.userId,
                                                      )}
                                                    </span>

                                                    <strong>
                                                      {formatQuantity(
                                                        quantity.quantity,
                                                        itemDetail
                                                          .food
                                                          .referenceUnit,
                                                      )}
                                                    </strong>
                                                  </div>
                                                ),
                                              )}
                                          </div>

                                        </div>
                                      );
                                    },
                                  )}

                              </div>

                            </article>
                          );
                        },
                      )
                  )}

                  {!familyView &&
                    personalProgress && (
                      <section className="nutrition-day-summary">

                        <div>
                          <span>
                            Total planificado
                          </span>

                          <NutritionMacroSummary
                            nutrients={
                              personalProgress.planned
                            }
                          />
                        </div>

                        {personalProgress.target && (
                          <div>
                            <span>
                              Objetivo
                            </span>

                            <div className="nutrition-week-macros">
                              <span>
                                <strong>
                                  {
                                    personalProgress
                                      .target
                                      .caloriesKcal ??
                                    '—'
                                  }
                                </strong>
                                {' '}kcal
                              </span>

                              <span>
                                P{' '}
                                <strong>
                                  {
                                    personalProgress
                                      .target
                                      .proteinG ??
                                    '—'
                                  }
                                </strong>
                              </span>

                              <span>
                                C{' '}
                                <strong>
                                  {
                                    personalProgress
                                      .target
                                      .carbohydratesG ??
                                    '—'
                                  }
                                </strong>
                              </span>

                              <span>
                                G{' '}
                                <strong>
                                  {
                                    personalProgress
                                      .target
                                      .fatG ??
                                    '—'
                                  }
                                </strong>
                              </span>
                            </div>
                          </div>
                        )}

                      </section>
                    )}

                  {familyView &&
                    dayDetail
                      .dailyTotalsByUser
                      .length >
                      0 && (
                      <section className="nutrition-family-day-totals">

                        <h3>
                          Totales del día
                        </h3>

                        {dayDetail
                          .dailyTotalsByUser
                          .map(
                            (
                              total,
                            ) => (
                              <div
                                key={
                                  total.userId
                                }
                                className="nutrition-family-total-row"
                              >
                                <strong>
                                  {getPersonName(
                                    people,
                                    total.userId,
                                  )}
                                </strong>

                                <NutritionMacroSummary
                                  nutrients={
                                    total.nutrients
                                  }
                                />
                              </div>
                            ),
                          )}

                      </section>
                    )}

                </div>

              </details>
            );
          },
        )}

      </section>

    </main>
  );
}
