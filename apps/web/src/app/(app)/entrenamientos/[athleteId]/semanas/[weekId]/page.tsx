import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

import Link from 'next/link';

import {
  requireAccessPermission,
} from '../../../../../../lib/access-server';

import {
  getTrainingAthletes,
  getTrainingWeekDetail,
  getTrainingWeeks,
} from '../../../../../../lib/training-api';

import {
  InlineWeekMetadata,
} from './inline-week-metadata';

import {
  TrainingWeekSessionBoard,
} from './training-week-session-board';

import {
  TrainingWeekExport,
} from './training-week-export';

import {
  TrainingMobileEditToggle,
} from '../../../training-mobile-edit-toggle';

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

  const [
    detail,
    weeks,
    athletes,
  ] = await Promise.all([
    getTrainingWeekDetail(
      athleteId,
      weekId,
    ),

    getTrainingWeeks(
      athleteId,
    ),

    getTrainingAthletes(),
  ]);

  const athlete =
    athletes.find(
      item =>
        item.athlete.id ===
        athleteId,
    );

  const athleteName =
    athlete?.athlete.displayName ??
    'Atleta';

  const orderedWeeks =
    [...weeks].sort(
      (
        a,
        b,
      ) =>
        a.week.weekStart.localeCompare(
          b.week.weekStart,
        ),
    );

  const currentWeekIndex =
    orderedWeeks.findIndex(
      ({
        week,
      }) =>
        week.id ===
        weekId,
    );

  const previousWeek =
    currentWeekIndex >
    0
      ? orderedWeeks[
          currentWeekIndex -
          1
        ]?.week ??
        null
      : null;

  const nextWeek =
    currentWeekIndex !==
      -1 &&

    currentWeekIndex <
      orderedWeeks.length -
      1
      ? orderedWeeks[
          currentWeekIndex +
          1
        ]?.week ??
        null
      : null;

  const weekMonth =
    detail.week.weekStart.slice(
      0,
      7,
    );

  const weekStartDate =
    new Date(
      `${detail.week.weekStart}T12:00:00`,
    );

  const weekEndDate =
    new Date(
      weekStartDate,
    );

  weekEndDate.setDate(
    weekEndDate.getDate() +
      6,
  );

  const weekNavigationLabel =

    `${new Intl.DateTimeFormat(
      'es-ES',
      {
        day:
          'numeric',
      },
    ).format(
      weekStartDate,
    )}–${new Intl.DateTimeFormat(
      'es-ES',
      {
        day:
          'numeric',

        month:
          'long',

        year:
          weekStartDate.getFullYear() !==
          new Date().getFullYear()
            ? 'numeric'
            : undefined,
      },
    ).format(
      weekEndDate,
    )}`;

  return (
    <main className="training-page">

      <header className="training-page-header">

        <Link
          href={
            `/entrenamientos/${athleteId}?month=${weekMonth}`
          }
          className="system-back"
          aria-label="Volver al mes"
          title="Volver al mes"
        >
          <ArrowLeft />
        </Link>

        <div className="training-week-header-main">

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

          <TrainingWeekExport
            athleteId={
              athleteId
            }
            weekId={
              weekId
            }
            athleteName={
              athleteName
            }
            weekStart={
              detail.week.weekStart
            }
          />

        </div>

      </header>

      <nav
        className="training-week-switcher"
        aria-label="Navegación entre semanas"
      >

        {previousWeek ? (

          <Link

            href={`/entrenamientos/${athleteId}/semanas/${previousWeek.id}`}

            className="training-week-switcher-button"

            aria-label="Semana anterior"

            title="Semana anterior"

          >

            <ChevronLeft />

          </Link>

        ) : (

          <span
            className="training-week-switcher-button training-week-switcher-disabled"
            aria-hidden="true"
          >

            <ChevronLeft />

          </span>

        )}

        <div className="training-week-switcher-current">

          <span>

            Semana

          </span>

          <strong>

            {
              weekNavigationLabel
            }

          </strong>

        </div>

        {nextWeek ? (

          <Link

            href={`/entrenamientos/${athleteId}/semanas/${nextWeek.id}`}

            className="training-week-switcher-button"

            aria-label="Semana siguiente"

            title="Semana siguiente"

          >

            <ChevronRight />

          </Link>

        ) : (

          <span
            className="training-week-switcher-button training-week-switcher-disabled"
            aria-hidden="true"
          >

            <ChevronRight />

          </span>

        )}

      </nav>

      <TrainingMobileEditToggle
        canWrite={
          detail.canWrite
        }
      />

      <TrainingWeekSessionBoard
        athleteId={
          athleteId
        }
        weekId={
          weekId
        }
        initialDays={
          detail.days
        }
        canWrite={
          detail.canWrite
        }
      />

    </main>
  );
}
