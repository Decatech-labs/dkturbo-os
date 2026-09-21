import type {
  NutritionFoodCategory,
} from './nutrition.js';

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

export const inferNutritionFoodCategory =
  (
    name:
      string,

    brand:
      string | null,
  ): NutritionFoodCategory => {

    const searchable =
      normalize(
        `${name} ${brand ?? ''}`,
      );

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
          'pre entreno',
          'preentreno',
          'proteina en polvo',
          'multivitamin',
          'omega 3',
        ],
      )
    ) {
      return 'SUPPLEMENTS';
    }

    if (
      includesAny(
        searchable,
        [
          'espagueti',
          'macarron',
          'tallar',
          'penne',
          'fusilli',
          'pasta',
          'lasana',
          'ravioli',
          'tortellini',
          'noodle',
        ],
      )
    ) {
      return 'PASTA';
    }

    if (
      includesAny(
        searchable,
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
        searchable,
        [
          'pan',
          'baguette',
          'tostada',
          'tortilla trigo',
          'wrap',
          'pita',
        ],
      )
    ) {
      return 'BREAD';
    }

    if (
      includesAny(
        searchable,
        [
          'avena',
          'cereal',
          'muesli',
          'granola',
          'corn flakes',
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
        searchable,
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
        searchable,
        [
          'pollo',
          'pavo',
          'ternera',
          'vacuno',
          'cerdo',
          'conejo',
          'cordero',
          'carne',
          'jamon',
        ],
      )
    ) {
      return 'MEAT';
    }

    if (
      includesAny(
        searchable,
        [
          'atun',
          'salmon',
          'merluza',
          'bacalao',
          'sardina',
          'caballa',
          'pescado',
          'gamba',
          'langostino',
          'marisco',
        ],
      )
    ) {
      return 'FISH';
    }

    if (
      includesAny(
        searchable,
        [
          'huevo',
          'claras',
          'clara de huevo',
        ],
      )
    ) {
      return 'EGGS';
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
      return 'DAIRY';
    }

    if (
      includesAny(
        searchable,
        [
          'lenteja',
          'garbanzo',
          'alubia',
          'judia',
          'soja',
          'edamame',
          'legumbre',
        ],
      )
    ) {
      return 'LEGUMES';
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
      return 'FRUIT';
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
          'verdura',
        ],
      )
    ) {
      return 'VEGETABLES';
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
          'semilla',
          'chia',
          'sesamo',
        ],
      )
    ) {
      return 'NUTS_SEEDS';
    }

    if (
      includesAny(
        searchable,
        [
          'aceite',
          'aguacate',
          'mantequilla',
          'margarina',
        ],
      )
    ) {
      return 'FATS_OILS';
    }

    if (
      includesAny(
        searchable,
        [
          'agua',
          'zumo',
          'bebida',
          'refresco',
          'cafe',
          'te ',
          'infusion',
        ],
      )
    ) {
      return 'BEVERAGES';
    }

    return 'OTHER';
  };
