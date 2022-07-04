import Footer from './Footer.svelte';
import { render } from '@testing-library/svelte';
import { createSourceFixture } from '@rs/fixtures/fixture-generators';
import type { Source } from '@src/interfaces';

function renderFooter(props: { notes?: string; sources?: Source[] }): HTMLDivElement {
  const { container } = render(Footer, {
    props,
  });

  return container as HTMLDivElement;
}

describe('Footer', () => {
  it('shows the note correctly', () => {
    const container = renderFooter({ notes: 'note' });
    const el = container.getElementsByClassName('s-q-item__footer__notes')[0];

    expect(el).toBeInstanceOf(HTMLDivElement);
    expect(el.innerHTML).toBe('note');
  });

  it('does not shows the note when it is not set', () => {
    const container = renderFooter({ notes: '' });
    const el = container.getElementsByClassName('s-q-item__footer__notes')[0];
    expect(el).toBeUndefined();
  });

  it('renders the singular source prefix', () => {
    const source = createSourceFixture();
    const container = renderFooter({ sources: [source] });

    let el = container.getElementsByClassName('q-table-footer-sources-prefix')[0];

    expect(el.innerHTML).toBe('Quelle:');
  });

  it('renders the plural source prefix', () => {
    const source = createSourceFixture();
    const container = renderFooter({ sources: [source, source] });

    const el = container.getElementsByClassName('q-table-footer-sources-prefix')[0];

    expect(el.innerHTML).toBe('Quellen:');
  });

  it('does not show the sources when they are not set', () => {
    const container = renderFooter({ sources: [] });

    const el = container.getElementsByClassName('s-q-item__footer__sources')[0];

    expect(el).toBeUndefined();
  });

  it('does not render source when text is not set', () => {
    const source = createSourceFixture({
      text: '',
    });

    const container = renderFooter({ sources: [source] });

    const el = container.getElementsByClassName('q-table-source')[0];

    expect(el).toBeUndefined();
  });

  it('renders text when source link is not set', () => {
    const source = createSourceFixture({
      link: {},
    });

    const container = renderFooter({ sources: [source] });
    const el = container.getElementsByClassName('q-table-source')[0];

    // We trim the text because with our prettified HTML markup span will always have a space at
    // the end because of the linefeeds between lines.
    const expectedText = el.innerHTML.trim();
    expect(expectedText).toBe('google');
  });

  it('renders a the source with link when given', () => {
    const source = createSourceFixture();
    const container = renderFooter({ sources: [source] });
    const el = container.getElementsByClassName('q-table-source')[0].children[0];

    expect(el).toBeInstanceOf(HTMLAnchorElement);
    expect(el.innerHTML).toBe('google');
  });

  it('renders multiple sources correctly', () => {
    const source1 = createSourceFixture({ text: 's1' });
    const source2 = createSourceFixture({ text: 's2' });
    const container = renderFooter({ sources: [source1, source2] });

    const sourceEls = container.getElementsByClassName('q-table-source');
    const el1 = sourceEls[0].children[0];
    const el2 = sourceEls[1].children[0];

    expect(el1).toBeInstanceOf(HTMLAnchorElement);
    expect(el1.innerHTML).toBe('s1');

    expect(el2).toBeInstanceOf(HTMLAnchorElement);
    expect(el2.innerHTML).toBe('s2');
  });
});
