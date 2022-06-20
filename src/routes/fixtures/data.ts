import type { ServerRoute } from '@hapi/hapi';

import twoColumn from '../../../resources/fixtures/data/two-column.json';
import fourColumn from '../../../resources/fixtures/data/four-column.json';
import fourColumnNoHeader from '../../../resources/fixtures/data/four-column-no-header.json';
import datesInData from '../../../resources/fixtures/data/dates-in-data.json';
import mixedNumbersAndTextInCell from '../../../resources/fixtures/data/mixed-numbers-and-text-in-cell.json';
import hyphenSignAsNumber from '../../../resources/fixtures/data/hyphen-sign-as-number.json';
import multilineText from '../../../resources/fixtures/data/multiline-text.json';
import showMoreButton from '../../../resources/fixtures/data/show-more-button.json';
import disappearingColumns from '../../../resources/fixtures/data/disappearing-columns.json';
import columnSpacing from '../../../resources/fixtures/data/column-spacing.json';
import minibarsMixed from '../../../resources/fixtures/data/minibars-mixed.json';
import minibarsPositive from '../../../resources/fixtures/data/minibars-positive.json';
import minibarsNegative from '../../../resources/fixtures/data/minibars-negative.json';
import minibarsHeaderWithNumbers from '../../../resources/fixtures/data/minibars-header-with-numbers.json';
import minibarsCustomClassName from '../../../resources/fixtures/data/minibars-custom-className.json';
import minibarsCustomColorCode from '../../../resources/fixtures/data/minibars-custom-colorCode.json';
import displayFootnotes from '../../../resources/fixtures/data/display-footnotes.json';
import displayMergedFootnotes from '../../../resources/fixtures/data/display-merged-footnotes.json';
import displayMergedFootnotesMultiple from '../../../resources/fixtures/data/display-merged-footnotes-multiple.json';
import displayFootnotesBeforeMinibar from '../../../resources/fixtures/data/display-footnotes-before-minibar.json';
import displayAlotOfFootnotes from '../../../resources/fixtures/data/display-alot-of-footnotes.json';
import hideFootnotesInHeader from '../../../resources/fixtures/data/hide-footnotes-in-header.json';
import displayFootnotesInCardlayout from '../../../resources/fixtures/data/display-footnotes-in-cardlayout.json';
import footnotesPositiveMinibars from '../../../resources/fixtures/data/footnotes-positive-minibars.json';
import footnotesNegativeMinibars from '../../../resources/fixtures/data/footnotes-negative-minibars.json';
import footnotesMixedMinibars from '../../../resources/fixtures/data/footnotes-mixed-minibars.json';
import cardlayout from '../../../resources/fixtures/data/cardlayout.json';
import cardlayoutMobile from '../../../resources/fixtures/data/cardlayout-mobile.json';
import lotsOfData from '../../../resources/fixtures/data/lots-of-data.json';
import specialCharacters from '../../../resources/fixtures/data/special-characters.json';
import formattedNumbers from '../../../resources/fixtures/data/formatted-numbers.json';
import formattedNumbersMixed from '../../../resources/fixtures/data/formatted-numbers-mixed.json';
import formattedNumbersNegative from '../../../resources/fixtures/data/formatted-numbers-negative.json';
import tableSearchHidden from '../../../resources/fixtures/data/table-search-hidden.json';
import tableSearchShow from '../../../resources/fixtures/data/table-search-show.json';
import tableSearchWithMultipleColumns from '../../../resources/fixtures/data/table-search-with-multiple-columns.json';
import colorColumnNumerical from '../../../resources/fixtures/data/colorColumn-numerical.json';
import colorColumnNumericalNoLabel from '../../../resources/fixtures/data/colorColumn-numerical-no-label.json';
import colorColumnNumericalNoData from '../../../resources/fixtures/data/colorColumn-numerical-no-data.json';
import colorColumnNumericalFootnotes from '../../../resources/fixtures/data/colorColumn-numerical-footnotes.json';
import colorColumnNumericalCustomColors from '../../../resources/fixtures/data/colorColumn-numerical-custom-colors.json';
import colorColumnCategorical from '../../../resources/fixtures/data/colorColumn-categorical.json';
import colorColumnCategoricalFootnotes from '../../../resources/fixtures/data/colorColumn-categorical-footnotes.json';
import colorColumnCategoricalCustomOrder from '../../../resources/fixtures/data/colorColumn-categorical-custom-order.json';
import colorColumnCategoricalCustomColors from '../../../resources/fixtures/data/colorColumn-categorical-custom-colors.json';

const fixtureData = [
  twoColumn,
  fourColumn,
  fourColumnNoHeader,
  datesInData,
  mixedNumbersAndTextInCell,
  hyphenSignAsNumber,
  multilineText,
  showMoreButton,
  disappearingColumns,
  columnSpacing,
  minibarsMixed,
  minibarsPositive,
  minibarsNegative,
  minibarsHeaderWithNumbers,
  minibarsCustomClassName,
  minibarsCustomColorCode,
  displayFootnotes,
  displayMergedFootnotes,
  displayMergedFootnotesMultiple,
  displayFootnotesBeforeMinibar,
  displayAlotOfFootnotes,
  hideFootnotesInHeader,
  displayFootnotesInCardlayout,
  footnotesPositiveMinibars,
  footnotesNegativeMinibars,
  footnotesMixedMinibars,
  cardlayout,
  cardlayoutMobile,
  lotsOfData,
  specialCharacters,
  formattedNumbers,
  formattedNumbersMixed,
  formattedNumbersNegative,
  tableSearchHidden,
  tableSearchShow,
  tableSearchWithMultipleColumns,
  colorColumnNumerical,
  colorColumnNumericalNoLabel,
  colorColumnNumericalNoData,
  colorColumnNumericalFootnotes,
  colorColumnNumericalCustomColors,
  colorColumnCategorical,
  colorColumnCategoricalFootnotes,
  colorColumnCategoricalCustomOrder,
  colorColumnCategoricalCustomColors,
];

const route: ServerRoute = {
  path: '/fixtures/data',
  method: 'GET',
  options: {
    tags: ['api'],
  },
  handler: () => {
    return fixtureData;
  },
};

export default route;
