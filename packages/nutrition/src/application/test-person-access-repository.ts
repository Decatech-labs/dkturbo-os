import type {
  PersonAccessRepository,
} from '../ports/index.js';

export const createTestPersonAccessRepository =
  (): PersonAccessRepository => ({
    findAccess:
      async () =>
        null,

    listForGrantee:
      async () =>
        [],

    grantAccess:
      async () => {
        throw new Error(
          'Unexpected personAccess.grantAccess in test',
        );
      },

    revokeAccess:
      async () =>
        false,
  });
