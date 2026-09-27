import type {
  FoodPreparationConversionRepository,
} from '../ports/index.js';

export const createTestFoodPreparationConversionRepository =
  (): FoodPreparationConversionRepository => ({
    create:
      async () => {
        throw new Error(
          'Not implemented',
        );
      },

    update:
      async () =>
        null,

    delete:
      async () =>
        false,

    findById:
      async () =>
        null,

    findDefaultForFood:
      async () =>
        null,

    listForFood:
      async () =>
        [],
  });
