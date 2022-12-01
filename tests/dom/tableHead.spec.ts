import * as fixtures from '../../resources/fixtures/data';
import { elementCount, createServer, createDOM } from '../helpers';
import userEvent from '@testing-library/user-event';

describe('column headers', () => {
  const getServer = createServer();

  it('shows column headers', async () => {
    const server = getServer();

    const response = await server.inject({
      url: '/rendering-info/web?_id=someid',
      method: 'POST',
      payload: {
        item: fixtures.fourColumn,
        toolRuntimeConfig: {},
      },
    });

    elementCount(response, '.qtable-th').then(value => expect(value).toEqual(4));
  });

  it("doesn't show column headers", async () => {
    const server = getServer();

    const response = await server.inject({
      url: '/rendering-info/web?_id=someid',
      method: 'POST',
      payload: {
        item: fixtures.fourColumnNoHeader,
        toolRuntimeConfig: {},
      },
    });

    elementCount(response, '.qtable-th').then(value => expect(value).toEqual(0));
  });

  it('shows sorting icons', async () => {
    const server = getServer();

    const response = await server.inject({
      url: '/rendering-info/web?_id=someid',
      method: 'POST',
      payload: {
        item: fixtures.sorting,
        toolRuntimeConfig: {},
      },
    });

    elementCount(response, '.qtable-th svg').then(value => expect(value).toEqual(2));
  });

  it('activates the sort icon when clicked', async () => {
    const server = getServer();
    const user = userEvent.setup()

    const response = await server.inject({
      url: '/rendering-info/web?_id=someid',
      method: 'POST',
      payload: {
        item: fixtures.sorting,
        toolRuntimeConfig: {},
      },
    });

    const dom = createDOM(response);
    const document = dom.window.document;

    const btn = document.querySelector('.qtable-sort-icon-holder') as unknown as HTMLSpanElement;

    await user.click(btn);

    expect(btn.classList).toContain('qtable-sort-active');
  });

  // Sorting algo is tested separately.
});
