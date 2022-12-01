import type { CellMetaData } from '@src/interfaces';

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

/**
 * Interfaces
 */

export interface Footnote {
  value: string;
  index: number;
}

export type FootnoteCellMap = Map<string, string>;
