import type {
  DkturboUserId,
  NutritionPersonAccessRole,
} from '../domain/index.js';

import type {
  NutritionUnitOfWork,
} from '../ports/index.js';

export interface NutritionAccessAdministrationPerson {
  id:
    DkturboUserId;

  name:
    string;
}

export interface NutritionPersonAccessAdministrationEntry {
  userId:
    DkturboUserId;

  displayName:
    string;

  role:
    NutritionPersonAccessRole | null;

  isSelf:
    boolean;
}

export interface ListNutritionPersonAccessAdministrationInput {
  granteeUserId:
    DkturboUserId;

  people:
    readonly NutritionAccessAdministrationPerson[];
}

export const listNutritionPersonAccessAdministration =
  async (
    unitOfWork:
      NutritionUnitOfWork,

    input:
      ListNutritionPersonAccessAdministrationInput,
  ): Promise<
    NutritionPersonAccessAdministrationEntry[]
  > =>
    unitOfWork.execute(
      async ({
        personAccess,
      }) => {

        const accesses =
          await personAccess
            .listForGrantee(
              input.granteeUserId,
            );

        const accessBySubject =
          new Map(
            accesses.map(
              access => [
                access.subjectUserId,
                access.role,
              ],
            ),
          );

        return input.people.map(
          person => {

            const isSelf =
              person.id ===
              input.granteeUserId;

            return {
              userId:
                person.id,

              displayName:
                person.name,

              role:
                isSelf
                  ? 'MANAGER'
                  : accessBySubject.get(
                      person.id,
                    ) ??
                    null,

              isSelf,
            };
          },
        );
      },
    );
