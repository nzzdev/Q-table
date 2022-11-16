import Thead from './Thead.svelte';
import { createQTableDataFormattedFixture } from '@src/helpers/fixture-generators';
import { render } from '@testing-library/svelte';

describe('Thead', () => {
  it('does not render thead if it is empty', () => {
    const { container } = render(Thead);

    const el = container.getElementsByTagName('thead');
    expect(el.length).toBe(0);
  });

  it('displays basic th correctly', () => {
    const tableHead = [createQTableDataFormattedFixture(), createQTableDataFormattedFixture()];
    const { container } = render(Thead, {
      tableHead,
    });

    const el = container.getElementsByTagName('th');

    expect(el.length).toBe(2);
  });

  // it('displays th with mixed minibars correctly', () => {});

  // it('displays th with non-mixed minibars correctly', () => {});
});
