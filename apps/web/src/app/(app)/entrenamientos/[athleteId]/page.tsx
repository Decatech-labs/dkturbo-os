import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Clock3,
} from 'lucide-react';

import Link from 'next/link';

import {
  requireAccessPermission,
} from '../../../../lib/access-server';

import {
  getTrainingAthletes,
  getTrainingWeekDetail,
  getTrainingWeeks,
  type TrainingAccessRole,
} from '../../../../lib/training-api';

import {
  NewWeekControl,
} from './new-week-control';

import {
  NewSessionControl,
} from './new-session-control';

export const dynamic =
  'force-dynamic';

interface TrainingAthletePageProps {
  params:
    Promise<{
      athleteId:
        string;
    }>;

  searchParams:
    Promise<{
      month?:
        string | string[];
    }>;
}

const MONTH_NAMES = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
] as const;

const WEEKDAY_NAMES = [
  'Lun',
  'Mar',
  'Mié',
  'Jue',
  'Vie',
  'Sáb',
  'Dom',
] as const;

const MONTH_PATTERN =
  /^(\d{4})-(\d{2})$/;

const DATE_PATTERN =
  /^(\d{4})-(\d{2})-(\d{2})$/;

const accessLabel = (
  role:
    TrainingAccessRole,
): string => {
  switch (role) {
    case 'SELF':
      return 'Tu perfil';

    case 'COACH':
      return 'Entrenador';

    case 'VIEWER':
      return 'Solo lectura';
  }
};

const sessionTypeLabel = (
  type:
    string,
): string => {
  switch (type) {
    case 'STRENGTH':
      return 'Fuerza';

    case 'RUNNING':
      return 'Carrera';

    case 'SWIMMING':
      return 'Natación';

    case 'CYCLING':
      return 'Ciclismo';

    case 'JUMPS':
      return 'Saltos';

    case 'THROWS':
      return 'Lanzamientos';

    case 'TECHNIQUE':
      return 'Técnica';

    case 'REHAB':
      return 'Rehabilitación';

    case 'MOBILITY':
      return 'Movilidad';

    default:
      return 'Entrenamiento';
  }
};

const parseDate = (
  value:
    string,
): Date => {
  const match =
    DATE_PATTERN.exec(
      value,
    );

  if (!match) {
    throw new Error(
      `Invalid training date: ${value}`,
    );
  }

  const year =
    Number(
      match[1],
    );

  const month =
    Number(
      match[2],
    );

  const day =
    Number(
      match[3],
    );

  return new Date(
    year,
    month - 1,
    day,
    12,
    0,
    0,
    0,
  );
};

