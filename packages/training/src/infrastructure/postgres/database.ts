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
    ColumnType<
      string | Date,
      string,
      string
    >;

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
    ColumnType<
      string | Date,
      string,
      string
    >;

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

export interface TrainingSessionBlockTable {
  id:
    Generated<string>;

  session_id:
    string;

  athlete_id:
    string;

  position:
    number;

  title:
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

export interface TrainingExerciseCatalogTable {
  id:
    Generated<string>;

  name:
    string;

  category:
    string | null;

  sport:
    string | null;

  metric_profile:
    ColumnType<
      string,
      string | undefined,
      string
    >;

  origin:
    ColumnType<
      string,
      string | undefined,
      string
    >;

  created_by_user_id:
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

  archived_at:
    Date | null;
}

export interface TrainingSessionExerciseTable {
  id:
    Generated<string>;

  block_id:
    string;

  session_id:
    string;

  athlete_id:
    string;

  exercise_id:
    string;

  position:
    number;

  planned_notes:
    string | null;

  actual_notes:
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

export interface TrainingPerformanceEntryTable {
  id:
    Generated<string>;

  session_exercise_id:
    string;

  athlete_id:
    string;

  position:
    number;

  planned_reps:
    number | null;

  actual_reps:
    number | null;

  planned_load_kg:
    string | null;

  actual_load_kg:
    string | null;

  planned_distance_m:
    string | null;

  actual_distance_m:
    string | null;

  planned_duration_ms:
    number | null;

  actual_duration_ms:
    number | null;

  planned_result_m:
    string | null;

  actual_result_m:
    string | null;

  planned_height_m:
    string | null;

  actual_height_m:
    string | null;

  planned_rpe:
    string | null;

  actual_rpe:
    string | null;

  planned_rir:
    string | null;

  actual_rir:
    string | null;

  planned_rest_seconds:
    number | null;

  actual_rest_seconds:
    number | null;

  actual_success:
    boolean | null;

  actual_is_foul:
    boolean | null;

  planned_metrics:
    Record<
      string,
      unknown
    >;

  actual_metrics:
    Record<
      string,
      unknown
    >;

  planned_notes:
    string | null;

  actual_notes:
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

  'training.session_blocks':
    TrainingSessionBlockTable;

  'training.exercise_catalog':
    TrainingExerciseCatalogTable;

  'training.session_exercises':
    TrainingSessionExerciseTable;

  'training.performance_entries':
    TrainingPerformanceEntryTable;
}
