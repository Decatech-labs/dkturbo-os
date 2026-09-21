export type NutritionFoodCategory =
  | 'CEREALS'
  | 'PASTA'
  | 'RICE'
  | 'BREAD'
  | 'TUBERS'
  | 'MEAT'
  | 'FISH'
  | 'EGGS'
  | 'DAIRY'
  | 'LEGUMES'
  | 'FRUIT'
  | 'VEGETABLES'
  | 'NUTS_SEEDS'
  | 'FATS_OILS'
  | 'BEVERAGES'
  | 'SUPPLEMENTS'
  | 'OTHER';

export interface NutritionFoodCategoryOption {
  value:
    NutritionFoodCategory;

  label:
    string;
}

export const nutritionFoodCategories:
  NutritionFoodCategoryOption[] = [
    {
      value:
        'CEREALS',
      label:
        'Cereales',
    },
    {
      value:
        'PASTA',
      label:
        'Pasta',
    },
    {
      value:
        'RICE',
      label:
        'Arroz',
    },
    {
      value:
        'BREAD',
      label:
        'Pan',
    },
    {
      value:
        'TUBERS',
      label:
        'Tubérculos',
    },
    {
      value:
        'MEAT',
      label:
        'Carne',
    },
    {
      value:
        'FISH',
      label:
        'Pescado',
    },
    {
      value:
        'EGGS',
      label:
        'Huevos',
    },
    {
      value:
        'DAIRY',
      label:
        'Lácteos',
    },
    {
      value:
        'LEGUMES',
      label:
        'Legumbres',
    },
    {
      value:
        'FRUIT',
      label:
        'Fruta',
    },
    {
      value:
        'VEGETABLES',
      label:
        'Verdura',
    },
    {
      value:
        'NUTS_SEEDS',
      label:
        'Frutos secos',
    },
    {
      value:
        'FATS_OILS',
      label:
        'Grasas',
    },
    {
      value:
        'BEVERAGES',
      label:
        'Bebidas',
    },
    {
      value:
        'SUPPLEMENTS',
      label:
        'Suplementos',
    },
    {
      value:
        'OTHER',
      label:
        'Otros',
    },
  ];

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

export const inferFoodCategory =
  (
    name:
      string,
    brand:
      string,
  ): NutritionFoodCategory => {

    const value =
      normalize(
        `${name} ${brand}`,
      );

    if (
      includesAny(
        value,
        [
          'whey',
          'creatina',
          'caseina',
          'colageno',
          'electrolito',
          'bcaa',
          'eaa',
          'preentreno',
          'pre entreno',
        ],
      )
    ) {
      return 'SUPPLEMENTS';
    }

    if (
      includesAny(
        value,
        [
          'espagueti',
          'macarron',
          'tallar',
          'pasta',
          'penne',
          'fusilli',
          'ravioli',
          'tortellini',
        ],
      )
    ) {
      return 'PASTA';
    }

    if (
      includesAny(
        value,
        [
          'arroz',
          'basmati',
          'risotto',
        ],
      )
    ) {
      return 'RICE';
    }

    if (
      includesAny(
        value,
        [
          'avena',
          'cereal',
          'muesli',
          'granola',
          'copos',
          'trigo',
          'centeno',
          'cebada',
        ],
      )
    ) {
      return 'CEREALS';
    }

    if (
      includesAny(
        value,
        [
          'pan',
          'baguette',
          'tostada',
          'wrap',
          'pita',
        ],
      )
    ) {
      return 'BREAD';
    }

    if (
      includesAny(
        value,
        [
          'patata',
          'boniato',
          'batata',
          'yuca',
        ],
      )
    ) {
      return 'TUBERS';
    }

    if (
      includesAny(
        value,
        [
          'pollo',
          'pavo',
          'ternera',
          'vacuno',
          'cerdo',
          'jamon',
          'carne',
        ],
      )
    ) {
      return 'MEAT';
    }

    if (
      includesAny(
        value,
        [
          'atun',
          'salmon',
          'merluza',
          'bacalao',
          'pescado',
          'gamba',
          'marisco',
        ],
      )
    ) {
      return 'FISH';
    }

    if (
      includesAny(
        value,
        [
          'huevo',
          'claras',
        ],
      )
    ) {
      return 'EGGS';
    }

    if (
      includesAny(
        value,
        [
          'leche',
          'yogur',
          'yogurt',
          'queso',
          'kefir',
          'skyr',
        ],
      )
    ) {
      return 'DAIRY';
    }

    if (
      includesAny(
        value,
        [
          'lenteja',
          'garbanzo',
          'alubia',
          'judia',
          'soja',
          'edamame',
        ],
      )
    ) {
      return 'LEGUMES';
    }

    if (
      includesAny(
        value,
        [
          'platano',
          'banana',
          'manzana',
          'pera',
          'naranja',
          'fresa',
          'kiwi',
          'mango',
          'pina',
          'uva',
        ],
      )
    ) {
      return 'FRUIT';
    }

    if (
      includesAny(
        value,
        [
          'brocoli',
          'espinaca',
          'lechuga',
          'tomate',
          'calabacin',
          'zanahoria',
          'pepino',
          'pimiento',
          'verdura',
        ],
      )
    ) {
      return 'VEGETABLES';
    }

    if (
      includesAny(
        value,
        [
          'nuez',
          'almendra',
          'avellana',
          'cacahuete',
          'pistacho',
          'anacardo',
          'semilla',
        ],
      )
    ) {
      return 'NUTS_SEEDS';
    }

    if (
      includesAny(
        value,
        [
          'aceite',
          'aguacate',
          'mantequilla',
        ],
      )
    ) {
      return 'FATS_OILS';
    }

    if (
      includesAny(
        value,
        [
          'agua',
          'zumo',
          'bebida',
          'refresco',
          'cafe',
          'infusion',
        ],
      )
    ) {
      return 'BEVERAGES';
    }

    return 'OTHER';
  };

export const getFoodCategoryLabel =
  (
    category:
      NutritionFoodCategory,
  ): string =>
    nutritionFoodCategories.find(
      option =>
        option.value ===
        category,
    )?.label ??
    'Otros';
