import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Clock3,
} from 'lucide-react';

import Link from 'next/link';

import {
  requireAccessPermission,
} from '../../../../../../lib/access-server';

import {
  getTrainingWeekDetail,
} from '../../../../../../lib/training-api';

import {
  InlineWeekMetadata,
} from './inline-week-metadata';

import {
  NewSessionControl,
} from '../../new-session-control';

export const dynamic =
  'force-dynamic';

interface TrainingWeekPageProps {
  params:
    Promise<{
      athleteId:
        string;

      weekId:
        string;
    }>;
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
      .map(Number);

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

export default async function TrainingWeekPage({
  params,
}: TrainingWeekPageProps) {

  await requireAccessPermission(
    'app.training.access',
  );

  const {
    athleteId,
    weekId,
  } = await params;

  const detail =
    await getTrainingWeekDetail(
      athleteId,
      weekId,
    );

  return (
    <main className="training-page">

      <header className="training-page-header">

        <Link
          href={`/entrenamientos/${athleteId}`}
          className="system-back"
          aria-label="Volver a semanas"
        >
          <ArrowLeft />
        </Link>

        <InlineWeekMetadata
          athleteId={
            athleteId
          }
          weekId={
            weekId
          }
          initialTitle={
            detail.week.title
          }
          initialNotes={
            detail.week.notes
          }
          canWrite={
            detail.canWrite
          }
        />

      </header>

      <section className="training-week-board">

        {detail.days.map(
          ({
            day,
            sessions,
          }) => {

            const formatted =
              formatDay(
                day.date,
              );

            return (
              <article
                key={day.id}
                className="training-day-card"
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

                  <div className="training-day-actions">
                    <span className="training-day-count">
                      {sessions.length}
                    </span>

                    {detail.canWrite && (
                      <NewSessionControl
                        athleteId={
                          athleteId
                        }
                        dayId={
                          day.id
                        }
                        date={
                          day.date
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
                              `${day.date}T12:00:00`,
                            ),
                          )
                        }
                      />
                    )}

                  </div>

                </header>

                <div className="training-day-sessions">

                  {sessions.length === 0
                    ? (
                      <div className="training-day-empty">
                        <CalendarDays />

                        <span>
                          Sin sesiones
                        </span>
                      </div>
                    )
                    : sessions.map(
                        (session) => (

                          <Link
                            key={session.id}
                            href={
                              `/entrenamientos/${athleteId}/sesiones/${session.id}`
                            }
                            className="training-session-row"
                            data-session-type={
                              session.type
                            }
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
                                session.plannedDurationMinutes) && (
                                <div className="training-session-time">

                                  <Clock3 />

                                  {session.plannedStartTime && (
                                    <span>
                                      {session.plannedStartTime}
                                    </span>
                                  )}

                                  {session.plannedDurationMinutes && (
                                    <span>
                                      {session.plannedDurationMinutes} min
                                    </span>
                                  )}

                                </div>
                              )}

                            </div>

                            <ArrowRight />

                          </Link>
                        ),
                      )}

                </div>

              </article>
            );
          },
        )}

      </section>

    </main>
  );
}
