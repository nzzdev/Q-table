import type { CellMetaData, QTableConfigOptions, Row, TableColumnType } from '@src/interfaces';

/**
 * Processes the raw footnote metadata into a structured format.
 * We need this format because not only do we mark footnotes with labels
 * in the table, they will also show up in the footer.
 *
 * Filter: It removes all empty footnotes and also removes
 *         header footnotes if the header is disabled.
 *
 * Sort: Afterwards sorts all footnotes first by row then
 *       by column so they are chronological.
 *
 * Foreach: Mapping the raw meta data to a new format.
 *          Also merge duplicate footnotes into one object.
 */
export function getFootnotes(metaData: CellMetaData[], hideTableHeader: boolean): { footnotes: Footnote[], footnoteCellMap: FootnoteCellMap} {
  const footnotes: Footnote[] = [];

  // Map for quick access for dataformatting cells.
  // The key is rowIndex-colindex.
  // Value is the index of the footnote.
  const footnoteCellMap: FootnoteCellMap = new Map();

  metaData
    .filter(cell => {
      // Remove empty footnotes.
      if (!cell.data.footnote || cell.data.footnote === '') {
        return false;
      }

      // Remove header footnotes if the header is disabled.
      if (hideTableHeader && cell.rowIndex === 0) {
        return false;
      }

      return true;
    })
    .sort((a, b) => {
      if (a.rowIndex !== b.rowIndex) {
        return a.rowIndex - b.rowIndex;
      }

      return a.colIndex - b.colIndex;
    }).forEach(cellMetaData => {
      const currentFootnoteText = cellMetaData.data.footnote;
      const existingFootnote = footnotes.find(filterFootnote => currentFootnoteText === filterFootnote.value);

      // We move the index down by -1 so the header row has an index of -1;
      // It is because we split the data between the header and the actual data
      // and we want the actual data to start at 0.
      const rowIndex = cellMetaData.rowIndex - 1;
      const colIndex = cellMetaData.colIndex;

      if (existingFootnote) { // Same footnote given. Merge into one entry.
        footnoteCellMap.set(`${rowIndex}-${colIndex}`, `${existingFootnote.index}`);
      } else {
        const index = footnotes.length + 1;
        footnotes.push({
          value: currentFootnoteText,
          index,
        });

        footnoteCellMap.set(`${rowIndex}-${colIndex}`, `${index}`);
      }
    });

  return {
    footnotes,
    footnoteCellMap,
  }
}

// export function appendFootnoteAnnotationsToTableData(tableData: Row[], footnotes: Footnote[], options: QTableConfigOptions): Row[] {
//   const unicodes: Record<number, string> = {
//     1: '\u00b9',
//     2: '\u00b2',
//     3: '\u00b3',
//     4: '\u2074',
//     5: '\u2075',
//     6: '\u2076',
//     7: '\u2077',
//     8: '\u2078',
//     9: '\u2079',
//   };
//   const spacings: Spacing[] = [];
//   const flattenedFootnotes = getFlattenedFootnotes(footnotes);

//   flattenedFootnotes.forEach(footnote => {
//     const row = tableData[footnote.rowIndex];
//     const cells = row.cells;

//     const footnoteClass = getClass(options, footnote, flattenedFootnotes.length, cells[footnote.colIndex].type, cells.length - 1);

//     if (footnoteClass) {
//       const space = {
//         colIndex: footnote.colIndex,
//         class: footnoteClass,
//       };

//       if (!hasFootnoteClass(spacings, space)) {
//         spacings.push(space);
//       }
//     }

//     // create a new property to save the index of the footnote
//     cells[footnote.colIndex].footnote = {
//       value: footnote.value,
//       unicode: unicodes[footnote.value],
//       class: footnoteClass,
//     };
//   });

//   // assign spacingClass to cell
//   tableData.forEach((row, index) => {
//     // assign class when not cardlayout but cardlayoutifsmall
//     if (!options.cardLayout || options.cardLayoutIfSmall) {
//       spacings.forEach(spacing => {
//         row.cells[spacing.colIndex].classes.push(spacing.class);
//       });
//     }

//     // assign class when cardlayout or cardlayoutifsmall is active
//     if (options.cardLayout || options.cardLayoutIfSmall) {
//       if (!options.hideTableHeader && index !== 0) {
//         row.cells.forEach(cell => {
//           flattenedFootnotes.length >= 10
//             ? cell.classes.push('q-table-footnote-column-card-layout--double')
//             : cell.classes.push('q-table-footnote-column-card-layout--single');
//         });
//       }
//     }
//   });
//   return tableData;
// }

/**
 * Helpers.
 */

// function getClass(options: QTableConfigOptions, footnote: FlattenedFootnote, amountOfFootnotes: number, type: TableColumnType, lastColIndex: number): string | null {
//   // if the column of the footnote is a number, minibar or a minibar follows, add some spacing depending on how many footnotes are displayed. Or footnote is displayed in the last column or is colorColumn
//   if (
//     (type === 'numeric' && (options.minibar.selectedColumn === footnote.colIndex || options.minibar.selectedColumn === footnote.colIndex + 1)) ||
//     footnote.colIndex === lastColIndex ||
//     (options.colorColumn && options.colorColumn.selectedColumn === footnote.colIndex) ||
//     (options.colorColumn && options.colorColumn.selectedColumn == footnote.colIndex + 1)
//   ) {
//     let spacingClass = 'q-table-footnote-column';
//     if (amountOfFootnotes >= 10) {
//       spacingClass += '--double';
//     } else {
//       spacingClass += '--single';
//     }
//     return spacingClass;
//   }

//   return null;
// }

// function getFlattenedFootnotes(footnotes: Footnote[]): FlattenedFootnote[] {
//   const flattenedFootnotes: FlattenedFootnote[] = [];

//   footnotes.forEach(footnote => {
//     footnote.coords.forEach(coord => {
//       flattenedFootnotes.push({
//         value: footnote.index,
//         colIndex: coord.colIndex,
//         rowIndex: coord.rowIndex,
//       });
//     });
//   });

//   return flattenedFootnotes;
// }

// function hasFootnoteClass(classes: Spacing[], newClass: Spacing): Spacing | undefined {
//   return classes.find(element => element.colIndex === newClass.colIndex && element.class === newClass.class);
// }

/**
 * Interfaces
 */

export interface Footnote {
  value: string;
  index: number;
}

export type FootnoteCellMap = Map<string, string>;

// interface FlattenedFootnote {
//   value: number;
//   colIndex: number;
//   rowIndex: number;
// }

// interface Spacing {
//   colIndex: number;
//   class: string;
// }
