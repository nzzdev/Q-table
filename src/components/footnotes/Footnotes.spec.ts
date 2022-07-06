import Footnotes from './Footnotes.svelte';
import { render } from '@testing-library/svelte';
import { createFootnoteFixture } from '@src/helpers/fixture-generators';
import type { StructuredFootnote } from '@src/helpers/footnotes';

function renderFootnotes(footnotes: StructuredFootnote[]): HTMLDivElement {
  const { container } = render(Footnotes, {
    footnotes,
  });

  return container as HTMLDivElement;
}

describe('Footnotes', () => {
  it('footnotes are shown correctly', () => {
    const ft1 = createFootnoteFixture({ index: 1, value: 'ft1' });
    const ft2 = createFootnoteFixture({ index: 2, value: 'ft2' });

    const container = renderFootnotes([ft1, ft2]);
    const ftEls = container.getElementsByClassName('q-table-footnote-footer');

    const ft1El = ftEls[0];
    const ft1ElIndex = ft1El.children[0].innerHTML;
    const ft1ElValue = ft1El.children[1].innerHTML;
    expect(ft1ElIndex).toBe('1');
    expect(ft1ElValue).toBe('ft1');

    const ft2El = ftEls[1];
    const ft2ElIndex = ft2El.children[0].innerHTML;
    const ft2ElValue = ft2El.children[1].innerHTML;
    expect(ft2ElIndex).toBe('2');
    expect(ft2ElValue).toBe('ft2');
  });
});
