import type {
  Athlete,
  AthleteAccessRole,
  DkturboUserId,
} from '../domain/index.js';

import type {
  TrainingUnitOfWork,
} from '../ports/index.js';

export interface AthleteAccessAdministrationEntry {
  athlete:
    Athlete;

  role:
    AthleteAccessRole | null;
}

export interface ListAthleteAccessAdministrationInput {
  userId:
    DkturboUserId;
}

export const listAthleteAccessAdministration =
  async (
    unitOfWork:
      TrainingUnitOfWork,

    input:
      ListAthleteAccessAdministrationInput,
  ): Promise<
    AthleteAccessAdministrationEntry[]
  > =>
    unitOfWork.execute(
      async ({
        athletes,
      }) => {

        const allAthletes =
          await athletes.listAll();

        return Promise.all(
          allAthletes.map(
            async (
              athlete,
            ) => {

              const access =
                await athletes.findAccess(
                  athlete.id,
                  input.userId,
                );

              return {
                athlete,

                role:
                  access?.role ??
                  null,
              };
            },
          ),
        );
      },
    );
