/**
 * @jest-environment jsdom
 */
 import * as fixtures from '../../resources/fixtures/data';
 import { elementCount, createMarkupWithScript, createServer, createDOM } from '../helpers';

// https://github.com/prisma/prisma/issues/8558#issuecomment-1102176746
global.setImmediate = global.setImmediate || ((fn: () => unknown, ...args: []) => global.setTimeout(fn, 0, ...args));


describe('minibars', () => {
  const getServer = createServer();

  it('shows table correctly when no minibar-options', async () => {
    const server = getServer();

    const response = await server.inject({
      url: '/rendering-info/web?_id=someid',
      method: 'POST',
      payload: {
        item: fixtures.fourColumn,
        toolRuntimeConfig: {},
      },
    });

    const markup = createMarkupWithScript(response);

    elementCount(markup, 'td').then(value => expect(value).toEqual(28));
  });

  it('uses correct cell type', async () => {
    const server = getServer();

    const response = await server.inject({
      url: '/rendering-info/web?_id=someid',
      method: 'POST',
      payload: {
        item: fixtures.minibarsNegative,
        toolRuntimeConfig: {},
      },
    });

    const markup = createMarkupWithScript(response);

    elementCount(markup, '.qtable-minibar-cell').then(value => {
      expect(value).toEqual(4);
    });
  });

  it('uses the negative bar type', async () => {
    const server = getServer();

    const response = await server.inject({
      url: '/rendering-info/web?_id=someid',
      method: 'POST',
      payload: {
        item: fixtures.minibarsNegative,
        toolRuntimeConfig: {},
      },
    });

    const markup = createMarkupWithScript(response);

    elementCount(markup, '.qtable-minibar-cell-negative').then(value => {
      expect(value).toEqual(3);
    });
  });

  it('shows negative bar and number', async () => {
    const server = getServer();

    const response = await server.inject({
      url: '/rendering-info/web?_id=someid',
      method: 'POST',
      payload: {
        item: fixtures.minibarsNegative,
        toolRuntimeConfig: {},
      },
    });

    const markup = createMarkupWithScript(response);

    elementCount(markup, '.qtable-minibar-cell').then(value => {
      expect(value).toEqual(4);
    });

    elementCount(markup, '.qtable-minibar-cell .qtable-cell-label').then(value => {
      expect(value).toEqual(4);
    });
  });

  it('shows the correct negative bar length', async () => {
    const server = getServer();

    const response = await server.inject({
      url: '/rendering-info/web?_id=someid',
      method: 'POST',
      payload: {
        item: fixtures.minibarsNegative,
        toolRuntimeConfig: {},
      },
    });

    const markup = createMarkupWithScript(response);
    const dom = createDOM(markup);
    const bars = dom.window.document.querySelectorAll('.qtable-minibar-negative');

    let widths: string[] = [];
    bars.forEach(bar => {
      const regex = /\s*width\s*:\s*([^;"]*)/;
      let width = bar.outerHTML.match(regex);

      if (width) widths.push(width[1]);
    });

    expect(widths).toEqual(['46.15384615384615%', '38.46153846153846%', '100%']);
  });

  it('uses the positive bar type', async () => {
    const server = getServer();

    const response = await server.inject({
      url: '/rendering-info/web?_id=someid',
      method: 'POST',
      payload: {
        item: fixtures.minibarsPositive,
        toolRuntimeConfig: {},
      },
    });

    const markup = createMarkupWithScript(response);

    elementCount(markup, '.qtable-minibar-positive').then(value => {
      expect(value).toEqual(3);
    });
  });

  it('uses the positive number and bar', async () => {
    const server = getServer();

    const response = await server.inject({
      url: '/rendering-info/web?_id=someid',
      method: 'POST',
      payload: {
        item: fixtures.minibarsPositive,
        toolRuntimeConfig: {},
      },
    });

    const markup = createMarkupWithScript(response);

    elementCount(markup, '.qtable-minibar-cell').then(value => {
      expect(value).toEqual(4);
    });

    elementCount(markup, '.qtable-minibar-cell .qtable-cell-label ').then(value => {
      expect(value).toEqual(4);
    });
  });

  it('show the corrent positive bar length', async () => {
    const server = getServer();

    const response = await server.inject({
      url: '/rendering-info/web?_id=someid',
      method: 'POST',
      payload: {
        item: fixtures.minibarsPositive,
        toolRuntimeConfig: {},
      },
    });

    const markup = createMarkupWithScript(response);
    const dom = createDOM(markup);
    const bars = dom.window.document.querySelectorAll('.qtable-minibar-positive');

    let widths: string[] = [];
    bars.forEach(bar => {
      const regex = /\s*width\s*:\s*([^;"]*)/;
      let width = bar.outerHTML.match(regex);

      if (width) widths.push(width[1]);
    });

    expect(widths).toEqual(['46.15384615384615%', '38.46153846153846%', '100%']);
  });

  it('show the corrent mixed bar length', async () => {
    const server = getServer();

    const response = await server.inject({
      url: '/rendering-info/web?_id=someid',
      method: 'POST',
      payload: {
        item: fixtures.minibarsPositive,
        toolRuntimeConfig: {},
      },
    });

    const markup = createMarkupWithScript(response);
    const dom = createDOM(markup);
    const positiveBars = dom.window.document.querySelectorAll('.qtable-minibar-positive');
    const negativeBars = dom.window.document.querySelectorAll('.qtable-minibar-negative');

    let widths: string[] = [];
    const regex = /\s*width\s*:\s*([^;"]*)/;

    positiveBars.forEach(bar => {
      let width = bar.outerHTML.match(regex);
      if (width) widths.push(width[1]);
    });

    negativeBars.forEach(bar => {
      let width = bar.outerHTML.match(regex);
      if (width) widths.push(width[1]);
    });

    expect(widths).toEqual(['46.15384615384615%', '38.46153846153846%', '100%']);
  });
});
