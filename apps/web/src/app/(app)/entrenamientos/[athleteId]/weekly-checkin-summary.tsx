import {
  ArrowRight,
} from 'lucide-react';

import Link from 'next/link';

import type {
  TrainingDailyCheckinRangeResponse,
} from '../../../../lib/training-api';

import styles from './weekly-checkin-summary.module.css';

interface WeeklyCheckinSummaryProps {
  athleteId:
    string;

  data:
    TrainingDailyCheckinRangeResponse;

  showHistoryLink?:
    boolean;
}

interface MetricProps {
  label:
    string;

  value:
    number | null;

  inverse?:
    boolean;
}

const formatDecimal =
  (
    value:
      number,
  ): string =>
    new Intl.NumberFormat(
      'es-ES',
      {
        minimumFractionDigits:
          value % 1 === 0
            ? 0
            : 1,

        maximumFractionDigits:
          2,
      },
    ).format(
      value,
    );

const Metric =
  ({
    label,
    value,
    inverse =
      false,
  }:
    MetricProps) => (

    <div
      className={
        styles.metric
      }
      data-inverse={
        inverse
          ? 'true'
          : 'false'
      }
    >
      <span>
        {label}
      </span>

      <strong>
        {value === null
          ? '—'
          : `${formatDecimal(
              value,
            )} / 5`}
      </strong>
    </div>
  );

export function WeeklyCheckinSummary({
  athleteId,
  data,
  showHistoryLink =
    true,
}: WeeklyCheckinSummaryProps) {

  const {
    summary,
    checkins,
  } =
    data;

  const checkinsByDate =
    new Set(
      checkins.map(
        checkin =>
          checkin.date,
      ),
    );

  const dates:
    string[] = [];

  const start =
    new Date(
      `${summary.from}T12:00:00`,
    );

  for (
    let offset =
      0;

    offset <
      summary.periodDays;

    offset +=
      1
  ) {
    const date =
      new Date(
        start,
      );

    date.setDate(
      date.getDate() +
        offset,
    );

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

    dates.push(
      `${year}-${month}-${day}`,
    );
  }

  const weekdayLabels = [
    'L',
    'M',
    'X',
    'J',
    'V',
    'S',
    'D',
  ];

  const weight =
    summary.weight;

  const hasWeightTrend =
    weight.first !==
      null &&
    weight.last !==
      null;

  return (
    <section
      className={
        styles.card
      }
    >
      <header
        className={
          styles.header
        }
      >
        <div>
          <span
            className={
              styles.eyebrow
            }
          >
            Estado semanal
          </span>

          <div
            className={
              styles.titleRow
            }
          >
            <strong>
              {
                summary.recordedDays
              }
              {' / '}
              {
                summary.periodDays
              }
            </strong>

            <span>
              días registrados
            </span>
          </div>
        </div>

        {showHistoryLink && (
          <Link
            href={
              `/entrenamientos/${encodeURIComponent(
                athleteId,
              )}/estado`
            }
            className={
              styles.historyLink
            }
          >
            Ver histórico

            <ArrowRight
              aria-hidden="true"
            />
          </Link>
        )}
      </header>

      <div
        className={
          styles.content
        }
      >
        <div
          className={
            styles.weightBlock
          }
        >
          <span
            className={
              styles.weightLabel
            }
          >
            Peso
          </span>

          {hasWeightTrend ? (
            <>
              <strong
                className={
                  styles.weightValue
                }
              >
                {formatDecimal(
                  weight.first!,
                )}
                {' → '}
                {formatDecimal(
                  weight.last!,
                )}
                {' kg'}
              </strong>

              <span
                className={
                  styles.weightDifference
                }
              >
                {weight.difference ===
                null
                  ? ''
                  : `${
                      weight.difference >
                      0
                        ? '+'
                        : ''
                    }${formatDecimal(
                      weight.difference,
                    )} kg`}
              </span>
            </>
          ) : (
            <strong
              className={
                styles.weightValue
              }
            >
              {weight.average ===
              null
                ? '—'
                : `${formatDecimal(
                    weight.average,
                  )} kg`}
            </strong>
          )}
        </div>

        <div
          className={
            styles.metrics
          }
        >
          <Metric
            label="Sueño"
            value={
              summary
                .averages
                .sleepQuality
            }
          />

          <Metric
            label="Fatiga"
            value={
              summary
                .averages
                .fatigue
            }
            inverse
          />

          <Metric
            label="Molestias"
            value={
              summary
                .averages
                .soreness
            }
            inverse
          />

          <Metric
            label="Estrés"
            value={
              summary
                .averages
                .stress
            }
            inverse
          />

          <Metric
            label="Motivación"
            value={
              summary
                .averages
                .motivation
            }
          />
        </div>
      </div>

      <div
        className={
          styles.week
        }
      >
        {dates.map(
          (
            date,
            index,
          ) => {

            const complete =
              checkinsByDate.has(
                date,
              );

            return (
              <div
                key={
                  date
                }
                className={
                  styles.day
                }
              >
                <span>
                  {
                    weekdayLabels[
                      index
                    ]
                  }
                </span>

                <span
                  className={
                    complete
                      ? `${styles.dayDot} ${styles.dayDotComplete}`
                      : styles.dayDot
                  }
                  aria-label={
                    complete
                      ? 'Registrado'
                      : 'Sin registrar'
                  }
                />
              </div>
            );
          },
        )}
      </div>
    </section>
  );
}
