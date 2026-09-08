import type {
  AthleteRepository,
} from './athlete-repository.port.js';

import type {
  WeekRepository,
} from './week-repository.port.js';

export interface TrainingRepositories {
  athletes:
    AthleteRepository;

  weeks:
    WeekRepository;
}

export interface TrainingUnitOfWork {
  execute<T>(
    work: (
      repositories:
        TrainingRepositories,
    ) => Promise<T>,
  ): Promise<T>;
}
