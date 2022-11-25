import * as fixtures from '../../resources/fixtures/data';
import {
  createDOM,
  elementCount,
  createServer,
  cardLayoutSizeObjectForToolRuntimeConfig,
  getArticleWidthSizeForToolRuntimeConfig,
  getFullWidthSizeForToolRuntimeConfig } from '../helpers';

describe('cardlayout', () => {
  const getServer = createServer();

  it('shows the cardlayout in mobile width', async () => {
    const server = getServer();

    const response = await server.inject({
      url: '/rendering-info/web?_id=someid',
      method: 'POST',
      payload: {
        item: fixtures.cardlayout,
        toolRuntimeConfig: { size: { width: [350, '<'] } },
      },
    });

    elementCount(response, '.qtable-card-layout').then(value => {
      expect(value).toEqual(1);
    });
  });

  it('shows the cardlayout in article width', async () => {
    const server = getServer();

    const response = await server.inject({
      url: '/rendering-info/web?_id=someid',
      method: 'POST',
      payload: {
        item: fixtures.cardlayout,
        toolRuntimeConfig: { size: { width: [500, '>'] } },
      },
    });

    elementCount(response, '.qtable-card-layout').then(value => {
      expect(value).toEqual(1);
    });
  });

  it('shows the cardlayout in full width', async () => {
    const server = getServer();

    const response = await server.inject({
      url: '/rendering-info/web?_id=someid',
      method: 'POST',
      payload: {
        item: fixtures.cardlayout,
        toolRuntimeConfig: { size: { width: [800, '>'] } },
      },
    });

    elementCount(response, '.qtable-card-layout').then(value => {
      expect(value).toEqual(1);
    });
  });
});

describe('cardlayout on mobile', () => {
  const getServer = createServer();

  it('shows the cardlayout in mobile width', async () => {
    const server = getServer();

    const response = await server.inject({
      url: '/rendering-info/web?_id=someid',
      method: 'POST',
      payload: {
        item: fixtures.cardlayoutMobile,
        toolRuntimeConfig: { size: cardLayoutSizeObjectForToolRuntimeConfig() },
      },
    });

    const dom = createDOM(response);
    const includedClass = dom.window.document.body.querySelector(".q-table-container")?.innerHTML.includes('qtable-card-layout');

    expect(includedClass).toEqual(true);
  });

  it("doesn't show the cardlayout in article width", async () => {
    const server = getServer();

    const response = await server.inject({
      url: '/rendering-info/web?_id=someid',
      method: 'POST',
      payload: {
        item: fixtures.cardlayoutMobile,
        toolRuntimeConfig: { size: getArticleWidthSizeForToolRuntimeConfig() },
      },
    });

    const dom = createDOM(response);
    const includedClass = dom.window.document.body.querySelector(".q-table-container")?.innerHTML.includes('qtable-card-layout');

    expect(includedClass).toEqual(false);
  });

  it("doesn't show the cardlayout in full width", async () => {
    const server = getServer();

    const response = await server.inject({
      url: '/rendering-info/web?_id=someid',
      method: 'POST',
      payload: {
        item: fixtures.cardlayoutMobile,
        toolRuntimeConfig: { size: getFullWidthSizeForToolRuntimeConfig() },
      },
    });

    const dom = createDOM(response);
    const includedClass = dom.window.document.body.querySelector(".q-table-container")?.innerHTML.includes('qtable-card-layout');

    expect(includedClass).toEqual(false);
  });
});
