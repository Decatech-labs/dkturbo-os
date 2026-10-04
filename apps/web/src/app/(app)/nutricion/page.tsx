import {
  Apple,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  ShoppingBasket,
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
  getNutritionPeople,
  type NutritionNutrientsResponse,
  type NutritionMealItemActualResponse,
} from '../../../lib/nutrition-api';

import {
  NewWeekForm,
} from './new-week-form';

import {
  AddMealForm,
} from './add-meal-form';

import {
  CopyNutritionDayForm,
} from './copy-nutrition-day-form';

import {
  NutritionDayMeals,
} from './nutrition-day-meals';

import {
  CopyNutritionWeekForm,
} from './semanas/[planId]/copy-nutrition-week-form';

export const dynamic =
  'force-dynamic';

interface NutritionPageProps {
  searchParams:
    Promise<{
      date?:
        string;

      user?:
        string;
    }>;
}

const DATE_PATTERN =
  /^\d{4}-\d{2}-\d{2}$/;

const parseDate =
  (
    value:
      string,
  ): Date | null => {

    if (
      !DATE_PATTERN.test(
        value,
      )
    ) {
      return null;
    }

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
      return null;
    }

    const date =
      new Date(
        year,
        month - 1,
        day,
        12,
        0,
        0,
        0,
      );

    if (
      date.getFullYear() !==
        year ||
      date.getMonth() !==
        month - 1 ||
      date.getDate() !==
        day
    ) {
      return null;
    }

    return date;
  };

const formatInputDate =
  (
    date:
      Date,
  ): string => {

    const year =
      date.getFullYear();

    const month =
      String(
        date.getMonth() + 1,
      ).padStart(
        2,
        '0',
      );

    const day =
      String(
        date.getDate(),
      ).padStart(
        2,
        '0',
      );

    return `${year}-${month}-${day}`;
  };

const addDays =
  (
    value:
      string,

    amount:
      number,
  ): string => {

    const date =
      parseDate(
        value,
      );

    if (!date) {
      return value;
    }

    date.setDate(
      date.getDate() +
        amount,
    );

    return formatInputDate(
      date,
    );
  };

const getMonday =
  (
    value:
      string,
  ): string => {

    const date =
      parseDate(
        value,
      );

    if (!date) {
      return value;
    }

    const weekday =
      date.getDay();

    const distance =
      weekday ===
        0
        ? -6
        : 1 -
          weekday;

    date.setDate(
      date.getDate() +
        distance,
    );

    return formatInputDate(
      date,
    );
  };

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

const formatLongDate =
  (
    value:
      string,
  ): string => {

    const date =
      parseDate(
        value,
      );

    if (!date) {
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
        date,
      );
  };

