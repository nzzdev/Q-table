import * as fixtures from '../../resources/fixtures/data';
import { elementCount, createServer, elements, element } from '../helpers';

describe('color column', () => {
  const getServer = createServer();

  it('displays the numerical legend', async () => {
    const server = getServer();

    const response = await server.inject({
      url: '/rendering-info/web?_id=someid',
      method: 'POST',
      payload: {
        item: fixtures.colorColumnNumerical,
        toolRuntimeConfig: {},
      },
    });

    elementCount(response, '.q-table-colorColumn-legend--numerical').then(value => expect(value).toEqual(1));
  });

  it('displays the correct amount of buckets', async () => {
    const server = getServer();

    const response = await server.inject({
      url: '/rendering-info/web?_id=someid',
      method: 'POST',
      payload: {
        item: fixtures.colorColumnNumerical,
        toolRuntimeConfig: {},
      },
    });

    elementCount(response, '.q-table-colorColumn-legend .q-table-colorColumn-legend-bucket').then(value => expect(value).toEqual(5));
  });

  it('displays label legend', async () => {
    const server = getServer();

    const response = await server.inject({
      url: '/rendering-info/web?_id=someid',
      method: 'POST',
      payload: {
        item: fixtures.colorColumnNumerical,
        toolRuntimeConfig: {},
      },
    });

    elementCount(response, '.q-table-colorColumn-legend-marker').then(value => expect(value).toEqual(1));
  });

  it('doesnt display label legend', async () => {
    const server = getServer();

    const response = await server.inject({
      url: '/rendering-info/web?_id=someid',
      method: 'POST',
      payload: {
        item: fixtures.colorColumnNumericalNoLabel,
        toolRuntimeConfig: {},
      },
    });

    elementCount(response, '.q-table-colorColumn-legend-marker').then(value => expect(value).toEqual(0));
  });

  it('displays no-data in legend', async () => {
    const server = getServer();

    const response = await server.inject({
      url: '/rendering-info/web?_id=someid',
      method: 'POST',
      payload: {
        item: fixtures.colorColumnNumericalNoData,
        toolRuntimeConfig: {},
      },
    });

    elementCount(response, '.q-table-colorColumn-legend-info--no-data').then(value => expect(value).toEqual(1));
  });

  it('does not display no-data in legend', async () => {
    const server = getServer();

    const response = await server.inject({
      url: '/rendering-info/web?_id=someid',
      method: 'POST',
      payload: {
        item: fixtures.colorColumnNumericalNoLabel,
        toolRuntimeConfig: {},
      },
    });

    elementCount(response, '.q-table-colorColumn-legend-info--no-data').then(value => expect(value).toEqual(0));
  });

  it('displays single-bucket in legend', async () => {
    const server = getServer();

    const response = await server.inject({
      url: '/rendering-info/web?_id=someid',
      method: 'POST',
      payload: {
        item: fixtures.colorColumnNumericalNoData,
        toolRuntimeConfig: {},
      },
    });

    elementCount(response, '.q-table-colorColumn-legend-info--single-bucket').then(value => expect(value).toEqual(1));
  });

  it('displays the categorical legend', async () => {
    const server = getServer();

    const response = await server.inject({
      url: '/rendering-info/web?_id=someid',
      method: 'POST',
      payload: {
        item: fixtures.colorColumnCategorical,
        toolRuntimeConfig: {},
      },
    });

    elementCount(response, '.q-table-colorColumn-legend--categorical').then(value => expect(value).toEqual(1));
  });

  it('displays buckets in custom color (numerical)', async () => {
    const server = getServer();

    const response = await server.inject({
      url: '/rendering-info/web?_id=someid',
      method: 'POST',
      payload: {
        item: fixtures.colorColumnNumericalCustomColors,
        toolRuntimeConfig: {},
      },
    });

    const sel = '.q-table-colorColumn-legend-info--single-bucket .q-table-colorColumn-legend-bucket';

    element(response, sel).then(elem => {
      expect(elem.style['color']).toEqual('yellow');
    });
  });

  it('displays buckets in custonm order (categorical)', async () => {
    const server = getServer();

    const response = await server.inject({
      url: '/rendering-info/web?_id=someid',
      method: 'POST',
      payload: {
        item: fixtures.colorColumnCategoricalCustomOrder,
        toolRuntimeConfig: {},
      },
    });

    elements(response, '.q-table-colorColumn-legend--categorical .s-legend-item-label__item__label').then(elements => {
      expect(elements[0].innerHTML).toEqual('Test1');
      expect(elements[1].innerHTML).toEqual('Test2');
    });
  });

  it('displays buckets in custom color (categorical)', async () => {
    const server = getServer();

    const response = await server.inject({
      url: '/rendering-info/web?_id=someid',
      method: 'POST',
      payload: {
        item: fixtures.colorColumnCategoricalCustomColors,
        toolRuntimeConfig: {},
      },
    });

    elements(response, '.q-table-colorColumn-legend--categorical .s-legend-item-label__item').then(elements => {
      expect(elements[0].style['color']).toEqual('pink');
      expect(elements[1].style['color']).toEqual('lightblue');
    });
  });
});
