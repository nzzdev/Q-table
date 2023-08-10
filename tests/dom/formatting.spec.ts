import * as fixtures from '../../resources/fixtures/data';
import { createServer, elements } from '../helpers';

// const fourEmSpaceCharCode = 8197;

describe('formatting', () => {
  const getServer = createServer();

  it('formats each cell correctly', async () => {
    const server = getServer();

    const response = await server.inject({
      url: '/rendering-info/web?_id=someid',
      method: 'POST',
      payload: {
        item: fixtures.formatting,
        toolRuntimeConfig: {},
      },
    });

    // Countryflag tests.
    // Flags are not in a label element therefore a diff selection.
    elements(response, 'img').then(els => {
      // There should be only 2 because one flag is incorrect and
      // therefore not rendered.
      expect(els.length).toBe(2);

      expect(els[0].getAttribute('src')).toBe("https://q-server.st-cdn.nzz.ch/file/countryflags/svg/CH.svg");
      expect(els[1].getAttribute('src')).toBe("https://q-server.st-cdn.nzz.ch/file/countryflags/svg/DE.svg");
    });


    // Testing the number values.
    // They are found in a label element.
    const expectedNumberValues = [
      // Row 1.
      '9999 ',
      '10 000,00 ',
      '10,000 ',
      '1% ',
      '1,0% ',
      '1,00% ',
      '1,000% ',
      '➚ +1% ',

      // Row 2.
      '9999 ',
      '9 999,00 ',
      '10,000 ',
      '1% ',
      '1,0% ',
      '1,00% ',
      '1,000% ',
      '➘ –1% ',

      // Row 3.
      '9999 ',
      '1 000,00 ',
      '10,000 ',
      '1% ',
      '1,0% ',
      '1,00% ',
      '1,000% ',
      '➙ 0% ',
    ];

    elements(response, '.qtable-cell-label').then(els => {
      els.forEach((el, index) => {
        expect(el.innerHTML).toBe(expectedNumberValues[index]);
      });
    });
  });
});
