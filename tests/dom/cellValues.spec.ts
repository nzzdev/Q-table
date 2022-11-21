/**
 * @jest-environment jsdom
 */
 import * as fixtures from '../../resources/fixtures/data';
 import { elementCount, createMarkupWithScript, createServer, elements } from '../helpers';

// https://github.com/prisma/prisma/issues/8558#issuecomment-1102176746
global.setImmediate = global.setImmediate || ((fn: () => unknown, ...args: []) => global.setTimeout(fn, 0, ...args));

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

    const markup = createMarkupWithScript(response);

    elementCount(markup, '.qtable-cell-text').then(value => {
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

    const markup = createMarkupWithScript(response);

    elements(markup, '.qtable-cell-numeric .qtable-cell-label').then(elements => {
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

    const markup = createMarkupWithScript(response);

    elements(markup, '.qtable-cell-numeric .qtable-cell-label').then(elements => {
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

    const markup = createMarkupWithScript(response);

    elements(markup, '.qtable-cell-numeric .qtable-cell-label').then(elements => {
      expect(elements[0].innerHTML.charCodeAt(1)).toEqual(fourEmSpaceCharCode);
    });
  });
});
