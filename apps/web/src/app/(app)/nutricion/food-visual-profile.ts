import type {
  NutritionFoodResponse,
} from '../../../lib/nutrition-api';

import {
  getFoodCategoryLabel,
} from './food-categories';

export type FoodVisualCategory =
  | 'carbohydrate'
  | 'protein'
  | 'fat'
  | 'dairy'
  | 'fruit'
  | 'vegetable'
  | 'supplement'
  | 'balanced';

export interface FoodVisualProfile {
  category:
    FoodVisualCategory;

  label:
    string;
}

const normalize =
  (
    value:
      string,
  ): string =>
    value
      .normalize(
        'NFD',
      )
      .replace(
        /[\u0300-\u036f]/g,
        '',
      )
      .toLowerCase();

const includesAny =
  (
    value:
      string,

    terms:
      string[],
  ): boolean =>
    terms.some(
      term =>
        value.includes(
          term,
        ),
    );

export const getFoodVisualProfile =
  (
    food:
      NutritionFoodResponse,
  ): FoodVisualProfile => {

    switch (
      food.category
    ) {
      case 'CEREALS':
      case 'PASTA':
      case 'RICE':
      case 'BREAD':
      case 'TUBERS':
        return {
          category:
            'carbohydrate',

          label:
            getFoodCategoryLabel(
              food.category,
            ),
        };

      case 'MEAT':
      case 'FISH':
      case 'EGGS':
      case 'LEGUMES':
        return {
          category:
            'protein',

          label:
            getFoodCategoryLabel(
              food.category,
            ),
        };

      case 'DAIRY':
        return {
          category:
            'dairy',

          label:
            'Lácteo',
        };

      case 'FRUIT':
        return {
          category:
            'fruit',

          label:
            'Fruta',
        };

      case 'VEGETABLES':
        return {
          category:
            'vegetable',

          label:
            'Verdura',
        };

      case 'NUTS_SEEDS':
      case 'FATS_OILS':
        return {
          category:
            'fat',

          label:
            getFoodCategoryLabel(
              food.category,
            ),
        };

      case 'SUPPLEMENTS':
        return {
          category:
            'supplement',

          label:
            'Suplemento',
        };

      case 'BEVERAGES':
      case 'OTHER':
        break;
    }

    const name =
      normalize(
        food.name,
      );

    const brand =
      normalize(
        food.brand ??
        '',
      );

    const searchable =
      `${name} ${brand}`;

    if (
      includesAny(
        searchable,
        [
          'whey',
          'creatina',
          'caseina',
          'colageno',
          'electrolito',
          'bcaa',
          'eaa',
          'proteina en polvo',
          'pre entreno',
          'preentreno',
          'multivitamin',
          'omega 3',
        ],
      )
    ) {
      return {
        category:
          'supplement',

        label:
          'Suplemento',
      };
    }

    if (
      includesAny(
        searchable,
        [
          'leche',
          'yogur',
          'yogurt',
          'queso',
          'kefir',
          'skyr',
          'requeson',
          'quark',
        ],
      )
    ) {
      return {
        category:
          'dairy',

        label:
          'Lácteo',
      };
    }

    if (
      includesAny(
        searchable,
        [
          'platano',
          'banana',
          'manzana',
          'pera',
          'naranja',
          'mandarina',
          'fresa',
          'frambuesa',
          'arandano',
          'mora',
          'kiwi',
          'melocoton',
          'nectarina',
          'mango',
          'pina',
          'sandia',
          'melon',
          'uva',
          'cereza',
        ],
      )
    ) {
      return {
        category:
          'fruit',

        label:
          'Fruta',
      };
    }

    if (
      includesAny(
        searchable,
        [
          'brocoli',
          'espinaca',
          'lechuga',
          'tomate',
          'calabacin',
          'zanahoria',
          'pepino',
          'berenjena',
          'pimiento',
          'esparrago',
          'coliflor',
          'judia verde',
          'verdura',
        ],
      )
    ) {
      return {
        category:
          'vegetable',

        label:
          'Vegetal',
      };
    }

    if (
      includesAny(
        searchable,
        [
          'nuez',
          'almendra',
          'avellana',
          'cacahuete',
          'pistacho',
          'anacardo',
          'aguacate',
          'aceite',
          'crema de cacahuete',
          'crema cacahuete',
        ],
      )
    ) {
      return {
        category:
          'fat',

        label:
          'Grasa principal',
      };
    }

    if (
      includesAny(
        searchable,
        [
          'pollo',
          'pavo',
          'ternera',
          'vacuno',
          'cerdo',
          'atun',
          'salmon',
          'merluza',
          'bacalao',
          'huevo',
          'claras',
          'carne',
          'pescado',
        ],
      )
    ) {
      return {
        category:
          'protein',

        label:
          'Proteína principal',
      };
    }

    if (
      includesAny(
        searchable,
        [
          'avena',
          'arroz',
          'pasta',
          'pan',
          'cereal',
          'tortita',
          'patata',
          'boniato',
          'harina',
          'quinoa',
          'cuscus',
        ],
      )
    ) {
      return {
        category:
          'carbohydrate',

        label:
          'Hidrato principal',
      };
    }

    const proteinEnergy =
      food.proteinG *
      4;

    const carbohydrateEnergy =
      food.carbohydratesG *
      4;

    const fatEnergy =
      food.fatG *
      9;

    const dominant =
      Math.max(
        proteinEnergy,
        carbohydrateEnergy,
        fatEnergy,
      );

    const total =
      proteinEnergy +
      carbohydrateEnergy +
      fatEnergy;

    if (
      total <=
      0
    ) {
      return {
        category:
          'balanced',

        label:
          'Alimento',
      };
    }

    const dominance =
      dominant /
      total;

    if (
      dominance <
      0.48
    ) {
      return {
        category:
          'balanced',

        label:
          'Equilibrado',
      };
    }

    if (
      dominant ===
      proteinEnergy
    ) {
      return {
        category:
          'protein',

        label:
          'Proteína principal',
      };
    }

    if (
      dominant ===
      carbohydrateEnergy
    ) {
      return {
        category:
          'carbohydrate',

        label:
          'Hidrato principal',
      };
    }

    return {
      category:
        'fat',

      label:
        'Grasa principal',
    };
  };
