import { JSDOM } from 'jsdom';
import Hapi from'@hapi/hapi';
import Joi from 'Joi';
import * as fixtures from '../resources/fixtures/data';
import type { RenderingInfo } from '../src/interfaces';

function element(markup: string, selector: string): Promise<HTMLElement> {
  return new Promise((resolve) => {
    const dom = new JSDOM(markup);

    // We cast it because if it does not exist the test will simply crash.
    // Much easier for writing tests this way.
    const el = dom.window.document.querySelector(selector) as HTMLElement;
    resolve(el);
  });
}

function elements(markup: string, selector: string): Promise<NodeListOf<HTMLElement>> {
  return new Promise((resolve) => {
    const dom = new JSDOM(markup);
    const els = dom.window.document.querySelectorAll(selector) as NodeListOf<HTMLElement>;

    resolve(els);
  });
}

function elementCount(markup: string, selector: string): Promise<number> {
  return new Promise((resolve) => {

    const dom = new JSDOM(markup);
    resolve(dom.window.document.querySelectorAll(selector).length);
  });
}

function getMarkup(result: object | undefined): string {
  const casted = result as RenderingInfo;
  return casted.markup;
}

function getScripts(result: object | undefined): {content: string}[] {
  const casted = result as RenderingInfo;
  return casted.scripts;
}

let server: Hapi.Server;
const fourEmSpaceCharCode = 8197;

// @ts-ignore
import routes from '../dist/routes.js';

// Start the server before the tests.
beforeAll(async () => {
  try {
    server = Hapi.server({
      port: process.env.PORT || 3000,
    });
    server.validator(Joi);
    server.route(routes);
  } catch (err) {
    expect(err).not.toBeDefined();
  }
});

afterAll(async () => {
  await server.stop({ timeout: 2000 });

  // @ts-ignore.
  server = null;
});

describe('column headers', () => {
  it('shows column headers', async () => {
    const response = await server.inject({
      url: '/rendering-info/web?_id=someid',
      method: 'POST',
      payload: {
        item: fixtures.fourColumn,
        toolRuntimeConfig: {},
      },
    });

    const markup = getMarkup(response.result);

    elementCount(markup, '.q-table-cell--head').then(
      value => expect(value).toEqual(4)
    );
  });

  it('doesn\'t show column headers', async () => {
    const response = await server.inject({
      url: '/rendering-info/web?_id=someid',
      method: 'POST',
      payload: {
        item: fixtures.fourColumnNoHeader,
        toolRuntimeConfig: {},
      },
    });

    const markup = getMarkup(response.result);

    elementCount(markup, '.q-table-cell--head').then(
      value => expect(value).toEqual(0)
    );
  });
});

describe('cell values', () => {
  it('should display special characters as text', async () => {
    const response = await server.inject({
      url: '/rendering-info/web?_id=someid',
      method: 'POST',
      payload: {
        item: fixtures.specialCharacters,
        toolRuntimeConfig: {},
      },
    });

    const markup = getMarkup(response.result);

    elementCount(markup, '.q-table__cell--text').then(
      (value) => {
        expect(value).toEqual(32);
      }
    );
  });

  it('should display > 10000 show formatted', async () => {
    const response = await server.inject({
      url: '/rendering-info/web?_id=someid',
      method: 'POST',
      payload: {
        item: fixtures.formattedNumbers,
        toolRuntimeConfig: {},
      },
    });

    const markup = getMarkup(response.result);

    elements(markup, '.q-table__cell + .q-table__cell--numeric:not(.q-table-cell--head)').then(
      (elements) => {
        elements.forEach((element) => {
          expect(element.innerHTML.charCodeAt(8)).toEqual(fourEmSpaceCharCode);
        });
      }
    );
  });

  it('should display < -10000 show formatted', async () => {
    const response = await server.inject({
      url: '/rendering-info/web?_id=someid',
      method: 'POST',
      payload: {
        item: fixtures.formattedNumbersNegative,
        toolRuntimeConfig: {},
      },
    });

    const markup = getMarkup(response.result);

    elements(markup, '.q-table__cell + .q-table__cell--numeric:not(.q-table-cell--head)').then(
      (elements) => {
        expect(elements[1].innerHTML.charCodeAt(9)).toEqual(fourEmSpaceCharCode);
      }
    );
  });

  it('should display > 1000 when column contains >10000', async () => {
    const response = await server.inject({
      url: '/rendering-info/web?_id=someid',
      method: 'POST',
      payload: {
        item: fixtures.formattedNumbersMixed,
        toolRuntimeConfig: {},
      },
    });

    const markup = getMarkup(response.result);

    elements(markup, '.q-table__cell + .q-table__cell--numeric:not(.q-table-cell--head)').then(
      (elements) => {
        expect(elements[0].innerHTML.charCodeAt(7)).toEqual(fourEmSpaceCharCode);
      }
    );
  });
});

