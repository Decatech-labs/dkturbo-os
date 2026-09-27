import {
  describe,
  expect,
  it,
} from 'vitest';

import {
  convertPreparedToRaw,
  convertRawToPrepared,
} from './food-preparation-conversion.js';

describe(
  'food preparation conversions',
  () => {

    const conversion = {
      rawAmount:
        100,

      preparedAmount:
        214,
    };

    it(
      'converts raw quantity to prepared quantity',
      () => {

        expect(
          convertRawToPrepared(
            140,
            conversion,
          ),
        ).toBeCloseTo(
          299.6,
        );
      },
    );

    it(
      'converts prepared quantity back to raw quantity',
      () => {

        expect(
          convertPreparedToRaw(
            299.6,
            conversion,
          ),
        ).toBeCloseTo(
          140,
        );
      },
    );

    it(
      'preserves zero quantities',
      () => {

        expect(
          convertRawToPrepared(
            0,
            conversion,
          ),
        ).toBe(
          0,
        );

        expect(
          convertPreparedToRaw(
            0,
            conversion,
          ),
        ).toBe(
          0,
        );
      },
    );

    it(
      'rejects invalid conversion values',
      () => {

        expect(
          () =>
            convertRawToPrepared(
              100,
              {
                rawAmount:
                  0,

                preparedAmount:
                  200,
              },
            ),
        ).toThrow();

        expect(
          () =>
            convertPreparedToRaw(
              -10,
              conversion,
            ),
        ).toThrow();
      },
    );
  },
);
