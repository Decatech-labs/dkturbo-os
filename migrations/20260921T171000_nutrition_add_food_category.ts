import {
  sql,
  type Kysely,
} from 'kysely';

export async function up(
  db:
    Kysely<unknown>,
): Promise<void> {

  await sql`
    ALTER TABLE nutrition.foods
    ADD COLUMN category text
  `.execute(
    db,
  );

  await sql`
    UPDATE nutrition.foods
    SET category =
      CASE
        WHEN lower(
          translate(
            name || ' ' || coalesce(brand, ''),
            'áéíóúüñÁÉÍÓÚÜÑ',
            'aeiouunAEIOUUN'
          )
        ) ~
          'whey|creatina|caseina|colageno|electrolito|bcaa|eaa|pre.?entreno|proteina en polvo|multivitamin|omega 3'
          THEN 'SUPPLEMENTS'

        WHEN lower(
          translate(
            name || ' ' || coalesce(brand, ''),
            'áéíóúüñÁÉÍÓÚÜÑ',
            'aeiouunAEIOUUN'
          )
        ) ~
          'espagueti|macarron|tallar|penne|fusilli|pasta|lasana|ravioli|tortellini|noodle'
          THEN 'PASTA'

        WHEN lower(
          translate(
            name || ' ' || coalesce(brand, ''),
            'áéíóúüñÁÉÍÓÚÜÑ',
            'aeiouunAEIOUUN'
          )
        ) ~
          'arroz|basmati|risotto'
          THEN 'RICE'

        WHEN lower(
          translate(
            name || ' ' || coalesce(brand, ''),
            'áéíóúüñÁÉÍÓÚÜÑ',
            'aeiouunAEIOUUN'
          )
        ) ~
          'pan|baguette|tostada|wrap|pita'
          THEN 'BREAD'

        WHEN lower(
          translate(
            name || ' ' || coalesce(brand, ''),
            'áéíóúüñÁÉÍÓÚÜÑ',
            'aeiouunAEIOUUN'
          )
        ) ~
          'avena|cereal|muesli|granola|corn flakes|copos|trigo|centeno|cebada'
          THEN 'CEREALS'

        WHEN lower(
          translate(
            name || ' ' || coalesce(brand, ''),
            'áéíóúüñÁÉÍÓÚÜÑ',
            'aeiouunAEIOUUN'
          )
        ) ~
          'patata|boniato|batata|yuca'
          THEN 'TUBERS'

        WHEN lower(
          translate(
            name || ' ' || coalesce(brand, ''),
            'áéíóúüñÁÉÍÓÚÜÑ',
            'aeiouunAEIOUUN'
          )
        ) ~
          'pollo|pavo|ternera|vacuno|cerdo|conejo|cordero|carne|jamon'
          THEN 'MEAT'

        WHEN lower(
          translate(
            name || ' ' || coalesce(brand, ''),
            'áéíóúüñÁÉÍÓÚÜÑ',
            'aeiouunAEIOUUN'
          )
        ) ~
          'atun|salmon|merluza|bacalao|sardina|caballa|pescado|gamba|langostino|marisco'
          THEN 'FISH'

        WHEN lower(
          translate(
            name || ' ' || coalesce(brand, ''),
            'áéíóúüñÁÉÍÓÚÜÑ',
            'aeiouunAEIOUUN'
          )
        ) ~
          'huevo|claras'
          THEN 'EGGS'

        WHEN lower(
          translate(
            name || ' ' || coalesce(brand, ''),
            'áéíóúüñÁÉÍÓÚÜÑ',
            'aeiouunAEIOUUN'
          )
        ) ~
          'leche|yogur|yogurt|queso|kefir|skyr|requeson|quark'
          THEN 'DAIRY'

        WHEN lower(
          translate(
            name || ' ' || coalesce(brand, ''),
            'áéíóúüñÁÉÍÓÚÜÑ',
            'aeiouunAEIOUUN'
          )
        ) ~
          'lenteja|garbanzo|alubia|judia|soja|edamame|legumbre'
          THEN 'LEGUMES'

        WHEN lower(
          translate(
            name || ' ' || coalesce(brand, ''),
            'áéíóúüñÁÉÍÓÚÜÑ',
            'aeiouunAEIOUUN'
          )
        ) ~
          'platano|banana|manzana|pera|naranja|mandarina|fresa|frambuesa|arandano|mora|kiwi|melocoton|nectarina|mango|pina|sandia|melon|uva|cereza'
          THEN 'FRUIT'

        WHEN lower(
          translate(
            name || ' ' || coalesce(brand, ''),
            'áéíóúüñÁÉÍÓÚÜÑ',
            'aeiouunAEIOUUN'
          )
        ) ~
          'brocoli|espinaca|lechuga|tomate|calabacin|zanahoria|pepino|berenjena|pimiento|esparrago|coliflor|verdura'
          THEN 'VEGETABLES'

        WHEN lower(
          translate(
            name || ' ' || coalesce(brand, ''),
            'áéíóúüñÁÉÍÓÚÜÑ',
            'aeiouunAEIOUUN'
          )
        ) ~
          'nuez|almendra|avellana|cacahuete|pistacho|anacardo|semilla|chia|sesamo'
          THEN 'NUTS_SEEDS'

        WHEN lower(
          translate(
            name || ' ' || coalesce(brand, ''),
            'áéíóúüñÁÉÍÓÚÜÑ',
            'aeiouunAEIOUUN'
          )
        ) ~
          'aceite|aguacate|mantequilla|margarina'
          THEN 'FATS_OILS'

        WHEN lower(
          translate(
            name || ' ' || coalesce(brand, ''),
            'áéíóúüñÁÉÍÓÚÜÑ',
            'aeiouunAEIOUUN'
          )
        ) ~
          'agua|zumo|bebida|refresco|cafe|infusion'
          THEN 'BEVERAGES'

        ELSE 'OTHER'
      END
  `.execute(
    db,
  );

  await sql`
    ALTER TABLE nutrition.foods
    ALTER COLUMN category SET NOT NULL
  `.execute(
    db,
  );

  await sql`
    ALTER TABLE nutrition.foods
    ADD CONSTRAINT nutrition_foods_category_check
    CHECK (
      category IN (
        'CEREALS',
        'PASTA',
        'RICE',
        'BREAD',
        'TUBERS',
        'MEAT',
        'FISH',
        'EGGS',
        'DAIRY',
        'LEGUMES',
        'FRUIT',
        'VEGETABLES',
        'NUTS_SEEDS',
        'FATS_OILS',
        'BEVERAGES',
        'SUPPLEMENTS',
        'OTHER'
      )
    )
  `.execute(
    db,
  );

  await sql`
    CREATE INDEX nutrition_foods_category_idx
    ON nutrition.foods(category)
    WHERE archived_at IS NULL
  `.execute(
    db,
  );
}

export async function down(
  db:
    Kysely<unknown>,
): Promise<void> {

  await sql`
    DROP INDEX IF EXISTS nutrition.nutrition_foods_category_idx
  `.execute(
    db,
  );

  await sql`
    ALTER TABLE nutrition.foods
    DROP COLUMN IF EXISTS category
  `.execute(
    db,
  );
}
