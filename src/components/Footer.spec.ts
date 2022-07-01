import Footer from './Footer.svelte';
import { render } from '@testing-library/svelte';
import type { Source } from '../interfaces';

describe('Footer', () => {
  it('It shows the note correctly', () => {
    const notes = 'note';
    const sources: Source[] = [];

    const { container } = render(Footer, {
      props: {
        config: {
          notes,
          sources,
        },
      },
    });

    const noteEl = container.getElementsByClassName('s-q-item__footer__notes')[0];

    expect(noteEl).toBeInstanceOf(HTMLDivElement);
    expect(noteEl.innerHTML).toBe('note');
  });
});
