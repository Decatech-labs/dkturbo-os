'use client';

import {
  DndContext,
  PointerSensor,
  closestCenter,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';

import {
  ArrowRight,
  CalendarDays,
  Clock3,
} from 'lucide-react';

import Link from 'next/link';

import {
  useRouter,
} from 'next/navigation';

import {
  useEffect,
  useState,
} from 'react';

import {
  NewSessionControl,
} from '../../new-session-control';

import {
  useTrainingMobileEditMode,
  useTrainingMobileMode,
} from '../../../use-training-mobile-mode';

interface TrainingWeekSession {
  id:
    string;

  dayId:
    string;

  athleteId:
    string;

  type:
    string;

  title:
    string;

  plannedStartTime:
    string | null;

  plannedDurationMinutes:
    number | null;

  plannedNotes:
    string | null;

  plannedRpe:
    number | null;
}

interface TrainingWeekDay {
  id:
    string;

  date:
    string;
}

interface TrainingWeekDayItem {
  day:
    TrainingWeekDay;

  sessions:
    TrainingWeekSession[];
}

interface TrainingWeekSessionBoardProps {
  athleteId:
    string;

  weekId:
    string;

  initialDays:
    TrainingWeekDayItem[];

  canWrite:
    boolean;
}

const formatDay =
  (
    value:
      string,
  ): {
    weekday:
      string;

    day:
      string;
  } => {

    const [
      year,
      month,
      day,
    ] = value
      .split('-')
      .map(
        Number,
      );

    if (
      !year ||
      !month ||
      !day
    ) {
      return {
        weekday:
          value,

        day:
          '',
      };
    }

    const date =
      new Date(
        year,
        month - 1,
        day,
      );

    return {
      weekday:
        new Intl.DateTimeFormat(
          'es-ES',
          {
            weekday:
              'long',
          },
        ).format(
          date,
        ),

      day:
        new Intl.DateTimeFormat(
          'es-ES',
          {
            day:
              'numeric',

            month:
              'short',
          },
        ).format(
          date,
        ),
    };
  };

const sessionTypeLabel =
  (
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

function DraggableSession({
  athleteId,
  weekId,
  session,
  canWrite,
}: {
  athleteId:
    string;

  weekId:
    string;

  session:
    TrainingWeekSession;

  canWrite:
    boolean;
}) {

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging,
  } = useDraggable({
    id:
      session.id,

    disabled:
      !canWrite,

    data: {
      type:
        'training-session',

      session,
    },
  });

  const style =
    transform
      ? {
          transform:
            `translate3d(${transform.x}px, ${transform.y}px, 0)`,

          zIndex:
            50,

          opacity:
            isDragging
              ? 0.72
              : 1,
        }
      : undefined;

  return (
    <Link
      ref={
        setNodeRef
      }
      href={
        `/entrenamientos/${athleteId}/sesiones/${session.id}?from=week&weekId=${weekId}`
      }
      className="training-session-row"
      data-session-type={
        session.type
      }
      style={
        style
      }
      {...attributes}
      {...listeners}
    >

      <div className="training-session-main">

        <span className="training-session-type">
          {sessionTypeLabel(
            session.type,
          )}
        </span>

        <strong>
          {session.title}
        </strong>

        {(session.plannedStartTime ||
          session.plannedDurationMinutes !==
            null) && (

          <div className="training-session-time">

            <Clock3 />

            {session.plannedStartTime && (
              <span>
                {session.plannedStartTime}
              </span>
            )}

            {session.plannedDurationMinutes !==
              null && (
              <span>
                {session.plannedDurationMinutes} min
              </span>
            )}

          </div>

        )}

      </div>

      <ArrowRight />

    </Link>
  );
}

function DroppableDay({
  athleteId,
  weekId,
  item,
  canWrite,
}: {
  athleteId:
    string;

  weekId:
    string;

  item:
    TrainingWeekDayItem;

  canWrite:
    boolean;
}) {

  const {
    setNodeRef,
    isOver,
  } = useDroppable({
    id:
      item.day.id,

    disabled:
      !canWrite,

    data: {
      type:
        'training-day',

      dayId:
        item.day.id,
    },
  });

  const formatted =
    formatDay(
      item.day.date,
    );

  return (
    <article
      ref={
        setNodeRef
      }
      className={[
        'training-day-card',

        isOver
          ? 'training-day-card-drop-target'
          : '',
      ]
        .filter(
          Boolean,
        )
        .join(
          ' ',
        )}
    >

      <header className="training-day-header">

        <div>

          <strong>
            {formatted.weekday}
          </strong>

          <span>
            {formatted.day}
          </span>

        </div>

        {canWrite && (
          <NewSessionControl
            athleteId={
              athleteId
            }
            dayId={
              item.day.id
            }
            date={
              item.day.date
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
                new Date(
                  `${item.day.date}T12:00:00`,
                ),
              )
            }
          />
        )}

      </header>

      <div className="training-day-sessions">

        {item.sessions.length ===
        0 ? (

          <div className="training-day-empty">
            <CalendarDays />

            <span>
              Sin sesiones
            </span>
          </div>

        ) : (

          item.sessions.map(
            (
              session,
            ) => (

              <DraggableSession
                key={
                  session.id
                }
                athleteId={
                  athleteId
                }
                weekId={
                  weekId
                }
                session={
                  session
                }
                canWrite={
                  canWrite
                }
              />

            ),
          )

        )}

      </div>

    </article>
  );
}

