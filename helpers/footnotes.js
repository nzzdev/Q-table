function appendFootnotesToData(tableData, footnotes, options) {
  const unicodes = {
    1: "\u00b9",
    2: "\u00b2",
    3: "\u00b3",
    4: "\u2074",
    5: "\u2075",
    6: "\u2076",
    7: "\u2077",
    8: "\u2078",
    9: "\u2079"
  };
  let spacings = [];

  footnotes.forEach((footnote, index) => {
    let footnoteSpacing = getFootnoteSpacing(
      options,
      footnote,
      footnotes.length,
      tableData[footnote.rowIndex][footnote.colIndex].type,
      tableData[footnote.rowIndex].length - 1
    );
    if (footnoteSpacing) {
      spacings.push({
        colIndex: footnote.colIndex,
        class: footnoteSpacing
      });
    }
    // create a new property to safe the index of the footnote
    tableData[footnote.rowIndex][footnote.colIndex].footnote = {
      value: index + 1,
      unicode: unicodes[index + 1],
      spacingClass: footnoteSpacing
    };
  });

  // assign spacingClass to cell
  tableData.forEach((row, index) => {
    if (options.cardLayout || options.cardLayoutIfSmall) {
      if (!options.hideTableHeader && index !== 0) {
        row.forEach(cell => {
          cell.spacingClass =
            footnotes.length >= 10
              ? "q-table-col-footnotes-cardlayout-double"
              : "q-table-col-footnotes-cardlayout-single";
        });
      }
    }
    if (!options.cardLayout || options.cardLayoutIfSmall) {
      spacings.forEach(spacing => {
        row[spacing.colIndex].spacingClass = row[spacing.colIndex].spacingClass
          ? `${row[spacing.colIndex].spacingClass} ${spacing.class}`
          : spacing.class;
      });
    }
  });
  return tableData;
}

function getFootnoteSpacing(
  options,
  footnote,
  amountOfFootnotes,
  type,
  lastColIndex
) {
  // if the column of the footnote is a number, minibar or a minibar follows, add some spacing depending on how many footnotes are displayed. Or footnote is displayed in the last column
  if (
    (type === "numeric" &&
      (options.minibar.selectedColumn === footnote.colIndex ||
        options.minibar.selectedColumn === footnote.colIndex + 1)) ||
    footnote.colIndex === lastColIndex
  ) {
    let spacingClass = "q-table-col-footnotes";
    if (amountOfFootnotes >= 10) {
      spacingClass += "-double";
    } else {
      spacingClass += "-single";
    }
    return spacingClass;
  }
  return null;
}

function getFilteredMetaDataFootnotes(metaData, hideTableHeader) {
  return metaData.cells
    .filter(cell => {
      if (!cell.data.footnote || (hideTableHeader && cell.rowIndex === 0)) {
        return false;
      }
      return true;
    }) // remove cells with no footnotes
    .sort((a, b) => {
      // sorting metaData to display them chronologically
      if (a.rowIndex !== b.rowIndex) {
        return a.rowIndex - b.rowIndex;
      }
      return a.colIndex - b.colIndex;
    });
}

module.exports = {
  appendFootnotesToData: appendFootnotesToData,
  getFilteredMetaDataFootnotes: getFilteredMetaDataFootnotes
};
