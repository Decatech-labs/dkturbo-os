import type {
  NutritionFoodPreparationConversion,
} from './nutrition.js';

export const convertRawToPrepared =
  (
    rawQuantity:
      number,

    conversion:
      Pick<
        NutritionFoodPreparationConversion,
        | 'rawAmount'
        | 'preparedAmount'
      >,
  ): number => {

    if (
      !Number.isFinite(
        rawQuantity,
      ) ||
      rawQuantity <
        0 ||
      !Number.isFinite(
        conversion.rawAmount,
      ) ||
      conversion.rawAmount <=
        0 ||
      !Number.isFinite(
        conversion.preparedAmount,
      ) ||
      conversion.preparedAmount <=
        0
    ) {
      throw new Error(
        'Invalid food preparation conversion',
      );
    }

    return (
      rawQuantity *
      conversion.preparedAmount /
      conversion.rawAmount
    );
  };

export const convertPreparedToRaw =
  (
    preparedQuantity:
      number,

    conversion:
      Pick<
        NutritionFoodPreparationConversion,
        | 'rawAmount'
        | 'preparedAmount'
      >,
  ): number => {

    if (
      !Number.isFinite(
        preparedQuantity,
      ) ||
      preparedQuantity <
        0 ||
      !Number.isFinite(
        conversion.rawAmount,
      ) ||
      conversion.rawAmount <=
        0 ||
      !Number.isFinite(
        conversion.preparedAmount,
      ) ||
      conversion.preparedAmount <=
        0
    ) {
      throw new Error(
        'Invalid food preparation conversion',
      );
    }

    return (
      preparedQuantity *
      conversion.rawAmount /
      conversion.preparedAmount
    );
  };
