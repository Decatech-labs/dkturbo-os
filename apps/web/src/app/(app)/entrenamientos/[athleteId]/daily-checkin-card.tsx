'use client';

import {
  useRouter,
} from 'next/navigation';

import {
  Check,
  LoaderCircle,
  Pencil,
  Scale,
} from 'lucide-react';

import {
  useCallback,
  useEffect,
  useState,
} from 'react';

import styles from './daily-checkin-card.module.css';

type Score =
  | 1
  | 2
  | 3
  | 4
  | 5;

interface DailyCheckin {
  id:
    string;

  athleteId:
    string;

  date:
    string;

  weightKg:
    number | null;

  sleepQuality:
    Score | null;

  fatigue:
    Score | null;

  soreness:
    Score | null;

  stress:
    Score | null;

  motivation:
    Score | null;

  notes:
    string | null;
}

interface DailyCheckinCardProps {
  athleteId:
    string;

  date:
    string;

  canWrite:
    boolean;
}

type MetricTone =
  | 'sleep'
  | 'fatigue'
  | 'soreness'
  | 'stress'
  | 'motivation';

interface ScoreControlProps {
  label:
    string;

  hint:
    string;

  value:
    Score | null;

  disabled:
    boolean;

  tone:
    MetricTone;

  onChange:
    (
      value:
        Score,
    ) => void;
}

interface SummaryItemProps {
  label:
    string;

  value:
    string;

  tone:
    MetricTone | 'weight';
}

const SCORE_VALUES:
  Score[] = [
    1,
    2,
    3,
    4,
    5,
  ];

const ScoreControl =
  ({
    label,
    hint,
    value,
    disabled,
    tone,
    onChange,
  }:
    ScoreControlProps) => (
    <div
      className={
        styles.metric
      }
      data-tone={
        tone
      }
    >
      <div
        className={
          styles.metricHeading
        }
      >
        <strong>
          {label}
        </strong>

        <span>
          {hint}
        </span>
      </div>

      <div
        className={
          styles.score
        }
        role="group"
        aria-label={
          label
        }
      >
        {SCORE_VALUES.map(
          score => (
            <button
              key={
                score
              }
              type="button"
              className={
                value ===
                score
                  ? `${styles.scoreButton} ${styles.scoreButtonActive}`
                  : styles.scoreButton
              }
              disabled={
                disabled
              }
              aria-pressed={
                value ===
                score
              }
              onClick={() =>
                onChange(
                  score,
                )
              }
            >
              {score}
            </button>
          ),
        )}
      </div>
    </div>
  );

const SummaryItem =
  ({
    label,
    value,
    tone,
  }:
    SummaryItemProps) => (
    <div
      className={
        styles.summaryItem
      }
      data-tone={
        tone
      }
    >
      <span
        className={
          styles.summaryDot
        }
      />

      <span
        className={
          styles.summaryLabel
        }
      >
        {label}
      </span>

      <strong>
        {value}
      </strong>
    </div>
  );

const formatDate =
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

