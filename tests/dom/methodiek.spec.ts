import * as fixtures from '../../resources/fixtures/data';
import {
  elementCount,
  createServer,
  elements,
  createDOM,
} from '../helpers';
import userEvent from '@testing-library/user-event';

function getConfig(noInteraction = false) {
  return {
    url: '/rendering-info/web?_id=someid',
    method: 'POST',
    payload: {
      item: fixtures.methodiek,
      toolRuntimeConfig: {
        noInteraction,
      },
    },
  }
}

describe('methodiek', () => {
  const getServer = createServer();

  /**
   * Non interactive methodiek tests.
   */
  it('shows the NON interactive methodiek', async () => {
    const server = getServer();
    const response = await server.inject(getConfig(true));

    elementCount(response, '.qtable-methodiek-static').then(
      value => expect(value).toEqual(1)
    );
  });

  it('shows the correct legend colors', async () => {
    const server = getServer();
    const response = await server.inject(getConfig(true));

    elements(response, '.qtable-methodiek-static .s-legend-item-label__item__icon').then(
      els => {
        expect(els[0].style.color).toBe('yellow');
        expect(els[1].classList).toContain('s-viz-color-sequential-one-5-4');
        expect(els[2].classList).toContain('s-viz-color-sequential-one-5-3');
        expect(els[3].classList).toContain('s-viz-color-sequential-one-5-2');
        expect(els[4].classList).toContain('s-viz-color-sequential-one-5-1');
      }
    );
  });

  it('shows the correct legend values', async () => {
    const server = getServer();
    const response = await server.inject(getConfig(true));

    elements(response, '.qtable-methodiek-static .s-legend-item-label__item__label').then(
      els => {
        expect(els[0].textContent).toBe('2,10 (nur ein Datenpunkt)');
        expect(els[1].textContent).toContain('2,10–2,20');
        expect(els[2].textContent).toContain('2,20–2,30');
        expect(els[3].textContent).toContain('2,30–2,50');
        expect(els[4].textContent).toContain('2,50–2,61');
      }
    );
  });

  /**
   * Interactive methodiek tests
   */
  it('shows the correct start interactive methodiek', async () => {
    const server = getServer();

    const response = await server.inject(getConfig());

    // Button should be visible.
    elementCount(response, '.qtable-methodiek-btn').then(
      value => expect(value).toEqual(1)
    );

    // Methodiek cntr should not be in DOM.
    elementCount(response, '.qtable-methodiek-cntr').then(
      value => expect(value).toEqual(0)
    );
  });

  it('shows the interactive methodiek on btn click', async () => {
    const user = userEvent.setup()
    const server = getServer();
    const response = await server.inject(getConfig());

    const dom = createDOM(response);
    const document = dom.window.document;

    const btn = document.querySelector('.qtable-methodiek-btn') as unknown as HTMLDivElement;

    await user.click(btn);

    const closeBtn = dom.window.document.querySelector('.q-table-methods-link-icon-close');
    expect(closeBtn).toBeDefined();

    const cntr = document.querySelector('.qtable-methodiek-cntr');
    expect(cntr).toBeDefined();

    const els = document.querySelectorAll('.qtable-methodiek-legend-circle');

    const el1 = els[0] as unknown as HTMLDivElement;
    expect(el1.style.color).toBe('yellow');
    expect(els[1].classList).toContain('s-viz-color-sequential-one-5-4');
    expect(els[2].classList).toContain('s-viz-color-sequential-one-5-3');
    expect(els[3].classList).toContain('s-viz-color-sequential-one-5-2');
    expect(els[4].classList).toContain('s-viz-color-sequential-one-5-1');

    const firstRowTds = document.querySelectorAll('.qtable-methodiek-cntr tr:first-child td');

    expect(firstRowTds[1].innerHTML).toBe('');
    expect(firstRowTds[2].innerHTML).toBe('');
    expect(firstRowTds[3].innerHTML).toBe('2,10');
    expect(firstRowTds[4].innerHTML).toBe('(nur ein Datenpunkt)');

    const lastRowTds = document.querySelectorAll('.qtable-methodiek-cntr tr:last-child td');

    expect(lastRowTds[1].innerHTML).toBe('2,50');
    expect(lastRowTds[2].innerHTML).toBe('–');
    expect(lastRowTds[3].innerHTML).toBe('2,61');
  });
});
