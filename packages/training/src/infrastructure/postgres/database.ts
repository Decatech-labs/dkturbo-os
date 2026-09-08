import type {
  ColumnType,
  Generated,
} from 'kysely';

export interface TrainingAthleteTable {
  id:
    Generated<string>;

  display_name:
    string;

  created_at:
    ColumnType<
      Date,
      Date | undefined,
      never
    >;

  updated_at:
    ColumnType<
      Date,
      Date | undefined,
      Date
    >;
}

export interface TrainingAthleteAccessTable {
  id:
    Generated<string>;

  athlete_id:
    string;

  user_id:
    string;

  role:
    string;

  created_at:
    ColumnType<
      Date,
      Date | undefined,
      never
    >;
}

export interface TrainingWeekTable {
  id:
    Generated<string>;

  athlete_id:
    string;

  week_start:
    string;

  status:
    ColumnType<
      string,
      string | undefined,
      string
    >;

  title:
    string | null;

  notes:
    string | null;

  created_by_user_id:
    string;

  created_at:
    ColumnType<
      Date,
      Date | undefined,
      never
    >;

  updated_at:
    ColumnType<
      Date,
      Date | undefined,
      Date
    >;
}

export interface TrainingDayTable {
  id:
    Generated<string>;

  week_id:
    string;

  athlete_id:
    string;

  date:
    string;

  notes:
    string | null;

  created_at:
    ColumnType<
      Date,
      Date | undefined,
      never
    >;

  updated_at:
    ColumnType<
      Date,
      Date | undefined,
      Date
    >;
}

export interface TrainingSessionTable {
  id:
    Generated<string>;

  day_id:
    string;

  athlete_id:
    string;

  type:
    string;

  title:
    string;

  planned_start_time:
    string | null;

  planned_duration_minutes:
    number | null;

  actual_start_time:
    string | null;

  actual_duration_minutes:
    number | null;

  status:
    ColumnType<
      string,
      string | undefined,
      string
    >;

  planned_notes:
    string | null;

  actual_notes:
    string | null;

  planned_rpe:
    string | null;

  actual_rpe:
    string | null;

  source:
    ColumnType<
      string,
      string | undefined,
      string
    >;

  external_id:
    string | null;

  created_by_user_id:
    string;

  created_at:
    ColumnType<
      Date,
      Date | undefined,
      never
    >;

  updated_at:
    ColumnType<
      Date,
      Date | undefined,
      Date
    >;
}

export interface TrainingDatabase {
  'training.athletes':
    TrainingAthleteTable;

  'training.athlete_access':
    TrainingAthleteAccessTable;

  'training.weeks':
    TrainingWeekTable;

  'training.days':
    TrainingDayTable;

  'training.sessions':
    TrainingSessionTable;
}
