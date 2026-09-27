import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

import Link from 'next/link';

import {
  requireAccessPermission,
} from '../../../../../lib/access-server';

import {
  getTrainingAthletes,
  getTrainingDailyCheckinRange,
} from '../../../../../lib/training-api';

import {
  DailyCheckinCard,
} from '../daily-checkin-card';

import {
  WeeklyCheckinSummary,
} from '../weekly-checkin-summary';

import styles from './page.module.css';

export const dynamic =
  'force-dynamic';

interface TrainingStateHistoryPageProps {
  params:
    Promise<{
      athleteId:
        string;
    }>;

  searchParams:
    Promise<{
      week?:
        string | string[];

      day?:
        string | string[];
    }>;
}

const DATE_PATTERN =
  /^(\d{4})-(\d{2})-(\d{2})$/;

const parseDate =
  (
    value:
      string,
  ): Date | null => {

    const match =
      DATE_PATTERN.exec(
        value,
      );

    if (!match) {
      return null;
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

const formatDateKey =
  (
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

const getMonday =
  (
    date:
      Date,
  ): Date => {

    const result =
      new Date(
        date,
      );

    const offset =
      (
        result.getDay() +
        6
      ) %
      7;

    result.setDate(
      result.getDate() -
        offset,
    );

    return result;
  };

const addDays =
  (
    date:
      Date,

    offset:
      number,
  ): Date => {

    const result =
      new Date(
        date,
      );

    result.setDate(
      result.getDate() +
        offset,
    );

    return result;
  };

const formatLongDate =
  (
    value:
      string,
  ): string =>
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
      new Date(
        `${value}T12:00:00`,
      ),
    );

const formatWeekLabel =
  (
    start:
      Date,

    end:
      Date,
  ): string => {

    const startDay =
      start.getDate();

    const endDay =
      end.getDate();

    const startMonth =
      new Intl.DateTimeFormat(
        'es-ES',
        {
          month:
            'long',
        },
      ).format(
        start,
      );

    const endMonth =
      new Intl.DateTimeFormat(
        'es-ES',
        {
          month:
            'long',

          year:
            'numeric',
        },
      ).format(
        end,
      );

    if (
      start.getMonth() ===
        end.getMonth() &&
      start.getFullYear() ===
        end.getFullYear()
    ) {
      return `${startDay}–${endDay} ${endMonth}`;
    }

    return `${startDay} ${startMonth} – ${endDay} ${endMonth}`;
  };

const formatScore =
  (
    value:
      number | null,
  ): string =>
    value ===
      null
      ? '—'
      : `${value}/5`;

export default async function TrainingStateHistoryPage({
  params,
  searchParams,
}: TrainingStateHistoryPageProps) {

  await requireAccessPermission(
    'app.training.access',
  );

  const {
    athleteId,
  } =
    await params;

  const query =
    await searchParams;

  const athletes =
    await getTrainingAthletes();

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

  const canWrite =
    accessibleAthlete
      ?.canWrite ??
    false;

  const requestedWeek =
    typeof query.week ===
      'string'
      ? parseDate(
          query.week,
        )
      : null;

  const baseDate =
    requestedWeek ??
    new Date();

  const weekStart =
    getMonday(
      baseDate,
    );

  const weekEnd =
    addDays(
      weekStart,
      6,
    );

  const weekStartKey =
    formatDateKey(
      weekStart,
    );

  const weekEndKey =
    formatDateKey(
      weekEnd,
    );

  const previousWeekKey =
    formatDateKey(
      addDays(
        weekStart,
        -7,
      ),
    );

  const nextWeekKey =
    formatDateKey(
      addDays(
        weekStart,
        7,
      ),
    );

  const data =
    await getTrainingDailyCheckinRange(
      athleteId,
      weekStartKey,
      weekEndKey,
    );

  const checkinByDate =
    new Map(
      data.checkins.map(
        checkin => [
          checkin.date,
          checkin,
        ],
      ),
    );

  const days =
    Array.from(
      {
        length:
          7,
      },
      (
        _,
        index,
      ) => {

        const date =
          addDays(
            weekStart,
            index,
          );

        const dateKey =
          formatDateKey(
            date,
          );

        return {
          date:
            dateKey,

          checkin:
            checkinByDate.get(
              dateKey,
            ) ??
            null,
        };
      },
    );

  const requestedDay =
    typeof query.day ===
      'string'
      ? query.day
      : null;

  const selectedDay =
    requestedDay &&
    days.some(
      day =>
        day.date ===
        requestedDay,
    )
      ? requestedDay
      : null;

  const todayMonday =
    getMonday(
      new Date(),
    );

  const isCurrentWeek =
    formatDateKey(
      todayMonday,
    ) ===
    weekStartKey;

  return (
    <main
      className={
        `training-page ${styles.page}`
      }
    >
      <header
        className={
          styles.pageHeader
        }
      >
        <Link
          href={
            `/entrenamientos/${encodeURIComponent(
              athleteId,
            )}`
          }
          className="system-back"
          aria-label="Volver al calendario"
        >
          <ArrowLeft />
        </Link>

        <div>
          <h1>
            Estado y bienestar
          </h1>

          <p>
            {athlete?.displayName ??
              'Entrenamiento'}
          </p>
        </div>
      </header>

      <section
        className={
          styles.weekNavigation
        }
      >
        <Link
          href={
            `?week=${previousWeekKey}`
          }
          className={
            styles.navigationButton
          }
          aria-label="Semana anterior"
        >
          <ChevronLeft />
        </Link>

        <div
          className={
            styles.weekHeading
          }
        >
          <span>
            Semana
          </span>

          <strong>
            {formatWeekLabel(
              weekStart,
              weekEnd,
            )}
          </strong>
        </div>

        <Link
          href={
            `?week=${nextWeekKey}`
          }
          className={
            styles.navigationButton
          }
          aria-label="Semana siguiente"
        >
          <ChevronRight />
        </Link>

        {!isCurrentWeek && (
          <Link
            href={
              `/entrenamientos/${encodeURIComponent(
                athleteId,
              )}/estado`
            }
            className={
              styles.currentWeekButton
            }
          >
            Semana actual
          </Link>
        )}
      </section>

      <WeeklyCheckinSummary
        athleteId={
          athleteId
        }
        data={
          data
        }
        showHistoryLink={
          false
        }
      />

      <section
        className={
          styles.history
        }
      >
        <header
          className={
            styles.historyHeader
          }
        >
          <div>
            <span>
              Registro diario
            </span>

            <h2>
              Detalle de la semana
            </h2>
          </div>

          <span
            className={
              styles.completion
            }
          >
            {data.summary.recordedDays}
            {' / '}
            {data.summary.periodDays}
          </span>
        </header>

        <div
          className={
            styles.dayList
          }
        >
          {days.map(
            ({
              date,
              checkin,
            }) => {

              const active =
                selectedDay ===
                date;

              return (
                <Link
                  key={
                    date
                  }
                  href={
                    `?week=${weekStartKey}&day=${date}`
                  }
                  className={
                    active
                      ? `${styles.dayCard} ${styles.dayCardActive}`
                      : styles.dayCard
                  }
                >
                  <div
                    className={
                      styles.dayHeading
                    }
                  >
                    <div>
                      <strong>
                        {formatLongDate(
                          date,
                        )}
                      </strong>

                      <span>
                        {checkin
                          ? 'Registrado'
                          : 'Sin registro'}
                      </span>
                    </div>

                    <span
                      className={
                        checkin
                          ? `${styles.statusDot} ${styles.statusDotComplete}`
                          : styles.statusDot
                      }
                    />
                  </div>

                  {checkin ? (
                    <>
                      <div
                        className={
                          styles.dayMetrics
                        }
                      >
                        <span>
                          <small>
                            Peso
                          </small>

                          <strong>
                            {checkin.weightKg ===
                            null
                              ? '—'
                              : `${checkin.weightKg} kg`}
                          </strong>
                        </span>

                        <span>
                          <small>
                            Sueño
                          </small>

                          <strong>
                            {formatScore(
                              checkin.sleepQuality,
                            )}
                          </strong>
                        </span>

                        <span>
                          <small>
                            Fatiga
                          </small>

                          <strong>
                            {formatScore(
                              checkin.fatigue,
                            )}
                          </strong>
                        </span>

                        <span>
                          <small>
                            Molestias
                          </small>

                          <strong>
                            {formatScore(
                              checkin.soreness,
                            )}
                          </strong>
                        </span>

                        <span>
                          <small>
                            Estrés
                          </small>

                          <strong>
                            {formatScore(
                              checkin.stress,
                            )}
                          </strong>
                        </span>

                        <span>
                          <small>
                            Motivación
                          </small>

                          <strong>
                            {formatScore(
                              checkin.motivation,
                            )}
                          </strong>
                        </span>
                      </div>

                      {checkin.notes && (
                        <p
                          className={
                            styles.notes
                          }
                        >
                          {checkin.notes}
                        </p>
                      )}
                    </>
                  ) : (
                    <p
                      className={
                        styles.emptyDay
                      }
                    >
                      No hay datos registrados.
                    </p>
                  )}
                </Link>
              );
            },
          )}
        </div>
      </section>

      {selectedDay && (
        <section
          className={
            styles.editor
          }
        >
          <header
            className={
              styles.editorHeading
            }
          >
            <span>
              Detalle
            </span>

            <h2>
              {formatLongDate(
                selectedDay,
              )}
            </h2>
          </header>

          <DailyCheckinCard
            athleteId={
              athleteId
            }
            date={
              selectedDay
            }
            canWrite={
              canWrite
            }
          />
        </section>
      )}
    </main>
  );
}