describe('cardlayout', () => {
  it('shows the cardlayout in mobile width', async () => {
    const response = await server.inject({
      url: '/rendering-info/web?_id=someid',
      method: 'POST',
      payload: {
        item: fixtures.cardlayout,
        toolRuntimeConfig: { size: { width: [350, '<'] } },
      },
    });

    const markup = getMarkup(response.result);

    elementCount(markup, '.q-table--card-layout').then(
      (value) => {
        expect(value).toEqual(1);
      }
    );
  });

  it('shows the cardlayout in article width', async () => {
    const response = await server.inject({
      url: '/rendering-info/web?_id=someid',
      method: 'POST',
      payload: {
        item: fixtures.cardlayout,
        toolRuntimeConfig: { size: { width: [500, '>'] } },
      },
    });

    const markup = getMarkup(response.result);

    elementCount(markup, '.q-table--card-layout').then(
      (value) => {
        expect(value).toEqual(1);
      }
    );
  });

  it('shows the cardlayout in full width', async () => {
    const response = await server.inject({
      url: '/rendering-info/web?_id=someid',
      method: 'POST',
      payload: {
        item: fixtures.cardlayout,
        toolRuntimeConfig: { size: { width: [800, '>'] } },
      },
    });

    const markup = getMarkup(response.result);

    elementCount(markup, '.q-table--card-layout').then(
      (value) => {
        expect(value).toEqual(1);
      }
    );
  });
});

describe('cardlayout on mobile', () => {
  it('shows the cardlayout in mobile width', async () => {
    const response = await server.inject({
      url: '/rendering-info/web?_id=someid',
      method: 'POST',
      payload: {
        item: fixtures.cardlayoutMobile,
        toolRuntimeConfig: { size: { width: [400, '<'] } },
      },
    });

    const scripts = getScripts(response.result);
    const includedClass = scripts[1].content.includes('applyCardLayoutClass');

    expect(includedClass).toEqual(true);
  });

  it('doesn\'t show the cardlayout in article width', async () => {
    const response = await server.inject({
      url: '/rendering-info/web?_id=someid',
      method: 'POST',
      payload: {
        item: fixtures.cardlayoutMobile,
        toolRuntimeConfig: { size: { width: [500, '>'] } },
      },
    });

    const scripts = getScripts(response.result);
    const includedClass = scripts[1].content.includes('applyCardLayoutClass');

    expect(includedClass).toEqual(true);
  });

  it('doesn\'t show the cardlayout in full width', async () => {
    const response = await server.inject({
      url: '/rendering-info/web?_id=someid',
      method: 'POST',
      payload: {
        item: fixtures.cardlayoutMobile,
        toolRuntimeConfig: { size: { width: [800, '>'] } },
      },
    });

    const scripts = getScripts(response.result);
    const includedClass = scripts[1].content.includes('applyCardLayoutClass');

    expect(includedClass).toEqual(true);
  });
});