const formatWeekRange =
  (
    start:
      string,

    end:
      string,
  ): string => {

    const startDate =
      parseDate(
        start,
      );

    const endDate =
      parseDate(
        end,
      );

    if (
      !startDate ||
      !endDate
    ) {
      return `${start} — ${end}`;
    }

    const startDay =
      new Intl.DateTimeFormat(
        'es-ES',
        {
          day:
            'numeric',
        },
      ).format(
        startDate,
      );

    const endLabel =
      new Intl.DateTimeFormat(
        'es-ES',
        {
          day:
            'numeric',

          month:
            'long',
        },
      ).format(
        endDate,
      );

    return `${startDay}–${endLabel}`;
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

const formatNutrientValue =
  (
    value:
      number,
  ): string =>
    new Intl.NumberFormat(
      'es-ES',
      {
        maximumFractionDigits:
          1,
      },
    ).format(
      value,
    );

const getConsumptionPercentage =
  (
    actual:
      number,

    planned:
      number,
  ): number => {

    if (
      planned <=
      0
    ) {
      return actual >
        0
        ? 100
        : 0;
    }

    return Math.min(
      100,
      Math.max(
        0,
        (
          actual /
          planned
        ) *
          100,
      ),
    );
  };

const getDifferenceLabel =
  (
    actual:
      number,

    planned:
      number,

    unit:
      string,
  ): string => {

    const difference =
      actual -
      planned;

    if (
      Math.abs(
        difference,
      ) <
      0.05
    ) {
      return 'Sin diferencia';
    }

    const absoluteDifference =
      formatNutrientValue(
        Math.abs(
          difference,
        ),
      );

    return difference >
      0
      ? `+${absoluteDifference} ${unit} vs plan`
      : `-${absoluteDifference} ${unit} vs plan`;
  };

const buildWeekDates =
  (
    startDate:
      string,
  ): string[] => {

    const start =
      parseDate(
        startDate,
      );

    if (!start) {
      return [];
    }

    return Array.from(
      {
        length:
          7,
      },
      (
        _,
        index,
      ) => {

        const day =
          new Date(
            start,
          );

        day.setDate(
          day.getDate() +
            index,
        );

        return formatInputDate(
          day,
        );
      },
    );
  };

const formatWeekday =
  (
    date:
      string,
  ): string => {

    const value =
      parseDate(
        date,
      );

    if (!value) {
      return '';
    }

    return new Intl
      .DateTimeFormat(
        'es-ES',
        {
          weekday:
            'short',
        },
      )
      .format(
        value,
      )
      .replace(
        '.',
        '',
      )
      .slice(
        0,
        1,
      )
      .toUpperCase();
  };

const formatDayNumber =
  (
    date:
      string,
  ): string => {

    const value =
      parseDate(
        date,
      );

    return value
      ? String(
          value.getDate(),
        )
      : '';
  };

export default async function NutritionPage({
  searchParams,
}: NutritionPageProps) {

  await requireAccessPermission(
    'app.nutrition.access',
  );

  const [
    session,
    plans,
    query,
    people,
  ] =
    await Promise.all([
      requireCurrentSession(),
      getNutritionPlans(),
      searchParams,
      getNutritionPeople(),
    ]);

  const today =
    getTodayDate();

  const accessiblePeople =
    people;

  const activePerson =
    accessiblePeople.find(
      person =>
        person.id ===
        query.user,
    ) ??
    accessiblePeople.find(
      person =>
        person.id ===
        session.user.id,
    ) ??
    accessiblePeople[0] ??
    null;

  const activeUserId =
    activePerson?.id ??
    session.user.id;

  const canManageActivePerson =
    activePerson?.accessRole ===
      'SELF' ||
    activePerson?.accessRole ===
      'MANAGER';

  const readOnly =
    !canManageActivePerson;

  const manageablePeople =
    accessiblePeople.filter(
      person =>
        person.accessRole ===
          'SELF' ||
        person.accessRole ===
          'MANAGER',
    );

  const buildTodayHref =
    (
      date?:
        string,
    ): string => {

      const params =
        new URLSearchParams();

      if (
        date &&
        date !==
          today
      ) {
        params.set(
          'date',
          date,
        );
      }

      if (
        activeUserId !==
        session.user.id
      ) {
        params.set(
          'user',
          activeUserId,
        );
      }

      const queryString =
        params.toString();

      return queryString
        ? `/nutricion?${queryString}`
        : '/nutricion';
    };

  const requestedDate =
    query.date &&
    parseDate(
      query.date,
    )
      ? query.date
      : today;

  const currentPlan =
    plans.find(
      plan =>
        plan.startDate <=
          requestedDate &&
        plan.endDate >=
          requestedDate,
    ) ??
    null;

  const requestedWeekStart =
    getMonday(
      requestedDate,
    );

  const requestedWeekEnd =
    addDays(
      requestedWeekStart,
      6,
    );

  const previousPlan =
    [...plans]
      .filter(
        plan =>
          plan.endDate <
          requestedWeekStart,
      )
      .sort(
        (
          a,
          b,
        ) =>
          b.startDate.localeCompare(
            a.startDate,
          ),
      )[0] ??
    null;

  if (!currentPlan) {
    return (
      <main className="app-page nutrition-home-page">

        <header className="app-page-header nutrition-home-header">

          <div className="nutrition-home-title">

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

              <span>
                Semana{' '}
                {formatWeekRange(
                  requestedWeekStart,
                  requestedWeekEnd,
                )}
              </span>
            </div>

          </div>

        </header>

        <nav
          className="nutrition-primary-nav"
          aria-label="Secciones de Nutrición"
        >
          <Link
            href={
              buildTodayHref(
                requestedDate,
              )
            }
            className="nutrition-primary-nav-active"
          >
            Hoy
          </Link>

          <span
            className="nutrition-primary-nav-disabled"
            title="Crea esta semana para abrir la vista semanal"
          >
            Semana
          </span>

          <span
            className="nutrition-primary-nav-disabled"
            title="Disponible próximamente"
          >
            <ShoppingBasket />
            Compra
          </span>

          <span
            className="nutrition-primary-nav-disabled"
            title="Crea esta semana para abrir la vista familiar"
          >
            <UsersRound />
            Familia
          </span>
        </nav>

        <section className="nutrition-week-strip">

          <div className="nutrition-week-strip-heading">

            <Link
              href={
                buildTodayHref(
                  addDays(
                    requestedDate,
                    -1,
                  ),
                )
              }
              aria-label="Día anterior"
            >
              <ChevronLeft />
            </Link>

            <strong>
              {requestedDate ===
              today
                ? 'Hoy'
                : formatLongDate(
                    requestedDate,
                  )}
            </strong>

            <Link
              href={
                buildTodayHref(
                  addDays(
                    requestedDate,
                    1,
                  ),
                )
              }
              aria-label="Día siguiente"
            >
              <ChevronRight />
            </Link>

          </div>

          <div className="nutrition-week-days-strip">

            {buildWeekDates(
              requestedWeekStart,
            ).map(
              date => {

                const selected =
                  date ===
                  requestedDate;

                const isToday =
                  date ===
                  today;

                return (
                  <Link
                    key={
                      date
                    }
                    href={
                      buildTodayHref(
                        date,
                      )
                    }
                    className={[
                      'nutrition-week-day-button',
                      selected
                        ? 'nutrition-week-day-button-selected'
                        : '',
                      isToday
                        ? 'nutrition-week-day-button-today'
                        : '',
                    ]
                      .filter(
                        Boolean,
                      )
                      .join(
                        ' ',
                      )}
                    aria-current={
                      selected
                        ? 'date'
                        : undefined
                    }
                  >
                    <span>
                      {formatWeekday(
                        date,
                      )}
                    </span>

                    <strong>
                      {formatDayNumber(
                        date,
                      )}
                    </strong>
                  </Link>
                );
              },
            )}

          </div>

        </section>

        <section className="nutrition-home-empty">

          <div className="training-empty-icon">
            <Apple />
          </div>

          <div>
            <strong>
              Esta semana todavía no tiene planificación
            </strong>

            <span>
              {formatWeekRange(
                requestedWeekStart,
                requestedWeekEnd,
              )}
              . Puedes crearla vacía o copiar la planificación de la semana anterior.
            </span>
          </div>

          <div className="nutrition-empty-week-actions">

            <NewWeekForm
              today={
                requestedWeekStart
              }
            />

            {previousPlan &&
              activePerson &&
              canManageActivePerson && (
                <CopyNutritionWeekForm
                  sourcePlanId={
                    previousPlan.id
                  }
                  sourceWeekStart={
                    previousPlan.startDate
                  }
                  sourceUserId={
                    activeUserId
                  }
                  sourceUserName={
                    activePerson.name
                  }
                  people={
                    manageablePeople
                  }
                  existingWeekStarts={
                    plans.map(
                      plan =>
                        plan.startDate,
                    )
                  }
                  sessionUserId={
                    session.user.id
                  }
                />
              )}

          </div>

        </section>

      </main>
    );
  }

  const weekHref =
    activeUserId ===
    session.user.id
      ? `/nutricion/semanas/${currentPlan.id}`
      : `/nutricion/semanas/${currentPlan.id}?user=${encodeURIComponent(
          activeUserId,
        )}`;

  const detail =
    await getNutritionPlanDetail(
      currentPlan.id,
    );

  const selectedDate =
    requestedDate >=
      currentPlan.startDate &&
    requestedDate <=
      currentPlan.endDate
      ? requestedDate
      : currentPlan.startDate;

  const selectedDay =
    detail.days.find(
      ({
        day,
      }) =>
        day.date ===
        selectedDate,
    ) ??
    detail.days[0] ??
    null;

  const personalProgress =
    selectedDay
      ?.progressByUser
      .find(
        ({
          userId,
        }) =>
          userId ===
          activeUserId
      ) ??
    null;

  const planned =
    personalProgress
      ?.planned ??
    emptyNutrients();

  const actual =
    personalProgress
      ?.actual ??
    emptyNutrients();

  const nutrientSummary = [
    {
      key:
        'protein',

      label:
        'Proteína',

      planned:
        planned.proteinG,

      actual:
        actual.proteinG,

      unit:
        'g',
    },
    {
      key:
        'carbohydrates',

      label:
        'Carbohidratos',

      planned:
        planned.carbohydratesG,

      actual:
        actual.carbohydratesG,

      unit:
        'g',
    },
    {
      key:
        'fat',

      label:
        'Grasas',

      planned:
        planned.fatG,

      actual:
        actual.fatG,

      unit:
        'g',
    },
    {
      key:
        'fiber',

      label:
        'Fibra',

      planned:
        planned.fiberG,

      actual:
        actual.fiberG,

      unit:
        'g',
    },
  ] as const;

  const personalActualByMealItemId =
    new Map<
      string,
      NutritionMealItemActualResponse
    >();

  for (
    const actual of
      selectedDay?.actuals ??
      []
  ) {
    if (
      actual.userId ===
        activeUserId &&
      actual.mealItemId !==
        null
    ) {
      personalActualByMealItemId.set(
        actual.mealItemId,
        actual,
      );
    }
  }

  const personalMeals =
  selectedDay
    ? [...selectedDay.meals]
        .sort(
          (
            a,
            b,
          ) => {

            const aTime =
              a.meal.plannedTime;

            const bTime =
              b.meal.plannedTime;

            if (
              aTime !== null &&
              bTime !== null &&
              aTime !== bTime
            ) {
              return aTime.localeCompare(
                bTime,
              );
            }

            if (
              aTime !== null
            ) {
              return -1;
            }

            if (
              bTime !== null
            ) {
              return 1;
            }

            return (
              a.meal.position -
              b.meal.position
            );
          },
        )
        .map(
          mealDetail => ({
            ...mealDetail,

            totalItemCount:
              mealDetail.items.length,

            items:
              mealDetail.items
                .map(
                  itemDetail => {

                    const quantity =
                      itemDetail
                        .quantities
                        .find(
                          ({
                            userId,
                          }) =>
                            userId ===
                            activeUserId
                        );

                    return quantity
                      ? {
                          ...itemDetail,

                          personalQuantity:
                            quantity.quantity,

                          actual:
                            personalActualByMealItemId.get(
                              itemDetail.item.id,
                            ) ??
                            null,
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
    : [];

  const weekDates =
    buildWeekDates(
      currentPlan.startDate,
    );

  const previousDate =
    addDays(
      selectedDate,
      -1,
    );

  const nextDate =
    addDays(
      selectedDate,
      1,
    );

  return (
    <main className="app-page nutrition-home-page">

      <header className="app-page-header nutrition-home-header">

        <div className="nutrition-home-title">

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

            <span>
              Semana{' '}
              {formatWeekRange(
                currentPlan.startDate,
                currentPlan.endDate,
              )}
            </span>
          </div>

        </div>

        <details className="nutrition-week-menu">

          <summary
            aria-label="Opciones de la semana"
          >
            ···
          </summary>

          <div className="nutrition-week-menu-popover">

            <NewWeekForm
              today={
                today
              }
            />

          </div>

        </details>

      </header>

      <nav
        className="nutrition-primary-nav"
        aria-label="Secciones de Nutrición"
      >

        <Link
          href={
            buildTodayHref()
          }
          className="nutrition-primary-nav-active"
        >
          Hoy
        </Link>

        <Link
          href={
            weekHref
          }
        >
          Semana
        </Link>

        <span
          className="nutrition-primary-nav-disabled"
          title="Disponible próximamente"
        >
          <ShoppingBasket />
          Compra
        </span>

        <Link
          href={`/nutricion/semanas/${currentPlan.id}?view=family`}
        >
          <UsersRound />
          Familia
        </Link>

      </nav>

      {accessiblePeople.length >
        1 && (
        <nav
          className="nutrition-person-switcher"
          aria-label="Persona cuya nutrición estás gestionando"
        >
          {accessiblePeople.map(
            person => {

              const selected =
                person.id ===
                activeUserId;

              const buildPersonHref =
              (
                userId:
                  string,
              ): string => {

                const params =
                  new URLSearchParams();

                if (
                  selectedDate !==
                  today
                ) {
                  params.set(
                    'date',
                    selectedDate,
                  );
                }

                if (
                  userId !==
                  session.user.id
                ) {
                  params.set(
                    'user',
                    userId,
                  );
                }

                const queryString =
                  params.toString();

                return queryString
                  ? `/nutricion?${queryString}`
                  : '/nutricion';
              };

              return (
                <Link
                  key={
                    person.id
                  }
                  href={
                    buildPersonHref(
                      person.id,
                    )
                  }
                  className={
                    selected
                      ? 'nutrition-person-option nutrition-person-option-active'
                      : 'nutrition-person-option'
                  }
                  aria-current={
                    selected
                      ? 'page'
                      : undefined
                  }
                >
                  {
                    person.id ===
                    session.user.id
                      ? 'Yo'
                      : person.name
                  }
                </Link>
              );
            },
          )}
        </nav>
      )}

      {readOnly && (
        <div
          className="nutrition-read-only-notice"
          role="status"
        >
          Solo lectura · Puedes consultar esta planificación, pero no modificarla.
        </div>
      )}

      <section className="nutrition-week-strip">

        <div className="nutrition-week-strip-heading">

          <Link
            href={
              buildTodayHref(
                previousDate,
              )
            }
            aria-label="Día anterior"
          >
            <ChevronLeft />
          </Link>

          <strong>
            {selectedDate ===
            today
              ? 'Hoy'
              : formatLongDate(
                  selectedDate,
                )}
          </strong>

          <Link
            href={
              buildTodayHref(
                nextDate,
              )
            }
            aria-label="Día siguiente"
          >
            <ChevronRight />
          </Link>

        </div>

        <div className="nutrition-week-days-strip">

          {weekDates.map(
            (
              date,
            ) => {

              const selected =
                date ===
                selectedDate;

              const isToday =
                date ===
                today;

              return (
                <Link
                  key={
                    date
                  }
                  href={
                    buildTodayHref(
                      date,
                    )
                  }
                  className={[
                    'nutrition-week-day-button',
                    selected
                      ? 'nutrition-week-day-button-selected'
                      : '',
                    isToday
                      ? 'nutrition-week-day-button-today'
                      : '',
                  ]
                    .filter(
                      Boolean,
                    )
                    .join(
                      ' ',
                    )}
                  aria-current={
                    selected
                      ? 'date'
                      : undefined
                  }
                >
                  <span>
                    {formatWeekday(
                      date,
                    )}
                  </span>

                  <strong>
                    {formatDayNumber(
                      date,
                    )}
                  </strong>
                </Link>
              );
            },
          )}

        </div>

      </section>

      <section className="nutrition-day-feed">

        <header className="nutrition-day-feed-heading">

          <div>
            <span>
              {selectedDate ===
              today
                ? 'Hoy'
                : 'Plan del día'}
            </span>

            <h2>
              {formatLongDate(
                selectedDate,
              )}
            </h2>
          </div>

          {selectedDay &&
            !readOnly &&
            selectedDay.meals.length >
              0 && (
              <CopyNutritionDayForm
                sourcePlanId={
                  currentPlan.id
                }
                sourceDayId={
                  selectedDay.day.id
                }
                sourceDate={
                  selectedDay.day.date
                }
                sourceUserId={
                  activeUserId
                }
                sourceUserName={
                  activePerson?.name ??
                  'Usuario'
                }
                people={
                  manageablePeople
                }
                plans={
                  plans
                }
                sessionUserId={
                  session.user.id
                }
              />
            )}

          {selectedDay &&
            !readOnly && (
            <AddMealForm
              dayId={
                selectedDay.day.id
              }
              position={
                selectedDay
                  .meals
                  .length
              }
              compact={
                personalMeals.length >
                0
              }
            />
          )}

        </header>

        {personalMeals.length >
          0 ? (
            <NutritionDayMeals
              meals={
                personalMeals
              }
              people={
                accessiblePeople
              }
              userId={
                activeUserId
              }
              readOnly={
                readOnly
              }
            />
          ) : (
            <section className="nutrition-day-empty">

              <div className="nutrition-day-empty-icon">
                <Apple />
              </div>

              <div>
                <strong>
                  No hay comidas planificadas
                </strong>

                <span>
                  Este día todavía está vacío.
                </span>
              </div>

            </section>
          )}

      </section>

      <section className="nutrition-day-summary-card">

        <header className="nutrition-day-summary-header">

          <div>
            <span>
              Consumido real
            </span>

            <strong>
              {formatNutrientValue(
                actual.caloriesKcal,
              )}{' '}
              kcal
            </strong>
          </div>

          <div className="nutrition-day-summary-energy-target">

            <span>
              de{' '}
              {formatNutrientValue(
                planned.caloriesKcal,
              )}{' '}
              kcal planificadas
            </span>

            <small>
              {getDifferenceLabel(
                actual.caloriesKcal,
                planned.caloriesKcal,
                'kcal',
              )}
            </small>

          </div>

        </header>

        <div
          className={[
            'nutrition-day-summary-energy-progress',

            actual.caloriesKcal >
              planned.caloriesKcal
              ? 'nutrition-day-summary-energy-progress-over'
              : '',
          ]
            .filter(
              Boolean,
            )
            .join(
              ' ',
            )}
          aria-hidden="true"
        >
          <span
            style={{
              width:
                `${getConsumptionPercentage(
                  actual.caloriesKcal,
                  planned.caloriesKcal,
                )}%`,
            }}
          />
        </div>

        <div className="nutrition-day-summary-grid">

          {nutrientSummary.map(
            nutrient => {

              const progress =
                getConsumptionPercentage(
                  nutrient.actual,
                  nutrient.planned,
                );

              const overPlan =
                nutrient.actual >
                nutrient.planned;

              return (
                <div
                  key={
                    nutrient.key
                  }
                  className={[
                    'nutrition-day-summary-item',

                    overPlan
                      ? 'nutrition-day-summary-item-over'
                      : '',
                  ]
                    .filter(
                      Boolean,
                    )
                    .join(
                      ' ',
                    )}
                >

                  <header>
                    <span>
                      {
                        nutrient.label
                      }
                    </span>

                    <strong>
                      {formatNutrientValue(
                        nutrient.actual,
                      )}{' '}
                      {
                        nutrient.unit
                      }
                    </strong>
                  </header>

                  <div className="nutrition-day-summary-item-meta">

                    <span>
                      de{' '}
                      {formatNutrientValue(
                        nutrient.planned,
                      )}{' '}
                      {
                        nutrient.unit
                      }{' '}
                      planificados
                    </span>

                    <small>
                      {getDifferenceLabel(
                        nutrient.actual,
                        nutrient.planned,
                        nutrient.unit,
                      )}
                    </small>

                  </div>

                  <div
                    className="nutrition-day-summary-item-progress"
                    aria-hidden="true"
                  >
                    <span
                      style={{
                        width:
                          `${progress}%`,
                      }}
                    />
                  </div>

                </div>
              );
            },
          )}

        </div>

      </section>

    </main>
  );
}
