import type {
  AthleteRepository,
} from './athlete-repository.port.js';

import type {
  SessionRepository,
} from './session-repository.port.js';

import type {
  WeekRepository,
} from './week-repository.port.js';

export interface TrainingRepositories {
  athletes:
    AthleteRepository;

  weeks:
    WeekRepository;

  sessions:
    SessionRepository;
}

export interface TrainingUnitOfWork {
  execute<T>(
    work: (
      repositories:
        TrainingRepositories,
    ) => Promise<T>,
  ): Promise<T>;
}
