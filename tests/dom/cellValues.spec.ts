import * as fixtures from '../../resources/fixtures/data';
import { elementCount, createServer, elements } from '../helpers';

const fourEmSpaceCharCode = 8197;

describe('cell values', () => {
  const getServer = createServer();

  it('should display special characters as text', async () => {
    const server = getServer();

    const response = await server.inject({
      url: '/rendering-info/web?_id=someid',
      method: 'POST',
      payload: {
        item: fixtures.specialCharacters,
        toolRuntimeConfig: {},
      },
    });

    elementCount(response, '.qtable-cell-text').then(value => {
      expect(value).toEqual(28);
    });
  });

  it('should display > 10000 show formatted', async () => {
    const server = getServer();

    const response = await server.inject({
      url: '/rendering-info/web?_id=someid',
      method: 'POST',
      payload: {
        item: fixtures.formattedNumbers,
        toolRuntimeConfig: {},
      },
    });

    elements(response, '.qtable-cell-numeric .qtable-cell-label').then(elements => {
      elements.forEach(element => {
        expect(element.innerHTML.charCodeAt(2)).toEqual(fourEmSpaceCharCode);
      });
    });
  });

  it('should display < -10000 show formatted', async () => {
    const server = getServer();

    const response = await server.inject({
      url: '/rendering-info/web?_id=someid',
      method: 'POST',
      payload: {
        item: fixtures.formattedNumbersNegative,
        toolRuntimeConfig: {},
      },
    });

    elements(response, '.qtable-cell-numeric .qtable-cell-label').then(elements => {
      expect(elements[1].innerHTML.charCodeAt(3)).toEqual(fourEmSpaceCharCode);
    });
  });

  it('should display > 1000 when column contains > 10000', async () => {
    const server = getServer();

    const response = await server.inject({
      url: '/rendering-info/web?_id=someid',
      method: 'POST',
      payload: {
        item: fixtures.formattedNumbersMixed,
        toolRuntimeConfig: {},
      },
    });

    elements(response, '.qtable-cell-numeric .qtable-cell-label').then(elements => {
      expect(elements[0].innerHTML.charCodeAt(1)).toEqual(fourEmSpaceCharCode);
    });
  });
});
