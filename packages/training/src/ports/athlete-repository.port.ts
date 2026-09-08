import type {
  Athlete,
  AthleteAccess,
  AthleteAccessRole,
  AthleteId,
  DkturboUserId,
} from '../domain/index.js';

export interface CreateAthleteData {
  displayName: string;
}

export interface GrantAthleteAccessData {
  athleteId: AthleteId;
  userId: DkturboUserId;
  role: AthleteAccessRole;
}

export interface AthleteRepository {
  create(
    data: CreateAthleteData,
  ): Promise<Athlete>;

  findById(
    athleteId: AthleteId,
  ): Promise<Athlete | null>;

  listForUser(
    userId: DkturboUserId,
  ): Promise<Athlete[]>;

  grantAccess(
    data: GrantAthleteAccessData,
  ): Promise<AthleteAccess>;

  findAccess(
    athleteId: AthleteId,
    userId: DkturboUserId,
  ): Promise<AthleteAccess | null>;
}