export function DailyCheckinCard({
  athleteId,
  date,
  canWrite,
}: DailyCheckinCardProps) {

  const router =
    useRouter();

  const today =
    new Date();

  const todayKey =
    [
      today.getFullYear(),
      String(
        today.getMonth() +
          1,
      ).padStart(
        2,
        '0',
      ),
      String(
        today.getDate(),
      ).padStart(
        2,
        '0',
      ),
    ].join(
      '-',
    );

  const isToday =
    date ===
    todayKey;

  const stateLabel =
    isToday
      ? 'Estado de hoy'
      : 'Estado del día';

  const [
    loading,
    setLoading,
  ] =
    useState(
      true,
    );

  const [
    saving,
    setSaving,
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

  const [
    hasCheckin,
    setHasCheckin,
  ] =
    useState(
      false,
    );

  const [
    editing,
    setEditing,
  ] =
    useState(
      false,
    );

  const [
    weightKg,
    setWeightKg,
  ] =
    useState(
      '',
    );

  const [
    sleepQuality,
    setSleepQuality,
  ] =
    useState<
      Score | null
    >(
      null,
    );

  const [
    fatigue,
    setFatigue,
  ] =
    useState<
      Score | null
    >(
      null,
    );

  const [
    soreness,
    setSoreness,
  ] =
    useState<
      Score | null
    >(
      null,
    );

  const [
    stress,
    setStress,
  ] =
    useState<
      Score | null
    >(
      null,
    );

  const [
    motivation,
    setMotivation,
  ] =
    useState<
      Score | null
    >(
      null,
    );

  const [
    notes,
    setNotes,
  ] =
    useState(
      '',
    );

  const applyCheckin =
    useCallback(
      (
        checkin:
          DailyCheckin | null,
      ) => {

        setHasCheckin(
          checkin !==
            null,
        );

        setWeightKg(
          checkin
            ?.weightKg ===
          null ||
          checkin
            ?.weightKg ===
          undefined
            ? ''
            : String(
                checkin
                  .weightKg,
              ),
        );

        setSleepQuality(
          checkin
            ?.sleepQuality ??
          null,
        );

        setFatigue(
          checkin
            ?.fatigue ??
          null,
        );

        setSoreness(
          checkin
            ?.soreness ??
          null,
        );

        setStress(
          checkin
            ?.stress ??
          null,
        );

        setMotivation(
          checkin
            ?.motivation ??
          null,
        );

        setNotes(
          checkin
            ?.notes ??
          '',
        );

        setEditing(
          checkin ===
            null &&
          canWrite,
        );
      },
      [
        canWrite,
      ],
    );

  useEffect(
    () => {

      let cancelled =
        false;

      const load =
        async () => {

          setLoading(
            true,
          );

          setError(
            null,
          );

          try {

            const response =
              await fetch(
                `/api/training/athletes/${encodeURIComponent(
                  athleteId,
                )}/daily-checkins/${encodeURIComponent(
                  date,
                )}`,
                {
                  cache:
                    'no-store',
                },
              );

            if (
              !response.ok
            ) {
              throw new Error();
            }

            const checkin =
              await response.json() as
                DailyCheckin | null;

            if (
              !cancelled
            ) {
              applyCheckin(
                checkin,
              );
            }

          } catch {

            if (
              !cancelled
            ) {
              setError(
                'No se pudo cargar el estado.',
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
        };

      void load();

      return () => {
        cancelled =
          true;
      };
    },
    [
      athleteId,
      date,
      applyCheckin,
    ],
  );

  const save =
    async (): Promise<void> => {

      if (
        !canWrite ||
        saving
      ) {
        return;
      }

      const normalizedWeight =
        weightKg.trim() ===
        ''
          ? null
          : Number(
              weightKg
                .replace(
                  ',',
                  '.',
                ),
            );

      if (
        normalizedWeight !==
          null &&
        (
          !Number.isFinite(
            normalizedWeight,
          ) ||
          normalizedWeight <=
            0
        )
      ) {
        setError(
          'Introduce un peso válido.',
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
            `/api/training/athletes/${encodeURIComponent(
              athleteId,
            )}/daily-checkins/${encodeURIComponent(
              date,
            )}`,
            {
              method:
                'PUT',

              headers: {
                'content-type':
                  'application/json',
              },

              body:
                JSON.stringify({
                  weightKg:
                    normalizedWeight,

                  sleepQuality,

                  fatigue,

                  soreness,

                  stress,

                  motivation,

                  notes:
                    notes.trim() ||
                    null,
                }),
            },
          );

        if (
          !response.ok
        ) {
          throw new Error();
        }

        const checkin =
          await response.json() as
            DailyCheckin;

        applyCheckin(
          checkin,
        );

        setHasCheckin(
          true,
        );

        setEditing(
          false,
        );

        router.refresh();

      } catch {

        setError(
          'No se pudo guardar el check-in.',
        );

      } finally {

        setSaving(
          false,
        );
      }
    };

  if (
    loading
  ) {
    return (
      <section
        className={
          `${styles.card} ${styles.cardLoading}`
        }
      >
        <LoaderCircle
          className={
            styles.spinner
          }
        />

        <span>
          Cargando estado…
        </span>
      </section>
    );
  }

  if (
    hasCheckin &&
    !editing
  ) {
    return (
      <section
        className={
          `${styles.card} ${styles.summaryCard}`
        }
      >
        <div
          className={
            styles.summaryTop
          }
        >
          <div
            className={
              styles.summaryTitle
            }
          >
            <span
              className={
                styles.savedIcon
              }
            >
              <Check />
            </span>

            <div>
              <span
                className={
                  styles.eyebrow
                }
              >
                {stateLabel}
              </span>

              <p>
                {formatDate(
                  date,
                )}
              </p>
            </div>
          </div>

          {canWrite && (
            <button
              type="button"
              className={
                styles.editButton
              }
              onClick={() => {
                setEditing(
                  true,
                );
              }}
            >
              <Pencil />

              Editar
            </button>
          )}
        </div>

        <div
          className={
            styles.summaryGrid
          }
        >
          {weightKg && (
            <SummaryItem
              label="Peso"
              value={
                `${weightKg} kg`
              }
              tone="weight"
            />
          )}

          {sleepQuality && (
            <SummaryItem
              label="Sueño"
              value={
                `${sleepQuality}/5`
              }
              tone="sleep"
            />
          )}

          {fatigue && (
            <SummaryItem
              label="Fatiga"
              value={
                `${fatigue}/5`
              }
              tone="fatigue"
            />
          )}

          {soreness && (
            <SummaryItem
              label="Molestias"
              value={
                `${soreness}/5`
              }
              tone="soreness"
            />
          )}

          {stress && (
            <SummaryItem
              label="Estrés"
              value={
                `${stress}/5`
              }
              tone="stress"
            />
          )}

          {motivation && (
            <SummaryItem
              label="Motivación"
              value={
                `${motivation}/5`
              }
              tone="motivation"
            />
          )}
        </div>

        {notes && (
          <p
            className={
              styles.summaryNotes
            }
          >
            {notes}
          </p>
        )}
      </section>
    );
  }

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
            {stateLabel}
          </span>

          <h2>
            {isToday
              ? '¿Cómo llegas hoy?'
              : 'Registro de bienestar'}
          </h2>

          <p>
            {formatDate(
              date,
            )}
          </p>
        </div>

        {!canWrite && (
          <span
            className={
              styles.readOnly
            }
          >
            Solo lectura
          </span>
        )}
      </header>

      {!canWrite &&
      !hasCheckin ? (
        <p
          className={
            styles.empty
          }
        >
          Todavía no hay un
          registro para este día.
        </p>
      ) : (
        <>
          <div
            className={
              styles.content
            }
          >
            <label
              className={
                styles.weight
              }
            >
              <span
                className={
                  styles.weightLabel
                }
              >
                <Scale />

                Peso
              </span>

              <div
                className={
                  styles.weightInput
                }
              >
                <input
                  type="text"
                  inputMode="decimal"
                  value={
                    weightKg
                  }
                  disabled={
                    !canWrite
                  }
                  placeholder="—"
                  aria-label="Peso en kilogramos"
                  onChange={
                    event =>
                      setWeightKg(
                        event
                          .target
                          .value,
                      )
                  }
                />

                <span>
                  kg
                </span>
              </div>
            </label>

            <div
              className={
                styles.metrics
              }
            >
              <ScoreControl
                label="Sueño"
                hint="1 malo · 5 excelente"
                tone="sleep"
                value={
                  sleepQuality
                }
                disabled={
                  !canWrite
                }
                onChange={
                  setSleepQuality
                }
              />

              <ScoreControl
                label="Fatiga"
                hint="1 mínima · 5 extrema"
                tone="fatigue"
                value={
                  fatigue
                }
                disabled={
                  !canWrite
                }
                onChange={
                  setFatigue
                }
              />

              <ScoreControl
                label="Molestias"
                hint="1 ninguna · 5 muy altas"
                tone="soreness"
                value={
                  soreness
                }
                disabled={
                  !canWrite
                }
                onChange={
                  setSoreness
                }
              />

              <ScoreControl
                label="Estrés"
                hint="1 mínimo · 5 extremo"
                tone="stress"
                value={
                  stress
                }
                disabled={
                  !canWrite
                }
                onChange={
                  setStress
                }
              />

              <ScoreControl
                label="Motivación"
                hint="1 muy baja · 5 muy alta"
                tone="motivation"
                value={
                  motivation
                }
                disabled={
                  !canWrite
                }
                onChange={
                  setMotivation
                }
              />
            </div>

            <label
              className={
                styles.notes
              }
            >
              <span>
                Notas
              </span>

              <textarea
                value={
                  notes
                }
                disabled={
                  !canWrite
                }
                rows={
                  2
                }
                placeholder="Sensaciones, molestias concretas…"
                onChange={
                  event =>
                    setNotes(
                      event
                        .target
                        .value,
                    )
                }
              />
            </label>
          </div>

          <footer
            className={
              styles.footer
            }
          >
            <div
              className={
                styles.feedback
              }
            >
              {error && (
                <span
                  className={
                    styles.error
                  }
                >
                  {error}
                </span>
              )}
            </div>

            {canWrite && (
              <div
                className={
                  styles.actions
                }
              >
                {hasCheckin && (
                  <button
                    type="button"
                    className={
                      styles.cancelButton
                    }
                    onClick={() => {
                      setEditing(
                        false,
                      );
                    }}
                  >
                    Cancelar
                  </button>
                )}

                <button
                  type="button"
                  className={
                    styles.saveButton
                  }
                  disabled={
                    saving
                  }
                  onClick={() => {
                    void save();
                  }}
                >
                  {saving ? (
                    <>
                      <LoaderCircle
                        className={
                          styles.spinner
                        }
                      />

                      Guardando…
                    </>
                  ) : (
                    'Guardar estado'
                  )}
                </button>
              </div>
            )}
          </footer>
        </>
      )}
    </section>
  );
}
