import * as fixtures from '../../resources/fixtures/data';
import { elementCount, createMarkupWithScript, createServer, elements, element, createDOM } from '../helpers';

describe('footnotes', () => {
  const getServer = createServer();

  it('shows annotations for footnotes in table numbering downwords', async () => {
    const server = getServer();

    const response = await server.inject({
      url: '/rendering-info/web?_id=someid',
      method: 'POST',
      payload: {
        item: fixtures.displayFootnotes,
        toolRuntimeConfig: {},
      },
    });

    const dom = createDOM(response);
    const annotations = dom.window.document.querySelectorAll('.qtable-footnote');

    let annotationIndexes: string[] = [];

    annotations.forEach(annotation => {
      annotationIndexes.push(annotation.innerHTML);
    });

    expect(annotationIndexes).toEqual(['1', '2', '3', '4']);
  });

  it('shows text of footnotes in footer of table with right index', async () => {
    const server = getServer();

    const response = await server.inject({
      url: '/rendering-info/web?_id=someid',
      method: 'POST',
      payload: {
        item: fixtures.displayFootnotes,
        toolRuntimeConfig: {},
      },
    });

    const dom = createDOM(response);
    const footnotes = dom.window.document.querySelectorAll('.q-table-footnote-footer') as  unknown as NodeListOf<HTMLDivElement>;
    let arrayOfFootnotes: { index: string; text: string }[] = [];

    footnotes.forEach(footnote => {
      const spans = footnote.querySelectorAll('span');

      arrayOfFootnotes.push({
        index: spans[0].innerHTML,
        text: spans[1].innerHTML,
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
    const server = getServer();

    const response = await server.inject({
      url: '/rendering-info/web?_id=someid',
      method: 'POST',
      payload: {
        item: fixtures.displayMergedFootnotes,
        toolRuntimeConfig: {},
      },
    });

    const dom = createDOM(response);
    const footnotes = dom.window.document.querySelectorAll('.q-table-footnote-footer') as unknown as NodeListOf<HTMLDivElement>;

    let arrayOfFootnotes: { index: string; text: string }[] = [];

    footnotes.forEach(footnote => {
      const spans = footnote.querySelectorAll('span');

      arrayOfFootnotes.push({
        index: spans[0].innerHTML,
        text: spans[1].innerHTML,
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
    const server = getServer();

    const response = await server.inject({
      url: '/rendering-info/web?_id=someid',
      method: 'POST',
      payload: {
        item: fixtures.displayMergedFootnotesMultiple,
        toolRuntimeConfig: {},
      },
    });

    const dom = createDOM(response);
    const footnotes = dom.window.document.querySelectorAll('.q-table-footnote-footer') as unknown as NodeListOf<HTMLDivElement>;

    let arrayOfFootnotes: { index: string; text: string }[] = [];

    footnotes.forEach(footnote => {
      const spans = footnote.querySelectorAll('span');

      arrayOfFootnotes.push({
        index: spans[0].innerHTML,
        text: spans[1].innerHTML,
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
    const server = getServer();

    const response = await server.inject({
      url: '/rendering-info/web?_id=someid',
      method: 'POST',
      payload: {
        item: fixtures.displayFootnotesInCardlayout,
        toolRuntimeConfig: { size: { width: [{ value: 400, unit: 'px', comparison: '=' }] } },
      },
    });

    const dom = createDOM(response);
    const annotations = dom.window.document.querySelectorAll('.qtable-footnote');

    const rawFootnote1Attr = annotations[0].innerHTML || '';
    const rawFootnote2Attr = annotations[1].innerHTML || '';

    expect(rawFootnote1Attr).toEqual('1');
    expect(rawFootnote2Attr).toEqual('2');
  });

  it('hides footnotes because header is hidden', async () => {
    const server = getServer();

    const response = await server.inject({
      url: '/rendering-info/web?_id=someid',
      method: 'POST',
      payload: {
        item: fixtures.hideFootnotesInHeader,
        toolRuntimeConfig: {},
      },
    });

    const dom = createDOM(response);
    const annotations = dom.window.document.querySelectorAll('.q-table-footnote-text');

    const footnoteIndexes = dom.window.document.querySelectorAll('.q-table-footnote-index');

    expect(annotations[0].innerHTML).toEqual('test multiple4');
    expect(footnoteIndexes[0].innerHTML).toEqual('1');
    expect(annotations.length).toEqual(6);
    expect(footnoteIndexes.length).toEqual(6);
  });

  // Don't need them for now.
  // it('displays a even bigger padding in column with footnotes with there are more than 9', async () => {
  //   const server = getServer();

  //   const response = await server.inject({
  //     url: '/rendering-info/web?_id=someid',
  //     method: 'POST',
  //     payload: {
  //       item: fixtures.displayAlotOfFootnotes,
  //       toolRuntimeConfig: {},
  //     },
  //   });

  //   const markup = createMarkupWithScript(response);

  //   elementCount(markup, '.q-table-footnote-column--double').then(value => expect(value).toEqual(12));
  // });

  // it('displays a bigger margin in column when table has footnotes and cardlayout ', async () => {
  //   const server = getServer();

  //   const response = await server.inject({
  //     url: '/rendering-info/web?_id=someid',
  //     method: 'POST',
  //     payload: {
  //       item: fixtures.displayFootnotesInCardlayout,
  //       toolRuntimeConfig: {},
  //     },
  //   });

  //   const markup = createMarkupWithScript(response);

  //   elementCount(markup, '.q-table-footnote-column-card-layout--single').then(value => expect(value).toEqual(20));
  // });

  // it('displays the margin correctly when table has positive minibars', async () => {
  //   const server = getServer();

  //   const response = await server.inject({
  //     url: '/rendering-info/web?_id=someid',
  //     method: 'POST',
  //     payload: {
  //       item: fixtures.footnotesPositiveMinibars,
  //       toolRuntimeConfig: {},
  //     },
  //   });

  //   const markup = createMarkupWithScript(response);

  //   elementCount(markup, '.q-table-footnote-column--single').then(value => expect(value).toEqual(16));
  // });

  // it('displays the margin correctly when table has negative minibars', async () => {
  //   const server = getServer();

  //   const response = await server.inject({
  //     url: '/rendering-info/web?_id=someid',
  //     method: 'POST',
  //     payload: {
  //       item: fixtures.footnotesNegativeMinibars,
  //       toolRuntimeConfig: {},
  //     },
  //   });

  //   const markup = createMarkupWithScript(response);

  //   elementCount(markup, '.q-table-footnote-column--single').then(value => expect(value).toEqual(16));
  // });

  // it('displays the margin correctly when table has mixed minibars', async () => {
  //   const server = getServer();

  //   const response = await server.inject({
  //     url: '/rendering-info/web?_id=someid',
  //     method: 'POST',
  //     payload: {
  //       item: fixtures.footnotesMixedMinibars,
  //       toolRuntimeConfig: {},
  //     },
  //   });

  //   const markup = createMarkupWithScript(response);

  //   elementCount(markup, '.q-table-footnote-column--single').then(value => expect(value).toEqual(18));
  // });

  it('behaves correctly with other metaData in cells', async () => {
    const server = getServer();

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

    const dom = createDOM(response);
    const annotations = dom.window.document.querySelectorAll('.q-table-footnote-index');

    let annotationIndexes: string[] = [];
    annotations.forEach(annotation => {
      annotationIndexes.push(annotation.innerHTML);
    });

    expect(annotationIndexes).toEqual(['1']);
    expect(response.statusCode).toEqual(200);
  });

  it('displays the footnote when the table has colorColumn (numerical)', async () => {
    const server = getServer();

    const response = await server.inject({
      url: '/rendering-info/web?_id=someid',
      method: 'POST',
      payload: {
        item: fixtures.colorColumnNumericalFootnotes,
        toolRuntimeConfig: {},
      },
    });

    elementCount(response, '.qtable-footnote').then(value => expect(value).toEqual(1));
  });
});
