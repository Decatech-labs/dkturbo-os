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
} from './new-session-control';

import {
  useTrainingMobileMode,
  useTrainingMobileEditMode,
} from '../use-training-mobile-mode';

interface MonthSession {
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

interface MonthCalendarCell {
  date:
    string;

  dayNumber:
    number;

  isCurrentMonth:
    boolean;

  isToday:
    boolean;

  weekId:
    string | null;

  dayId:
    string | null;

  sessions:
    MonthSession[];
}

interface TrainingMonthSessionBoardProps {
  athleteId:
    string;

  initialCells:
    MonthCalendarCell[];

  canWrite:
    boolean;
}

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

const getMondayForDate =
  (
    value:
      string,
  ): string => {

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
      throw new Error(
        `Invalid date: ${value}`,
      );
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

    const mondayOffset =
      (
        date.getDay() +
        6
      ) %
      7;

    date.setDate(
      date.getDate() -
        mondayOffset,
    );

    const resultYear =
      date.getFullYear();

    const resultMonth =
      String(
        date.getMonth() +
          1,
      ).padStart(
        2,
        '0',
      );

    const resultDay =
      String(
        date.getDate(),
      ).padStart(
        2,
        '0',
      );

    return `${resultYear}-${resultMonth}-${resultDay}`;
  };

const formatDateLabel =
  (
    value:
      string,
  ): string => {

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
      return value;
    }

    return new Intl.DateTimeFormat(
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
        year,
        month - 1,
        day,
        12,
      ),
    );
  };

function DraggableMonthSession({
  athleteId,
  session,
  canWrite,
}: {
  athleteId:
    string;

  session:
    MonthSession;

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
            60,

          opacity:
            isDragging
              ? 0.7
              : 1,
        }
      : undefined;

  return (
    <Link
      ref={
        setNodeRef
      }
      href={
        `/entrenamientos/${athleteId}/sesiones/${session.id}?from=month`
      }
      className="training-session-row training-calendar-session"
      data-session-type={
        session.type
      }
      title={
        session.title
      }
      style={
        style
      }
      {...attributes}
      {...listeners}
    >

      <div className="training-calendar-session-main">

        <span className="training-calendar-session-type">
          {sessionTypeLabel(
            session.type,
          )}
        </span>

        <strong>
          {session.title}
        </strong>

        {session.plannedStartTime && (
          <span className="training-calendar-session-time">

            <Clock3 />

            {session.plannedStartTime}

          </span>
        )}

      </div>

    </Link>
  );
}

function DroppableMonthDay({
  athleteId,
  cell,
  canWrite,
}: {
  athleteId:
    string;

  cell:
    MonthCalendarCell;

  canWrite:
    boolean;
}) {

  const {
    setNodeRef,
    isOver,
  } = useDroppable({
    id:
      cell.date,

    disabled:
      !canWrite,

    data: {
      type:
        'training-calendar-day',

      date:
        cell.date,

      dayId:
        cell.dayId,
    },
  });

  return (
    <article
      ref={
        setNodeRef
      }
      className={[
        'training-calendar-day',

        cell.isCurrentMonth
          ? ''
          : 'training-calendar-day-outside',

        cell.isToday
          ? 'training-calendar-day-today'
          : '',

        isOver
          ? 'training-calendar-day-drop-target'
          : '',
      ]
        .filter(
          Boolean,
        )
        .join(
          ' ',
        )}
    >

      {cell.weekId && (

        <Link
          href={
            `/entrenamientos/${athleteId}/semanas/${cell.weekId}`
          }
          className="training-calendar-week-hitarea"
          aria-label={
            `Abrir semana de ${cell.date}`
          }
        />

      )}

      <header className="training-calendar-day-header">

        <span className="training-calendar-day-number">
          {cell.dayNumber}
        </span>

        <div className="training-calendar-day-actions">

          {canWrite &&
            cell.isCurrentMonth && (

            <NewSessionControl
              athleteId={
                athleteId
              }
              dayId={
                cell.dayId
              }
              date={
                cell.date
              }
              dateLabel={
                formatDateLabel(
                  cell.date,
                )
              }
            />

          )}

        </div>

      </header>

      <div className="training-calendar-day-sessions">

        {cell.sessions.map(
          (
            session,
          ) => (

            <DraggableMonthSession
              key={
                session.id
              }
              athleteId={
                athleteId
              }
              session={
                session
              }
              canWrite={
                canWrite
              }
            />

          ),
        )}

      </div>

    </article>
  );
}