const formatDateKey = (
  date:
    Date,
): string => {
  const year =
    date.getFullYear();

  const month =
    String(
      date.getMonth() +
        1,
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

const addDays = (
  value:
    string,
  offset:
    number,
): string => {
  const date =
    parseDate(
      value,
    );

  date.setDate(
    date.getDate() +
      offset,
  );

  return formatDateKey(
    date,
  );
};

const formatMonthKey = (
  year:
    number,
  monthIndex:
    number,
): string =>
  `${year}-${String(
    monthIndex + 1,
  ).padStart(
    2,
    '0',
  )}`;

const parseRequestedMonth = (
  value:
    string | string[] | undefined,
): {
  year: number;
  monthIndex: number;
} => {
  const candidate =
    typeof value ===
    'string'
      ? value
      : undefined;

  if (candidate) {
    const match =
      MONTH_PATTERN.exec(
        candidate,
      );

    if (match) {
      const year =
        Number(
          match[1],
        );

      const month =
        Number(
          match[2],
        );

      if (
        Number.isInteger(
          year,
        ) &&
        Number.isInteger(
          month,
        ) &&
        month >= 1 &&
        month <= 12
      ) {
        return {
          year,
          monthIndex:
            month - 1,
        };
      }
    }
  }

  const today =
    new Date();

  return {
    year:
      today.getFullYear(),

    monthIndex:
      today.getMonth(),
  };
};

const shiftMonth = (
  year:
    number,
  monthIndex:
    number,
  offset:
    number,
): {
  year: number;
  monthIndex: number;
} => {
  const date =
    new Date(
      year,
      monthIndex +
        offset,
      1,
      12,
      0,
      0,
      0,
    );

  return {
    year:
      date.getFullYear(),

    monthIndex:
      date.getMonth(),
  };
};

export default async function TrainingAthletePage({
  params,
  searchParams,
}: TrainingAthletePageProps) {
  await requireAccessPermission(
    'app.training.access',
  );

  const {
    athleteId,
  } = await params;

  const query =
    await searchParams;

  const [
    athletes,
    weeks,
  ] = await Promise.all([
    getTrainingAthletes(),

    getTrainingWeeks(
      athleteId,
    ),
  ]);

  const backHref =
    athletes.length > 1
      ? '/entrenamientos'
      : '/';

  const accessibleAthlete =
    athletes.find(
      ({
        athlete,
      }) =>
        athlete.id ===
        athleteId,
    );

  const athlete =
    accessibleAthlete
      ?.athlete;

  const accessRole =
    accessibleAthlete
      ?.accessRole;

  const canWrite =
    accessibleAthlete
      ?.canWrite ??
    false;

  const {
    year,
    monthIndex,
  } =
    parseRequestedMonth(
      query.month,
    );

  const monthName =
    MONTH_NAMES[
      monthIndex
    ];

  if (
    monthName ===
    undefined
  ) {
    throw new Error(
      'Invalid calendar month',
    );
  }

  const monthStart =
    formatDateKey(
      new Date(
        year,
        monthIndex,
        1,
        12,
      ),
    );

  const monthEnd =
    formatDateKey(
      new Date(
        year,
        monthIndex + 1,
        0,
        12,
      ),
    );

  /*
   * Load detail only for weeks
   * touching the visible month.
   */
  const visibleWeeks =
    weeks.filter(
      ({
        week,
      }) => {
        const weekEnd =
          addDays(
            week.weekStart,
            6,
          );

        return (
          week.weekStart <=
            monthEnd &&
          weekEnd >=
            monthStart
        );
      },
    );

  const weekDetails =
    await Promise.all(
      visibleWeeks.map(
        ({
          week,
        }) =>
          getTrainingWeekDetail(
            athleteId,
            week.id,
          ),
      ),
    );

  const daysByDate =
    new Map<
      string,
      {
        weekId:
          string;

        dayId:
          string;

        sessions:
          Awaited<
            ReturnType<
              typeof getTrainingWeekDetail
            >
          >['days'][number]['sessions'];
      }
    >();

  for (
    const detail of
      weekDetails
  ) {
    for (
      const entry of
        detail.days
    ) {
      daysByDate.set(
        entry.day.date,
        {
          weekId:
            detail.week.id,

          dayId:
            entry.day.id,

          sessions:
            entry.sessions,
        },
      );
    }
  }

  /*
   * Calendar starts on Monday
   * and ends on Sunday.
   */
  const firstDay =
    parseDate(
      monthStart,
    );

  const mondayOffset =
    (
      firstDay.getDay() +
      6
    ) %
    7;

  const calendarStart =
    new Date(
      firstDay,
    );

  calendarStart.setDate(
    calendarStart.getDate() -
      mondayOffset,
  );

  const lastDay =
    parseDate(
      monthEnd,
    );

  const sundayOffset =
    (
      7 -
      lastDay.getDay()
    ) %
    7;

  const calendarEnd =
    new Date(
      lastDay,
    );

  calendarEnd.setDate(
    calendarEnd.getDate() +
      sundayOffset,
  );

  const calendarDays:
    Date[] = [];

  for (
    const cursor =
      new Date(
        calendarStart,
      );

    cursor <=
    calendarEnd;

    cursor.setDate(
      cursor.getDate() +
        1,
    )
  ) {
    calendarDays.push(
      new Date(
        cursor,
      ),
    );
  }

  const todayKey =
    formatDateKey(
      new Date(),
    );

  const previousMonth =
    shiftMonth(
      year,
      monthIndex,
      -1,
    );

  const nextMonth =
    shiftMonth(
      year,
      monthIndex,
      1,
    );

  const currentMonth =
    new Date();

  const currentMonthKey =
    formatMonthKey(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
    );

  const visibleMonthKey =
    formatMonthKey(
      year,
      monthIndex,
    );

  return (
    <main className="training-page training-calendar-page">

      <header className="training-page-header training-calendar-page-header">

        <Link
          href={
            backHref
          }
          className="system-back"
          aria-label={
            athletes.length >
            1
              ? 'Volver a atletas'
              : 'Volver al inicio'
          }
        >
          <ArrowLeft />
        </Link>

        <div className="training-calendar-athlete-heading">

          <h1>
            {athlete?.displayName ??
              'Entrenamiento'}
          </h1>

          <p>
            Calendario de entrenamiento
          </p>

        </div>

        <div className="training-calendar-page-actions">

          {accessRole && (
            <span className="training-calendar-access">
              {accessLabel(
                accessRole,
              )}
            </span>
          )}

          {canWrite && (
            <NewWeekControl
              athleteId={
                athleteId
              }
            />
          )}

        </div>

      </header>

      <section className="training-calendar">

        <header className="training-calendar-toolbar">

          <div className="training-calendar-month-navigation">

            <Link
              href={
                `?month=${formatMonthKey(
                  previousMonth.year,
                  previousMonth.monthIndex,
                )}`
              }
              className="training-calendar-nav-button"
              aria-label="Mes anterior"
            >
              <ChevronLeft />
            </Link>

            <div className="training-calendar-month-title">

              <h2>
                {monthName}
              </h2>

              <span>
                {year}
              </span>

            </div>

            <Link
              href={
                `?month=${formatMonthKey(
                  nextMonth.year,
                  nextMonth.monthIndex,
                )}`
              }
              className="training-calendar-nav-button"
              aria-label="Mes siguiente"
            >
              <ChevronRight />
            </Link>

          </div>

          {visibleMonthKey !==
            currentMonthKey && (
            <Link
              href={
                `?month=${currentMonthKey}`
              }
              className="training-calendar-today-button"
            >
              Hoy
            </Link>
          )}

        </header>

        <div className="training-calendar-weekdays">

          {WEEKDAY_NAMES.map(
            (
              weekday,
            ) => (
              <div
                key={
                  weekday
                }
              >
                {weekday}
              </div>
            ),
          )}

        </div>

        <div className="training-calendar-grid">

          {calendarDays.map(
            (
              date,
            ) => {
              const dateKey =
                formatDateKey(
                  date,
                );

              const dayData =
                daysByDate.get(
                  dateKey,
                );

              const isCurrentMonth =
                date.getMonth() ===
                  monthIndex &&
                date.getFullYear() ===
                  year;

              const isToday =
                dateKey ===
                todayKey;

              return (
                <article
                  key={
                    dateKey
                  }
                  className={[
                    'training-calendar-day',

                    isCurrentMonth
                      ? ''
                      : 'training-calendar-day-outside',

                    isToday
                      ? 'training-calendar-day-today'
                      : '',
                  ]
                    .filter(
                      Boolean,
                    )
                    .join(
                      ' ',
                    )}
                >
                  {dayData && (
                    <Link
                      href={
                        `/entrenamientos/${athleteId}/semanas/${dayData.weekId}`
                      }
                      className="training-calendar-week-hitarea"
                      aria-label={`Abrir semana de ${dateKey}`}
                    />
                  )}

                  <header className="training-calendar-day-header">

                    <span
                      className="training-calendar-day-number"
                    >
                      {date.getDate()}
                    </span>

                    <div className="training-calendar-day-actions">

                      {canWrite &&
                        isCurrentMonth && (
                          <NewSessionControl
                            athleteId={
                              athleteId
                            }
                            dayId={
                              dayData?.dayId ??
                              null
                            }
                            date={
                              dateKey
                            }
                            dateLabel={
                              new Intl.DateTimeFormat(
                                'es-ES',
                                {
                                  weekday:
                                    'long',

                                  day:
                                    'numeric',

                                  month:
                                    'long',
                                },
                              ).format(
                                date,
                              )
                            }
                          />
                        )}

                    </div>

                  </header>

                  <div className="training-calendar-day-sessions">

                    {dayData?.sessions.map(
                      (
                        session,
                      ) => (
                        <Link
                          key={
                            session.id
                          }
                          href={
                            `/entrenamientos/${athleteId}/sesiones/${session.id}`
                          }
                          className="training-session-row training-calendar-session"
                          data-session-type={
                            session.type
                          }
                          title={
                            session.title
                          }
                        >

                          <div className="training-calendar-session-main">

                            <span className="training-calendar-session-type">
                              {sessionTypeLabel(
                                session.type,
                              )}
                            </span>

                            <strong>
                              {
                                session.title
                              }
                            </strong>

                            {session.plannedStartTime && (
                              <span className="training-calendar-session-time">
                                <Clock3 />

                                {
                                  session.plannedStartTime
                                }
                              </span>
                            )}

                          </div>

                        </Link>
                      ),
                    )}

                  </div>

                </article>
              );
            },
          )}

        </div>

      </section>

    </main>
  );
}
