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
  type NutritionFoodPreparationConversionResponse,
  type NutritionFoodResponse,
  type NutritionMealItemDetailResponse,
  type NutritionNutrientsResponse,
  type NutritionPersonResponse,
} from '../../../../../lib/nutrition-api';

import {
  NutritionWeekExport,
} from './nutrition-week-export';

import {
  CopyNutritionWeekForm,
} from './copy-nutrition-week-form';

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

      user?:
        string;

      users?:
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

  const accessiblePeople =
    people;

  const manageablePeople =
    accessiblePeople.filter(
      person =>
        person.accessRole ===
          'SELF' ||
        person.accessRole ===
          'MANAGER',
    );

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

  const activePersonName =
    activePerson?.id ===
    session.user.id
      ? 'Mi semana'
      : activePerson?.name ??
        'Semana';

  const exportPersonName =
    activePerson?.name ??
    session.user.name;

  const requestedFamilyUserIds =
    query.users
      ?.split(',')
      .map(
        value =>
          value.trim(),
      )
      .filter(Boolean) ??
    [];

  const requestedFamilyUserIdSet =
    new Set(
      requestedFamilyUserIds,
    );

  const validRequestedFamilyPeople =
    accessiblePeople.filter(
      person =>
        requestedFamilyUserIdSet.has(
          person.id,
        ),
    );

  const selectedFamilyPeople =
    validRequestedFamilyPeople.length >
    0
      ? validRequestedFamilyPeople
      : accessiblePeople;

  const selectedFamilyUserIds =
    selectedFamilyPeople.map(
      person =>
        person.id,
    );

  const selectedFamilyUserIdSet =
    new Set(
      selectedFamilyUserIds,
    );

  const buildFamilyHref =
    (
      targetPlanId:
        string,

      userIds:
        string[] =
        selectedFamilyUserIds,
    ): string => {

      const params =
        new URLSearchParams();

      params.set(
        'view',
        'family',
      );

      const normalizedUserIds =
        accessiblePeople
          .filter(
            person =>
              userIds.includes(
                person.id,
              ),
          )
          .map(
            person =>
              person.id,
          );

      if (
        normalizedUserIds.length !==
        accessiblePeople.length
      ) {
        params.set(
          'users',
          normalizedUserIds.join(
            ',',
          ),
        );
      }

      return `/nutricion/semanas/${targetPlanId}?${params.toString()}`;
    };

  type WeekItemDetail =
    NutritionMealItemDetailResponse;

  type WeekFood =
    NutritionFoodResponse;

  type WeekPreparation =
    NutritionFoodPreparationConversionResponse;

  interface FamilyFoodPersonQuantity {
    userId:
      string;

    quantity:
      number;
  }

  interface FamilyFoodGroup {
    key:
      string;

    food:
      WeekFood;

    preparation:
      WeekPreparation | null;

    rawQuantity:
      number;

    quantities:
      FamilyFoodPersonQuantity[];
  }

  const buildFamilyGroups =
    (
      items:
        WeekItemDetail[],
    ): FamilyFoodGroup[] => {

      const groups =
        new Map<
          string,
          {
            key:
              string;

            food:
              WeekFood;

            preparation:
              WeekPreparation | null;

            rawQuantity:
              number;

            quantitiesByUser:
              Map<
                string,
                number
              >;
          }
        >();

      for (
        const itemDetail
        of items
      ) {

        const preparation =
          itemDetail
            .preparation
            ?.conversion ??
          null;

        const quantities =
          itemDetail
            .quantities
            .filter(
              quantity =>
                selectedFamilyUserIdSet.has(
                  quantity.userId,
                ),
            );

        if (
          quantities.length ===
          0
        ) {
          continue;
        }

        const key =
          [
            itemDetail
              .food
              .id,

            itemDetail
              .food
              .referenceUnit,

            preparation
              ?.id ??
              'NO_PREPARATION',
          ].join(
            '::',
          );

        let group =
          groups.get(
            key,
          );

        if (
          !group
        ) {
          group = {
            key,
            food:
              itemDetail.food,
            preparation,
            rawQuantity:
              0,
            quantitiesByUser:
              new Map<
                string,
                number
              >(),
          };

          groups.set(
            key,
            group,
          );
        }

        for (
          const quantity
          of quantities
        ) {

          group.rawQuantity +=
            quantity.quantity;

          group.quantitiesByUser.set(
            quantity.userId,
            (
              group
                .quantitiesByUser
                .get(
                  quantity.userId,
                ) ??
              0
            ) +
              quantity.quantity,
          );
        }
      }

      return Array
        .from(
          groups.values(),
        )
        .map(
          group => ({
            key:
              group.key,

            food:
              group.food,

            preparation:
              group.preparation,

            rawQuantity:
              group.rawQuantity,

            quantities:
              selectedFamilyPeople
                .map(
                  person => ({
                    userId:
                      person.id,

                    quantity:
                      group
                        .quantitiesByUser
                        .get(
                          person.id,
                        ) ??
                      0,
                  }),
                )
                .filter(
                  quantity =>
                    quantity.quantity >
                    0,
                ),
          }),
        );
    };

  const buildWeekHref =
    (
      targetPlanId:
        string,
    ): string => {

      if (
        activeUserId ===
        session.user.id
      ) {
        return `/nutricion/semanas/${targetPlanId}`;
      }

      return `/nutricion/semanas/${targetPlanId}?user=${encodeURIComponent(
        activeUserId,
      )}`;
    };

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
          href={
            activeUserId ===
            session.user.id
              ? '/nutricion'
              : `/nutricion?user=${encodeURIComponent(
                  activeUserId,
                )}`
          }
          className="system-back"
          aria-label="Volver a Nutrición"
        >
          <ArrowLeft />
        </Link>

        <div className="nutrition-week-header-main">

          <div>
            <h1>
              {
                detail.plan.title
              }
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

          {!familyView &&
          activePerson && (
            <CopyNutritionWeekForm
              sourcePlanId={
                detail.plan.id
              }
              sourceWeekStart={
                detail.plan.startDate
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

          {!familyView && (
            <NutritionWeekExport
              planId={
                planId
              }
              personId={
                activeUserId
              }
              personName={
                exportPersonName
              }
              weekStart={
                detail.plan.startDate
              }
            />
          )}

        </div>

      </header>

      <nav
        className="nutrition-week-navigation"
        aria-label="Navegación entre semanas"
      >

        {previousPlan ? (
          <Link
            href={
              familyView
                ? buildFamilyHref(
                    previousPlan.id,
                  )
                : buildWeekHref(
                    previousPlan.id,
                  )
            }
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
            href={
              familyView
                ? buildFamilyHref(
                    nextPlan.id,
                  )
                : buildWeekHref(
                    nextPlan.id,
                  )
            }
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
          href={
            buildWeekHref(
              planId,
            )
          }
          className={
            !familyView
              ? 'nutrition-view-option nutrition-view-option-active'
              : 'nutrition-view-option'
          }
        >
          <UserRound />

          {activePersonName}
        </Link>

        <Link
          href={
            buildFamilyHref(
              planId,
            )
          }
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

      {!familyView &&
        accessiblePeople.length >
          1 && (
          <nav
            className="nutrition-person-switcher"
            aria-label="Persona cuya semana estás viendo"
          >
            {accessiblePeople.map(
              person => {

                const selected =
                  person.id ===
                  activeUserId;

                return (
                  <Link
                    key={
                      person.id
                    }
                    href={
                      person.id ===
                      session.user.id
                        ? `/nutricion/semanas/${planId}`
                        : `/nutricion/semanas/${planId}?user=${encodeURIComponent(
                            person.id,
                          )}`
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

      {familyView && (
        <section className="nutrition-family-people">

          <div className="nutrition-family-people-heading">
            <div>
              <span>
                Personas incluidas
              </span>

              <strong>
                {
                  selectedFamilyPeople
                    .length
                }{' '}
                {
                  selectedFamilyPeople
                    .length ===
                  1
                    ? 'persona'
                    : 'personas'
                }
              </strong>
            </div>

            <small>
              La preparación se calcula solo para las personas seleccionadas.
            </small>
          </div>

          <div className="nutrition-family-people-options">

            {accessiblePeople.map(
              person => {

                const selected =
                  selectedFamilyUserIdSet.has(
                    person.id,
                  );

                const nextUserIds =
                  selected
                    ? selectedFamilyUserIds
                        .filter(
                          userId =>
                            userId !==
                            person.id,
                        )
                    : [
                        ...selectedFamilyUserIds,
                        person.id,
                      ];

                const cannotRemove =
                  selected &&
                  selectedFamilyUserIds.length ===
                    1;

                return (
                  <Link
                    key={
                      person.id
                    }
                    href={
                      cannotRemove
                        ? buildFamilyHref(
                            planId,
                          )
                        : buildFamilyHref(
                            planId,
                            nextUserIds,
                          )
                    }
                    className={
                      selected
                        ? 'nutrition-family-person-option nutrition-family-person-option-active'
                        : 'nutrition-family-person-option'
                    }
                    aria-current={
                      selected
                        ? 'true'
                        : undefined
                    }
                    aria-disabled={
                      cannotRemove
                        ? true
                        : undefined
                    }
                  >
                    <span className="nutrition-family-person-check">
                      {selected
                        ? '✓'
                        : ''}
                    </span>

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

          </div>

        </section>
      )}

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
                    activeUserId
                ) ??
              null;

            const familyDayGroups =
              familyView
                ? buildFamilyGroups(
                    dayDetail
                      .meals
                      .flatMap(
                        meal =>
                          meal.items,
                      ),
                  )
                : [];

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

                  {familyView ? (
                    <span className="nutrition-family-day-count">
                      {
                        selectedFamilyPeople
                          .length
                      }{' '}
                      {
                        selectedFamilyPeople
                          .length ===
                        1
                          ? 'persona'
                          : 'personas'
                      }
                    </span>

                  ) : (
                    personalProgress && (
                      <NutritionMacroSummary
                        nutrients={
                          personalProgress.planned
                        }
                      />
                    )
                  )}

                </summary>

                <div className="nutrition-week-day-content">

                  {familyView && (
                    <section className="nutrition-family-preparation">

                      <header className="nutrition-family-section-heading">
                        <div>
                          <span>
                            Preparación del día
                          </span>

                          <strong>
                            Todo lo que hay que preparar
                          </strong>
                        </div>
                      </header>

                      {familyDayGroups.length ===
                      0 ? (

                        <div className="nutrition-family-empty">
                          No hay alimentos planificados para las personas seleccionadas.
                        </div>

                      ) : (

                        <div className="nutrition-family-preparation-grid">

                          {familyDayGroups.map(
                            group => {

                              const preparedQuantity =
                                group.preparation
                                  ? (
                                      group.rawQuantity *
                                      group
                                        .preparation
                                        .preparedAmount
                                    ) /
                                    group
                                      .preparation
                                      .rawAmount
                                  : null;

                              return (
                                <article
                                  key={
                                    group.key
                                  }
                                  className="nutrition-family-preparation-card"
                                >

                                  <div className="nutrition-family-food-heading">

                                    <div>
                                      <strong>
                                        {
                                          group
                                            .food
                                            .name
                                        }
                                      </strong>

                                      {group
                                        .food
                                        .brand && (
                                        <small>
                                          {
                                            group
                                              .food
                                              .brand
                                          }
                                        </small>
                                      )}
                                    </div>

                                    {group.preparation && (
                                      <span>
                                        {
                                          group
                                            .preparation
                                            .name
                                        }
                                      </span>
                                    )}

                                  </div>

                                  <div className="nutrition-family-preparation-amount">

                                    <strong>
                                      {formatQuantity(
                                        group.rawQuantity,
                                        group
                                          .food
                                          .referenceUnit,
                                      )}

                                      {group.preparation
                                        ? ' crudo'
                                        : ''}
                                    </strong>

                                    {group.preparation &&
                                      preparedQuantity !==
                                        null && (
                                      <span>
                                        ≈{' '}
                                        {formatQuantity(
                                          preparedQuantity,
                                          group
                                            .preparation
                                            .preparedUnit,
                                        )}{' '}
                                        {group
                                          .preparation
                                          .name
                                          .toLocaleLowerCase(
                                            'es-ES',
                                          )}
                                      </span>
                                    )}

                                  </div>

                                  <small className="nutrition-family-preparation-people">
                                    {
                                      group
                                        .quantities
                                        .length
                                    }{' '}
                                    {
                                      group
                                        .quantities
                                        .length ===
                                      1
                                        ? 'persona'
                                        : 'personas'
                                    }
                                  </small>

                                </article>
                              );
                            },
                          )}

                        </div>
                      )}

                    </section>
                  )}

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

                          const familyMealGroups =
                            familyView
                              ? buildFamilyGroups(
                                  mealDetail.items,
                                )
                              : [];

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

                              </header>

                              <div className="nutrition-week-foods">

                                {familyView ? (

                                  familyMealGroups.length ===
                                  0 ? (

                                    <div className="nutrition-family-meal-empty">
                                      Ningún alimento para las personas seleccionadas.
                                    </div>

                                  ) : (

                                    familyMealGroups.map(
                                      group => {

                                        const preparedQuantity =
                                          group.preparation
                                            ? (
                                                group.rawQuantity *
                                                group
                                                  .preparation
                                                  .preparedAmount
                                              ) /
                                              group
                                                .preparation
                                                .rawAmount
                                            : null;

                                        return (
                                          <div
                                            key={
                                              group.key
                                            }
                                            className="nutrition-family-meal-food"
                                          >

                                            <div className="nutrition-family-meal-food-main">

                                              <div className="nutrition-family-food-heading">

                                                <div>
                                                  <strong>
                                                    {
                                                      group
                                                        .food
                                                        .name
                                                    }
                                                  </strong>

                                                  {group
                                                    .food
                                                    .brand && (
                                                    <small>
                                                      {
                                                        group
                                                          .food
                                                          .brand
                                                      }
                                                    </small>
                                                  )}
                                                </div>

                                                {group.preparation && (
                                                  <span>
                                                    {
                                                      group
                                                        .preparation
                                                        .name
                                                    }
                                                  </span>
                                                )}

                                              </div>

                                              <div className="nutrition-family-meal-total">

                                                <strong>
                                                  {formatQuantity(
                                                    group.rawQuantity,
                                                    group
                                                      .food
                                                      .referenceUnit,
                                                  )}

                                                  {group.preparation
                                                    ? ' crudo'
                                                    : ''}
                                                </strong>

                                                {group.preparation &&
                                                  preparedQuantity !==
                                                    null && (
                                                  <span>
                                                    ≈{' '}
                                                    {formatQuantity(
                                                      preparedQuantity,
                                                      group
                                                        .preparation
                                                        .preparedUnit,
                                                    )}{' '}
                                                    {group
                                                      .preparation
                                                      .name
                                                      .toLocaleLowerCase(
                                                        'es-ES',
                                                      )}
                                                  </span>
                                                )}

                                              </div>

                                            </div>

                                            <div className="nutrition-family-person-breakdown">

                                              {group
                                                .quantities
                                                .map(
                                                  quantity => (
                                                    <span
                                                      key={
                                                        quantity.userId
                                                      }
                                                    >
                                                      <strong>
                                                        {getPersonName(
                                                          people,
                                                          quantity.userId,
                                                        )}
                                                      </strong>

                                                      {' · '}

                                                      {formatQuantity(
                                                        quantity.quantity,
                                                        group
                                                          .food
                                                          .referenceUnit,
                                                      )}
                                                    </span>
                                                  ),
                                                )}

                                            </div>

                                          </div>
                                        );
                                      },
                                    )

                                  )

                                ) : (

                                  mealDetail
                                    .items
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
                                                activeUserId,
                                            );

                                        if (
                                          !quantity
                                        ) {
                                          return null;
                                        }

                                        const preparation =
                                          itemDetail
                                            .preparation
                                            ?.conversion ??
                                          null;

                                        const preparedQuantity =
                                          preparation
                                            ? (
                                                quantity.quantity *
                                                preparation.preparedAmount
                                              ) /
                                              preparation.rawAmount
                                            : null;

                                        return (
                                          <div
                                            key={
                                              itemDetail
                                                .item
                                                .id
                                            }
                                            className="nutrition-week-food-personal"
                                          >

                                            <div className="nutrition-week-food-copy">

                                              <strong className="nutrition-week-food-name">
                                                {
                                                  itemDetail
                                                    .food
                                                    .name
                                                }
                                              </strong>

                                              {itemDetail
                                                .food
                                                .brand && (
                                                <span className="nutrition-week-food-brand">
                                                  {
                                                    itemDetail
                                                      .food
                                                      .brand
                                                  }
                                                </span>
                                              )}

                                            </div>

                                            <div className="nutrition-week-food-amounts">

                                              <strong>
                                                {formatQuantity(
                                                  quantity.quantity,
                                                  itemDetail
                                                    .food
                                                    .referenceUnit,
                                                )}

                                                {preparation
                                                  ? ' crudo'
                                                  : ''}
                                              </strong>

                                              {preparation &&
                                                preparedQuantity !==
                                                  null && (
                                                <span className="nutrition-week-food-prepared">
                                                  ≈{' '}
                                                  {formatQuantity(
                                                    preparedQuantity,
                                                    preparation
                                                      .preparedUnit,
                                                  )}{' '}
                                                  {preparation
                                                    .name
                                                    .toLocaleLowerCase(
                                                      'es-ES',
                                                    )}
                                                </span>
                                              )}

                                            </div>

                                          </div>
                                        );
                                      },
                                    )

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

                        <div className="nutrition-week-day-total-heading">
                          <span>
                            Total del día
                          </span>

                          {personalProgress.target && (
                            <small>
                              Planificado / objetivo
                            </small>
                          )}
                        </div>

                        {personalProgress.target ? (

                          <div className="nutrition-week-day-targets">

                            <span>
                              <strong>
                                {formatNumber(
                                  personalProgress
                                    .planned
                                    .caloriesKcal,
                                )}
                              </strong>

                              <small>
                                {' / '}
                                {personalProgress
                                  .target
                                  .caloriesKcal ??
                                  '—'} kcal
                              </small>
                            </span>

                            <span>
                              P{' '}

                              <strong>
                                {formatNumber(
                                  personalProgress
                                    .planned
                                    .proteinG,
                                )}
                              </strong>

                              <small>
                                {' / '}
                                {personalProgress
                                  .target
                                  .proteinG ??
                                  '—'}
                              </small>
                            </span>

                            <span>
                              C{' '}

                              <strong>
                                {formatNumber(
                                  personalProgress
                                    .planned
                                    .carbohydratesG,
                                )}
                              </strong>

                              <small>
                                {' / '}
                                {personalProgress
                                  .target
                                  .carbohydratesG ??
                                  '—'}
                              </small>
                            </span>

                            <span>
                              G{' '}

                              <strong>
                                {formatNumber(
                                  personalProgress
                                    .planned
                                    .fatG,
                                )}
                              </strong>

                              <small>
                                {' / '}
                                {personalProgress
                                  .target
                                  .fatG ??
                                  '—'}
                              </small>
                            </span>

                          </div>

                        ) : (

                          <NutritionMacroSummary
                            nutrients={
                              personalProgress.planned
                            }
                          />

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