export function TrainingMonthSessionBoard({
  athleteId,
  initialCells,
  canWrite,
}: TrainingMonthSessionBoardProps) {

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
    cells,
    setCells,
  ] = useState(
    initialCells,
  );

  const [
    error,
    setError,
  ] = useState<string | null>(
    null,
  );

  useEffect(
    () => {
      setCells(
        initialCells,
      );

      setError(
        null,
      );
    },
    [
      initialCells,
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

      const targetDate =
        String(
          over.id,
        );

      let sourceCell:
        MonthCalendarCell | undefined;

      let session:
        MonthSession | undefined;

      for (
        const cell of
        cells
      ) {

        const candidate =
          cell.sessions.find(
            (
              current,
            ) =>
              current.id ===
              sessionId,
          );

        if (candidate) {
          sourceCell =
            cell;

          session =
            candidate;

          break;
        }

      }

      if (
        !sourceCell ||
        !session ||
        sourceCell.date ===
          targetDate
      ) {
        return;
      }

      const targetCell =
        cells.find(
          (
            cell,
          ) =>
            cell.date ===
            targetDate,
        );

      if (!targetCell) {
        return;
      }

      const previousCells =
        cells;

      setError(
        null,
      );

      /*
       * Optimistic visual movement.
       *
       * dayId is replaced after resolving
       * the real destination day.
       */
      setCells(
        (
          current,
        ) =>
          current.map(
            (
              cell,
            ) => {

              if (
                cell.date ===
                sourceCell.date
              ) {
                return {
                  ...cell,

                  sessions:
                    cell.sessions.filter(
                      (
                        currentSession,
                      ) =>
                        currentSession.id !==
                        sessionId,
                    ),
                };
              }

              if (
                cell.date ===
                targetDate
              ) {
                return {
                  ...cell,

                  sessions: [
                    ...cell.sessions,
                    session,
                  ],
                };
              }

              return cell;
            },
          ),
      );

      let targetDayId =
        targetCell.dayId;

      let createdWeek =
        false;

      try {

        if (!targetDayId) {

          const weekResponse =
            await fetch(
              `/api/training/athletes/${encodeURIComponent(
                athleteId,
              )}/weeks`,
              {
                method:
                  'POST',

                headers: {
                  'content-type':
                    'application/json',
                },

                body:
                  JSON.stringify({
                    weekStart:
                      getMondayForDate(
                        targetDate,
                      ),

                    title:
                      null,

                    notes:
                      null,
                  }),
              },
            );

          if (!weekResponse.ok) {

            if (
              weekResponse.status ===
              403
            ) {
              throw new Error(
                'No tienes permiso para preparar ese día.',
              );
            }

            if (
              weekResponse.status ===
              409
            ) {
              throw new Error(
                'La semana de destino acaba de cambiar. Actualiza el calendario.',
              );
            }

            throw new Error(
              'No se ha podido preparar el día de destino.',
            );
          }

          const week =
            await weekResponse.json() as {
              week: {
                id:
                  string;
              };

              days: Array<{
                id:
                  string;

                date:
                  string;
              }>;
            };

          const targetDay =
            week.days.find(
              (
                candidate,
              ) =>
                candidate.date ===
                targetDate,
            );

          if (!targetDay) {
            throw new Error(
              'No se ha podido localizar el día de destino.',
            );
          }

          targetDayId =
            targetDay.id;

          createdWeek =
            true;
        }

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
          throw new Error(
            'No se ha podido mover la sesión.',
          );
        }

        router.refresh();

      } catch (
        caught
      ) {

        setCells(
          previousCells,
        );

        setError(
          caught instanceof Error
            ? caught.message
            : 'No se ha podido mover la sesión.',
        );

        /*
         * If the destination week was already
         * created before PATCH failed, refresh
         * so the calendar reflects server state.
         */
        if (
          createdWeek
        ) {
          router.refresh();
        }

      }
    };

  return (
    <>

      <DndContext
        id="training-month-session-dnd"
        sensors={
          sensors
        }
        collisionDetection={
          closestCenter
        }
        onDragEnd={
          (
            event,
          ) => {
            void handleDragEnd(
              event,
            );
          }
        }
      >

        <div className="training-calendar-grid">

          {cells.map(
            (
              cell,
            ) => (

              <DroppableMonthDay
                key={
                  cell.date
                }
                athleteId={
                  athleteId
                }
                cell={
                  cell
                }
                canWrite={
                  canEditPlan
                }
              />

            ),
          )}

        </div>

      </DndContext>

      {error && (
        <p className="training-session-move-error">
          {error}
        </p>
      )}

    </>
  );
}
