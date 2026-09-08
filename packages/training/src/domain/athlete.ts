export type AthleteId =
  string & {
    readonly __brand:
      'AthleteId';
  };

export type DkturboUserId =
  string & {
    readonly __brand:
      'DkturboUserId';
  };

export type AthleteAccessRole =
  | 'SELF'
  | 'COACH'
  | 'VIEWER';

export interface Athlete {
  id: AthleteId;
  displayName: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AthleteAccess {
  id: string;
  athleteId: AthleteId;
  userId: DkturboUserId;
  role: AthleteAccessRole;
  createdAt: Date;
}
