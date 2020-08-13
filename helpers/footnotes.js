function appendFootnoteAnnotationsToTableData(tableData, footnotes, options) {
  const unicodes = {
    1: "\u00b9",
    2: "\u00b2",
    3: "\u00b3",
    4: "\u2074",
    5: "\u2075",
    6: "\u2076",
    7: "\u2077",
    8: "\u2078",
    9: "\u2079",
  };
  let spacings = [];

  footnotes.forEach((footnote) => {
    let footnoteClass = getClass(
      options,
      footnote,
      footnotes.length,
      tableData[footnote.rowIndex][footnote.colIndex].type,
      tableData[footnote.rowIndex].length - 1
    );
    if (footnoteClass) {
      spacings.push({
        colIndex: footnote.colIndex,
        class: footnoteClass,
      });
    }
    // create a new property to safe the index of the footnote
    tableData[footnote.rowIndex][footnote.colIndex].footnote = {
      value: footnote.index,
      unicode: unicodes[footnote.index],
      class: footnoteClass,
    };
  });

  // assign spacingClass to cell
  tableData.forEach((row, index) => {
    // assign class when not cardlayout but cardlayoutifsmall
    if (!options.cardLayout || options.cardLayoutIfSmall) {
      spacings.forEach((spacing) => {
        row[spacing.colIndex].classes.push(spacing.class);
      });
    }

    // assign class when cardlayout or cardlayoutifsmall is active
    if (options.cardLayout || options.cardLayoutIfSmall) {
      if (!options.hideTableHeader && index !== 0) {
        row.forEach((cell) => {
          footnotes.length >= 10
            ? cell.classes.push("q-table-col-footnotes-cardlayout-double")
            : cell.classes.push("q-table-col-footnotes-cardlayout-single");
        });
      }
    }
  });
  return tableData;
}

function getClass(options, footnote, amountOfFootnotes, type, lastColIndex) {
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
  let filteredFootnotes = metaData.cells
    .filter((cell) => {
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

  if (filteredFootnotes.length > 0) {
    let uniqueFootnotes = getUniqueFootnotes(filteredFootnotes);

    filteredFootnotes.forEach((footnote) => {
      let unique = uniqueFootnotes.find(
        (uniqueFootnote) =>
          uniqueFootnote.data.footnote === footnote.data.footnote
      );
      if (unique) {
        footnote.index = unique.index;
      }
    });
  }

  return filteredFootnotes;
}

function getUniqueFootnotes(footnotes) {
  let uniquteFootnotes = footnotes.filter(
    (v, i, a) => a.findIndex((t) => t.data.footnote === v.data.footnote) === i
  );
  uniquteFootnotes.forEach((footnote, index) => {
    footnote.index = index + 1;
  });
  return uniquteFootnotes;
}

module.exports = {
  appendFootnoteAnnotationsToTableData,
  getFilteredMetaDataFootnotes,
};