export function TrainingWeekSessionBoard({
  athleteId,
  weekId,
  initialDays,
  canWrite,
}: TrainingWeekSessionBoardProps) {

  const mobile =
    useTrainingMobileMode();

  const {
    enabled:
      mobileEditEnabled,
  } =
    useTrainingMobileEditMode();

  const canEditPlan =
    canWrite &&
    (
      !mobile ||
      mobileEditEnabled
    );

  const router =
    useRouter();

  const [
    days,
    setDays,
  ] = useState(
    initialDays,
  );

  const [
    error,
    setError,
  ] = useState<string | null>(
    null,
  );

  useEffect(
    () => {
      setDays(
        initialDays,
      );

      setError(
        null,
      );
    },
    [
      initialDays,
    ],
  );

  const sensors =
    useSensors(
      useSensor(
        PointerSensor,
        {
          activationConstraint: {
            distance:
              8,
          },
        },
      ),
    );

  const handleDragEnd =
    async (
      event:
        DragEndEvent,
    ) => {

      const {
        active,
        over,
      } = event;

      if (
        !canEditPlan ||
        !over
      ) {
        return;
      }

      const sessionId =
        String(
          active.id,
        );

      const targetDayId =
        String(
          over.id,
        );

      let sourceDay:
        TrainingWeekDayItem | undefined;

      let session:
        TrainingWeekSession | undefined;

      for (
        const item of
        days
      ) {

        const candidate =
          item.sessions.find(
            (
              current,
            ) =>
              current.id ===
              sessionId,
          );

        if (candidate) {
          sourceDay =
            item;

          session =
            candidate;

          break;
        }

      }

      if (
        !sourceDay ||
        !session ||
        sourceDay.day.id ===
          targetDayId
      ) {
        return;
      }

      const targetDay =
        days.find(
          (
            item,
          ) =>
            item.day.id ===
            targetDayId,
        );

      if (!targetDay) {
        return;
      }

      const previousDays =
        days;

      const movedSession: TrainingWeekSession = {
        ...session,

        dayId:
          targetDayId,
      };

      setError(
        null,
      );

      setDays(
        (
          current,
        ) =>
          current.map(
            (
              item,
            ) => {

              if (
                item.day.id ===
                sourceDay.day.id
              ) {
                return {
                  ...item,

                  sessions:
                    item.sessions.filter(
                      (
                        currentSession,
                      ) =>
                        currentSession.id !==
                        sessionId,
                    ),
                };
              }

              if (
                item.day.id ===
                targetDayId
              ) {
                return {
                  ...item,

                  sessions: [
                    ...item.sessions,
                    movedSession,
                  ],
                };
              }

              return item;
            },
          ),
      );

      try {

        const response =
          await fetch(
            `/api/training/athletes/${encodeURIComponent(
              athleteId,
            )}/sessions/${encodeURIComponent(
              session.id,
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
                  dayId:
                    targetDayId,

                  type:
                    session.type,

                  title:
                    session.title,

                  plannedStartTime:
                    session.plannedStartTime,

                  plannedDurationMinutes:
                    session.plannedDurationMinutes,

                  plannedNotes:
                    session.plannedNotes,

                  plannedRpe:
                    session.plannedRpe,
                }),
            },
          );

        if (!response.ok) {

          setDays(
            previousDays,
          );

          setError(
            'No se ha podido mover la sesión.',
          );

          return;
        }

        router.refresh();

      } catch {

        setDays(
          previousDays,
        );

        setError(
          'No se ha podido mover la sesión.',
        );

      }
    };

  return (
    <>

      <DndContext
        id="training-week-session-dnd"
        sensors={
          sensors
        }
        collisionDetection={
          closestCenter
        }
        onDragEnd={
          (event) => {
            void handleDragEnd(
              event,
            );
          }
        }
      >

        <section className="training-week-board">

          {days.map(
            (
              item,
            ) => (

              <DroppableDay
                key={
                  item.day.id
                }
                athleteId={
                  athleteId
                }
                weekId={
                  weekId
                }
                item={
                  item
                }
                canWrite={
                  canEditPlan
                }
              />

            ),
          )}

        </section>

      </DndContext>

      {error && (
        <p className="training-session-move-error">
          {error}
        </p>
      )}

    </>
  );
}