describe('minibars', () => {
  it('shows table correctly when no minibar-options', async () => {
    const response = await server.inject({
      url: '/rendering-info/web?_id=someid',
      method: 'POST',
      payload: {
        item: fixtures.fourColumn,
        toolRuntimeConfig: {},
      },
    });

    const markup = getMarkup(response.result);

    elementCount(markup, 'td').then(
      value => expect(value).toEqual(28)
    );
  });

  it('uses correct cell type', async () => {
    const response = await server.inject({
      url: '/rendering-info/web?_id=someid',
      method: 'POST',
      payload: {
        item: fixtures.minibarsNegative,
        toolRuntimeConfig: {},
      },
    });

    const markup = getMarkup(response.result);

    elementCount(markup, 'td.q-table-minibar-cell').then(
      (value) => {
        expect(value).toEqual(4);
      }
    );
  });

  it('uses the negative bar type', async () => {
    const response = await server.inject({
      url: '/rendering-info/web?_id=someid',
      method: 'POST',
      payload: {
        item: fixtures.minibarsNegative,
        toolRuntimeConfig: {},
      },
    });

    const markup = getMarkup(response.result);

    elementCount(markup, 'div.q-table-minibar-bar--negative').then(
      (value) => {
        expect(value).toEqual(3);
      }
    );
  });

  it('shows negative bar and number', async () => {
    const response = await server.inject({
      url: '/rendering-info/web?_id=someid',
      method: 'POST',
      payload: {
        item: fixtures.minibarsNegative,
        toolRuntimeConfig: {},
      },
    });

    const markup = getMarkup(response.result);

    elementCount(markup, 'td.q-table-minibar-cell').then(
      (value) => {
        expect(value).toEqual(4);
      }
    );

    elementCount(markup, 'td.q-table-minibar-cell--value').then(
      (value) => {
        expect(value).toEqual(4);
      }
    );
  });

  it('shows the correct negative bar length', async () => {
    const response = await server.inject({
      url: '/rendering-info/web?_id=someid',
      method: 'POST',
      payload: {
        item: fixtures.minibarsNegative,
        toolRuntimeConfig: {},
      },
    });

    const markup = getMarkup(response.result);
    const dom = new JSDOM(markup);
    const bars = dom.window.document.querySelectorAll(
      'div.q-table-minibar-bar--negative'
    );

    let widths: string[] = [];
    bars.forEach((bar) => {
      const regex = /\s*width\s*:\s*([^;"]*)/;
      let width = bar.outerHTML.match(regex);

      if (width) widths.push(width[1])
    });

    expect(widths).toEqual(['46.15384615384615%', '38.46153846153846%', '100%'])
  });

  it('uses the positive bar type', async () => {
    const response = await server.inject({
      url: '/rendering-info/web?_id=someid',
      method: 'POST',
      payload: {
        item: fixtures.minibarsPositive,
        toolRuntimeConfig: {},
      },
    });

    const markup = getMarkup(response.result);

    elementCount(markup, 'div.q-table-minibar-bar--positive').then(
      (value) => {
        expect(value).toEqual(3);
      }
    );
  });

  it('uses the positive number and bar', async () => {
    const response = await server.inject({
      url: '/rendering-info/web?_id=someid',
      method: 'POST',
      payload: {
        item: fixtures.minibarsPositive,
        toolRuntimeConfig: {},
      },
    });

    const markup = getMarkup(response.result);

    elementCount(markup, 'td.q-table-minibar-cell--value').then(
      (value) => {
        expect(value).toEqual(4);
      }
    );

    elementCount(markup, 'td.q-table-minibar-cell').then(
      (value) => {
        expect(value).toEqual(4);
      }
    );
  });

  it('show the corrent positive bar length', async () => {
    const response = await server.inject({
      url: '/rendering-info/web?_id=someid',
      method: 'POST',
      payload: {
        item: fixtures.minibarsPositive,
        toolRuntimeConfig: {},
      },
    });

    const markup = getMarkup(response.result);
    const dom = new JSDOM(markup);
    const bars = dom.window.document.querySelectorAll(
      'div.q-table-minibar-bar--positive'
    );

    let widths: string[] = [];
    bars.forEach((bar) => {
      const regex = /\s*width\s*:\s*([^;"]*)/;
      let width = bar.outerHTML.match(regex)

      if (width) widths.push(width[1])
    });

    expect(widths).toEqual(['46.15384615384615%', '38.46153846153846%', '100%'])
  });

  it('uses the mixed cell type', async () => {

    const response = await server.inject({
      url: '/rendering-info/web?_id=someid',
      method: 'POST',
      payload: {
        item: fixtures.minibarsMixed,
        toolRuntimeConfig: {},
      },
    });

    const markup = getMarkup(response.result);

    elementCount(markup, 'td.q-table-minibar--mixed').then(
      (value) => {
        expect(value).toEqual(4);
      }
    );
  });

  it('shows mixed number and bar', async () => {
    const response = await server.inject({
      url: '/rendering-info/web?_id=someid',
      method: 'POST',
      payload: {
        item: fixtures.minibarsMixed,
        toolRuntimeConfig: {},
      },
    });

    const markup = getMarkup(response.result);
    elementCount(markup, '.q-table-minibar-alignment--positive').then(value => expect(value).toEqual(2));
    elementCount(markup, '.q-table-minibar-bar--positive').then(value => expect(value).toEqual(2));
    elementCount(markup, '.q-table-minibar-alignment--negative').then(value => expect(value).toEqual(1));
    elementCount(markup, '.q-table-minibar-bar--negative').then(value => expect(value).toEqual(1));
    elementCount(markup, '.q-table-minibar-alignment--empty').then(value => expect(value).toEqual(1));
  });

  it('show the corrent mixed bar length', async () => {
    const response = await server.inject({
      url: '/rendering-info/web?_id=someid',
      method: 'POST',
      payload: {
        item: fixtures.minibarsPositive,
        toolRuntimeConfig: {},
      },
    });

    const markup = getMarkup(response.result);
    const dom = new JSDOM(markup);
    const positiveBars = dom.window.document.querySelectorAll('div.q-table-minibar-bar--positive');
    const negativeBars = dom.window.document.querySelectorAll('div.q-table-minibar-bar--negative');

    let widths: string[] = []
    const regex = /\s*width\s*:\s*([^;"]*)/;

    positiveBars.forEach((bar) => {
      let width = bar.outerHTML.match(regex);
      if (width) widths.push(width[1]);
    });

    negativeBars.forEach((bar) => {
      let width = bar.outerHTML.match(regex);
      if (width) widths.push(width[1]);
    });

    expect(widths).toEqual(['46.15384615384615%', '38.46153846153846%', '100%'])
  });
});

describe('footnotes', () => {
  it('shows annotations for footnotes in table numbering downwords', async () => {
    const response = await server.inject({
      url: '/rendering-info/web?_id=someid',
      method: 'POST',
      payload: {
        item: fixtures.displayFootnotes,
        toolRuntimeConfig: {},
      },
    });

    const markup = getMarkup(response.result);
    const dom = new JSDOM(markup);
    const annotations = dom.window.document.querySelectorAll('span.q-table-footnote-annotation');

    let annotationIndexes: string[] = [];

    annotations.forEach((annotation) => {
      // @ts-ignore
      annotationIndexes.push(annotation.dataset.annotation);
    });

    expect(annotationIndexes).toEqual(['1', '2', '3', '4']);
  });

  it('shows text of footnotes in footer of table with right index', async () => {
    const response = await server.inject({
      url: '/rendering-info/web?_id=someid',
      method: 'POST',
      payload: {
        item: fixtures.displayFootnotes,
        toolRuntimeConfig: {},
      },
    });

    const markup = getMarkup(response.result);
    const dom = new JSDOM(markup);
    const footnotes = dom.window.document.querySelectorAll('div.q-table-footnote-footer') as NodeListOf<HTMLDialogElement>;

    let arrayOfFootnotes: {index: string, text: string}[] = [];

    footnotes.forEach((footnote) => {
        arrayOfFootnotes.push({
          // @ts-ignore
          index: footnote.childNodes[0].innerHTML,
          // @ts-ignore
          text: footnote.childNodes[1].innerHTML,
        });
    });

    expect(arrayOfFootnotes).toEqual([
      {
        index: '1',
        text: 'Frisch verheiratet, früher Hanspeter Mustermann',
      },
      {
        index: '2',
        text: 'Verhalten in letzter Spalte',
      },
      {
        index: '3',
        text: 'Frisch verheiratet, früher Peter Vorderbach',
      },
      {
        index: '4',
        text: 'Frisch verheiratet, früher Ralf Hinterbach',
      },
    ]);
  });

  it('shows merged footnotes in footer of table with right index', async () => {
    const response = await server.inject({
      url: '/rendering-info/web?_id=someid',
      method: 'POST',
      payload: {
        item: fixtures.displayMergedFootnotes,
        toolRuntimeConfig: {},
      },
    });

    const markup = getMarkup(response.result);
    const dom = new JSDOM(markup);
    const footnotes = dom.window.document.querySelectorAll(
      'div.q-table-footnote-footer'
    );

    let arrayOfFootnotes: {index: string, text: string}[] = [];

    footnotes.forEach((footnote) => {
      arrayOfFootnotes.push({
        // @ts-ignore
        index: footnote.childNodes[0].innerHTML,
        // @ts-ignore
        text: footnote.childNodes[1].innerHTML,
      });
    });

    expect(arrayOfFootnotes).toEqual([
      {
        index: '1',
        text: 'Frisch verheiratet, früher Hanspeter Mustermann',
      },
    ]);
  });

  it('shows multiple merged footnotes in footer of table with right index', async () => {
    const response = await server.inject({
      url: '/rendering-info/web?_id=someid',
      method: 'POST',
      payload: {
        item: fixtures.displayMergedFootnotesMultiple,
        toolRuntimeConfig: {},
      },
    });

    const markup = getMarkup(response.result);
    const dom = new JSDOM(markup);
    const footnotes = dom.window.document.querySelectorAll(
      'div.q-table-footnote-footer'
    );

    let arrayOfFootnotes:  {index: string, text: string}[] = [];

    footnotes.forEach((footnote) => {
      arrayOfFootnotes.push({
        // @ts-ignore
        index: footnote.childNodes[0].innerHTML,
        // @ts-ignore
        text: footnote.childNodes[1].innerHTML,
      });
    });

    expect(arrayOfFootnotes).toEqual([
      {
        index: '1',
        text: 'Frisch verheiratet, früher Hanspeter Mustermann',
      },
      {
        index: '2',
        text: 'Frisch verheiratet, früher Hanspeter Musterfrau',
      },
    ]);
  });

  it('shows annotation of footnotes in header of cardlayout', async () => {
    const response = await server.inject({
      url: '/rendering-info/web?_id=someid',
      method: 'POST',
      payload: {
        item: fixtures.displayFootnotesInCardlayout,
        toolRuntimeConfig: {},
      },
    });

    const markup = getMarkup(response.result);
    const dom = new JSDOM(markup);
    const annotations = dom.window.document.querySelectorAll('td');

    const rawFootnote1 =  annotations[0].getAttribute('data-label') || '';
    const rawFootnote2 =  annotations[1].getAttribute('data-label') || '';

    const footnoteOne = decodeURI(rawFootnote1.split('Rank')[1]);
    const footnoteTwo = decodeURI(rawFootnote2.split('Name')[1]);

    expect(footnoteOne).toEqual('\u00b9');
    expect(footnoteTwo).toEqual('\u00b2');
  });

  it('hides footnotes because header is hidden', async () => {
    const response = await server.inject({
      url: '/rendering-info/web?_id=someid',
      method: 'POST',
      payload: {
        item: fixtures.hideFootnotesInHeader,
        toolRuntimeConfig: {},
      },
    });

    const markup = getMarkup(response.result);
    const dom = new JSDOM(markup);
    const annotations = dom.window.document.querySelectorAll('.q-table-footnote-annotation');
    const footnoteIndexes = dom.window.document.querySelectorAll('.q-table-footnote-index');

    expect(annotations[0].innerHTML).toEqual('1');
    expect(footnoteIndexes[0].innerHTML).toEqual(
      '1'
    );
    expect(annotations.length).toEqual(6);
    expect(footnoteIndexes.length).toEqual(6);
  });

  it('displays a bigger padding in column with footnotes when column with minibars follows', async () => {
    const response = await server.inject({
      url: '/rendering-info/web?_id=someid',
      method: 'POST',
      payload: {
        item: fixtures.displayFootnotesBeforeMinibar,
        toolRuntimeConfig: {},
      },
    });

    const markup = getMarkup(response.result);

    elementCount(markup, '.q-table-footnote-column--single'
    ).then((value) => {
      expect(value).toEqual(12);
    });
  });

  it('displays a even bigger padding in column with footnotes with there are more than 9', async () => {
    const response = await server.inject({
      url: '/rendering-info/web?_id=someid',
      method: 'POST',
      payload: {
        item: fixtures.displayAlotOfFootnotes,
        toolRuntimeConfig: {},
      },
    });

    const markup = getMarkup(response.result);

    elementCount(markup, '.q-table-footnote-column--double').then(
      value => expect(value).toEqual(12)
    );
  });

  it('displays a bigger margin in column when table has footnotes and cardlayout ', async () => {
    const response = await server.inject({
      url: '/rendering-info/web?_id=someid',
      method: 'POST',
      payload: {
        item: fixtures.displayFootnotesInCardlayout,
        toolRuntimeConfig: {},
      },
    });

    const markup = getMarkup(response.result);

    elementCount(markup, '.q-table-footnote-column-card-layout--single').then(
      value => expect(value).toEqual(20)
    );
  });

  it('displays the margin correctly when table has positive minibars', async () => {
    const response = await server.inject({
      url: '/rendering-info/web?_id=someid',
      method: 'POST',
      payload: {
        item: fixtures.footnotesPositiveMinibars,
        toolRuntimeConfig: {},
      },
    });

    const markup = getMarkup(response.result);

    elementCount(markup, '.q-table-footnote-column--single').then(
      value => expect(value).toEqual(16)
    );
  });

  it('displays the margin correctly when table has negative minibars', async () => {
    const response = await server.inject({
      url: '/rendering-info/web?_id=someid',
      method: 'POST',
      payload: {
        item: fixtures.footnotesNegativeMinibars,
        toolRuntimeConfig: {},
      },
    });

    const markup = getMarkup(response.result);

    elementCount(markup, '.q-table-footnote-column--single').then(
      value => expect(value).toEqual(16)
    );
  });

  it('displays the margin correctly when table has mixed minibars', async () => {
    const response = await server.inject({
      url: '/rendering-info/web?_id=someid',
      method: 'POST',
      payload: {
        item: fixtures.footnotesMixedMinibars,
        toolRuntimeConfig: {},
      },
    });

    const markup = getMarkup(response.result);

    elementCount(markup, '.q-table-footnote-column--single').then(
      value => expect(value).toEqual(18)
    );
  });

  it('behaves correctly with other metaData in cells', async () => {
    let item = fixtures.displayFootnotes;

    item.data.metaData.cells = [
      {
        data: {
          // @ts-ignore
          test: 'test',
        },
        rowIndex: 1,
        colIndex: 2,
      },
      {
        data: {
          // @ts-ignore
          test1: 'test1',
        },
        rowIndex: 2,
        colIndex: 1,
      },
      {
        data: {
          // @ts-ignore
          test2: 'test2',
        },
        rowIndex: 3,
        colIndex: 1,
      },
      {
        data: {
          footnote: 'test3',
          // @ts-ignore
          multipleData: true,
        },
        rowIndex: 4,
        colIndex: 1,
      },
    ];

    const response = await server.inject({
      url: '/rendering-info/web?_id=someid',
      method: 'POST',
      payload: {
        item: item,
        toolRuntimeConfig: {},
      },
    });

    const markup = getMarkup(response.result);
    const dom = new JSDOM(markup);
    const annotations = dom.window.document.querySelectorAll('span.q-table-footnote-annotation');

    let annotationIndexes: string[] = [];
    annotations.forEach((annotation) => {
      // @ts-ignore
      annotationIndexes.push(annotation.dataset.annotation);
    });

    expect(annotationIndexes).toEqual(['1']);
    expect(response.statusCode).toEqual(200);
  });

  it('displays the footnote when the table has colorColumn (numerical)', async () => {
    const response = await server.inject({
      url: '/rendering-info/web?_id=someid',
      method: 'POST',
      payload: {
        item: fixtures.colorColumnNumericalFootnotes,
        toolRuntimeConfig: {},
      },
    });

    const markup = getMarkup(response.result);

    elementCount(markup, '.q-table-footnote-column--single').then(
      value => expect(value).toEqual(7)
    );

    elementCount(markup, '.q-table-footnote-annotation--colorColumn').then(
      value => expect(value).toEqual(1)
    );
  })

  it('displays the footnote when the table has colorColumn (categorical)', async () => {
    const response = await server.inject({
      url: '/rendering-info/web?_id=someid',
      method: 'POST',
      payload: {
        item: fixtures.colorColumnCategoricalFootnotes,
        toolRuntimeConfig: {},
      },
    });

    const markup = getMarkup(response.result);

    elementCount(markup, '.q-table-footnote-column--single').then(
      value => expect(value).toEqual(7)
    );

    elementCount(markup, '.q-table-footnote-annotation--colorColumn').then(
      value => expect(value).toEqual(1)
    );
  })
});

describe('table search', () => {
  it('shows table search', async () => {
    const response = await server.inject({
      url: '/rendering-info/web?_id=someid',
      method: 'POST',
      payload: {
        item: fixtures.tableSearchShow,
        toolRuntimeConfig: {},
      },
    });

    const markup = getMarkup(response.result);

    elementCount(markup, '.q-table__search__input').then(
      (value) => {
        expect(value).toEqual(1);
      }
    );
  });

  it('doesn\'t show table search', async () => {
    const response = await server.inject({
      url: '/rendering-info/web?_id=someid',
      method: 'POST',
      payload: {
        item: fixtures.tableSearchHidden,
        toolRuntimeConfig: {},
      },
    });

    const markup = getMarkup(response.result);

    elementCount(markup, '.q-table__search__input').then(
      (value) => {
        expect(value).toEqual(0);
      }
    );
  });

  it('doesn\'t show table search if property is true but not enough elements', async () => {
    const response = await server.inject({
      url: '/rendering-info/web?_id=someid',
      method: 'POST',
      payload: {
        item: fixtures.hyphenSignAsNumber,
        toolRuntimeConfig: {},
      },
    });

    const markup = getMarkup(response.result);

    elementCount(markup, '.q-table__search__input').then(
      (value) => {
        expect(value).toEqual(0);
      }
    );
  })
});

describe('color column', () => {
  it('displays the numerical legend', async () => {
    const response = await server.inject({
      url: '/rendering-info/web?_id=someid',
      method: 'POST',
      payload: {
        item: fixtures.colorColumnNumerical,
        toolRuntimeConfig: {},
      },
    });

    const markup = getMarkup(response.result);

    elementCount(markup, '.q-table-colorColumn-legend--numerical').then(
      value => expect(value).toEqual(1)
    );
  })

  it('displays the correct amount of buckets', async () => {
    const response = await server.inject({
      url: '/rendering-info/web?_id=someid',
      method: 'POST',
      payload: {
        item: fixtures.colorColumnNumerical,
        toolRuntimeConfig: {},
      },
    });

    const markup = getMarkup(response.result);

    elementCount(markup, '.q-table-colorColumn-legend .q-table-colorColumn-legend-bucket').then(
      value => expect(value).toEqual(5)
    );
  })

  it('displays label legend', async () => {
    const response = await server.inject({
      url: '/rendering-info/web?_id=someid',
      method: 'POST',
      payload: {
        item: fixtures.colorColumnNumerical,
        toolRuntimeConfig: {},
      },
    });

    const markup = getMarkup(response.result);

    elementCount(markup, '.q-table-colorColumn-legend-marker').then(
      value => expect(value).toEqual(1)
    );
  })

  it('doesnt display label legend', async () => {
    const response = await server.inject({
      url: '/rendering-info/web?_id=someid',
      method: 'POST',
      payload: {
        item: fixtures.colorColumnNumericalNoLabel,
        toolRuntimeConfig: {},
      },
    });

    const markup = getMarkup(response.result);

    elementCount(markup, '.q-table-colorColumn-legend-marker').then(
      value => expect(value).toEqual(0)
    );
  })

  it('displays no-data in legend', async () => {
    const response = await server.inject({
      url: '/rendering-info/web?_id=someid',
      method: 'POST',
      payload: {
        item: fixtures.colorColumnNumericalNoData,
        toolRuntimeConfig: {},
      },
    });

    const markup = getMarkup(response.result);

    elementCount(markup, '.q-table-colorColumn-legend-info--no-data').then(
      value => expect(value).toEqual(1)
    );
  })

  it('does not display no-data in legend', async () => {
    const response = await server.inject({
      url: '/rendering-info/web?_id=someid',
      method: 'POST',
      payload: {
        item: fixtures.colorColumnNumericalNoLabel,
        toolRuntimeConfig: {},
      },
    });

    const markup = getMarkup(response.result);

    elementCount(markup, '.q-table-colorColumn-legend-info--no-data').then(
      value => expect(value).toEqual(0)
    );
  })

  it('displays single-bucket in legend', async () => {
    const response = await server.inject({
      url: '/rendering-info/web?_id=someid',
      method: 'POST',
      payload: {
        item: fixtures.colorColumnNumericalNoData,
        toolRuntimeConfig: {},
      },
    });

    const markup = getMarkup(response.result);

    elementCount(markup, '.q-table-colorColumn-legend-info--single-bucket').then(
      value => expect(value).toEqual(1)
    );
  })

  it('displays the categorical legend', async () => {
    const response = await server.inject({
      url: '/rendering-info/web?_id=someid',
      method: 'POST',
      payload: {
        item: fixtures.colorColumnCategorical,
        toolRuntimeConfig: {},
      },
    });

    const markup = getMarkup(response.result);

    elementCount(markup, '.q-table-colorColumn-legend--categorical').then(
      value => expect(value).toEqual(1)
    );
  })

  it('displays buckets in custonm color (numerical)', async () => {
    const response = await server.inject({
      url: '/rendering-info/web?_id=someid',
      method: 'POST',
      payload: {
        item: fixtures.colorColumnNumericalCustomColors,
        toolRuntimeConfig: {},
      },
    });

    const markup = getMarkup(response.result);
    const sel = '.q-table-colorColumn-legend-info--single-bucket .q-table-colorColumn-legend-bucket';

    element(markup, sel).then(
      (elem) => {
        expect(elem.style['color']).toEqual('yellow');
      }
    );
  })

  it('displays buckets in custonm order (categorical)', async () => {
    const response = await server.inject({
      url: '/rendering-info/web?_id=someid',
      method: 'POST',
      payload: {
        item: fixtures.colorColumnCategoricalCustomOrder,
        toolRuntimeConfig: {},
      },
    });

    const markup = getMarkup(response.result);

    elements(markup, '.q-table-colorColumn-legend--categorical .s-legend-item-label__item__label').then(
      (elements) => {
        expect(elements[0].innerHTML).toEqual('Test1');
        expect(elements[1].innerHTML).toEqual('Test2');
      }
    );
  })

  it('displays buckets in custonm color (categorical)', async () => {
    const response = await server.inject({
      url: '/rendering-info/web?_id=someid',
      method: 'POST',
      payload: {
        item: fixtures.colorColumnCategoricalCustomColors,
        toolRuntimeConfig: {},
      },
    });

    const markup = getMarkup(response.result);

    elements(markup, '.q-table-colorColumn-legend--categorical .s-legend-item-label__item').then(
      (elements) => {
        expect(elements[0].style['color']).toEqual('pink');
        expect(elements[1].style['color']).toEqual('lightblue');
      }
    );
  })
})


