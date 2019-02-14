# Q Table [![Build Status](https://travis-ci.com/nzzdev/Q-table.svg?token=g43MZxbtUcZ6QyxqUoJM&branch=dev)](https://travis-ci.com/nzzdev/Q-table) [![Greenkeeper badge](https://badges.greenkeeper.io/nzzdev/Q-table.svg?token=70f2c40b32fd66edccfe705c14e1443e8e403768fadc870f4f22f749877c522b&ts=1549974271422)](https://greenkeeper.io/)

**Maintainer**: [manuelroth](https://github.com/manuelroth)

Q Table is one tool of the Q toolbox to create tables.
Test it in the [demo](https://editor.q.tools).

## Table of contents
 
- [Installation](#installation)
- [Development](#development)
- [Testing](#testing)
- [Implementation details](#implementation-details)
- [Features](#features)
  - [Spacing](#spacing)
  - [Collapsable table](#collapsable-table)
  - [Card-Layout](#card-layout)
  - [Minibars](#minibars)
  - [Footnotes](#footnotes)
- [License](#license)

## Installation [to the top](#table-of-contents)

```bash
$ npm install
$ npm run build
```

## Development [to the top](#table-of-contents)

Install the [Q cli](https://github.com/nzzdev/Q-cli) and start the Q dev server:

```
$ Q server
```

Run the Q tool:
```
$ node index.js
```

## Testing [to the top](#table-of-contents)
The testing framework used in this repository is [Code](https://github.com/hapijs/code).

Run the tests:
```
$ npm run test
```

## Implementation details [to the top](#table-of-contents)
The tool structure follows the general structure of each Q tool. Further information can be found in [Q server documentation - Developing tools](https://nzzdev.github.io/Q-server/developing-tools.html).

## Features [to the top](#table-of-contents)

### Spacing

- Q-Table uses [CSS Table-Layout](https://developer.mozilla.org/en-US/docs/Web/CSS/table-layout) to adjust columns, rows and cells
- An algorythm discribes how large the width of each column and cell should be and to use the whole desktop width
- We want to give the responsability fully to the browser and don't want to calculate the layout by our own
- We want define rules based on the type of the column (Number, Text, Minibar)

#### Rules for spacing
There's a CSS rule which contains that if the table doesn't use Card-Layout, the cell is not `q-talble-minibar-header` and the following cell is not `q-table__cell--numeric` then the `padding-left` will be `20px`.
Further spacing rules will be explained in the other features.


### Collapsable table [to the top](#table-of-contents)
<img src="/doc/show-more-button.png" align="right" width=300 height=306>
This is a feature to shorten large tables in the article and make them collapsable.

##### Implementation details
- When rendering the rows, the renderingInfoScript `getShowMoreButtonScript()` will check how many rows the table contains
- If the table will be displayed as Card-Layout and contains more than 6 rows, the first 3 rows will be displayed, the rest will be hidden
- If the table will be displayed with the Card-Layout and contains more than 15 rows, the frist 10 will be displayed, the reest will be hidden
- If there are rows hidden, a new element will be created with the class `q-table_show-more-button` assigned
- Clicking on the button will either call the function `showRowsFunction()` or `hideRowsFunction()`
- When calling the `hideRowsFunction`, the table will be collapsed again and with the function `scrollIntoView()` scrolled back to the top of the table


### Card-Layout [to the top](#table-of-contents)
<img src="/doc/card-layout.png" align="right" width=300 height=355>

Card-Layout is an option to display large tables well-arranged on mobile. There are 2 options to use it:
- Only show the Card-Layout in the mobile view
- Show the Card-Layout in every view

##### Implementation details
- The Card-Layout renderingInfoScript contains an `EventListener` on the event `resize` which calculates the current size of the graphic
- When the graphic is smaller than `400px`, the renderingInfoScript `applyCardLayoutClassFunction` adds the class `q-table--card-layout` to the `dataObject` and replaces all its styles
- The column headers will then be hidden and each cell will display the `:before` selector containing its column header (e.g. `Header1`)

### Minibars [to the top](#table-of-contents)
<img src="/doc/minibars.png" align="right" width=427 height=202>
Minibars are a visual feature to display the difference between numbers in the table. Minibars are only useable on numeric columns. The minibars won't be displayed in Card-Layout.

##### Implementation details serverside
- The `option-availability` route will check if there are at least 3 columns and check if at least one if them is `numeric`
- Once the option will be shown, the `dynamic-enum` route will read all `numeric` columns and display them in the option
- **Important**: The function `getMinibarContext()` will always return an object, when minibars aren't used the object is empty
- The function `getMinibarContext()` uses a copy of `item.data` since the data will be altered
- If minibars will be used, the function `getMinibarData()` with the parameters `data` and `minibarOptions` will be called
- The function then calls `getMinibarNumbersWithType()` will set the type of the minibar and prepare the data to be calculated
- The table can have 3 types: `positive` when there positive numbers only, `negative` when there are negative numbers only or `mixed` when the numbers are positive and negative numbers in the column
- The cell can have 3 types: `positive`, when the cell contains a positive number, `negative` when the cell contains a negative number or `empty` when there's no content in the cell
- The function `getMinibarValue()` then calculates the length of the minibar based on the `type` of the table and max-value of the selected column
- Then the color of the minibars will be adjusted. By default the sophie-colors `s-viz-color-diverging-2-2` for `positive` and `s-viz-color-diverging-2-1` for `negative` colors will be used. If the user has the role `poweruser`, he can set the colors by himself. One way by the `className` of the sophie-colors or the `colorCode` which are simple hex codes of colors
- In the end the `getMinibarContext()` function will return an object like this:
```javascript
{
  values: [
    {type:"empty", value:0},
    {type:"negative", value:7.142857142857143},
    {type:"positive", value:14.285714285714286},
  ],
  type:"mixed",
  barColor: {
    positive:{className:"s-viz-color-diverging-2-2", colorCode:""},
    negative:{className:"s-viz-color-diverging-2-1", colorCode:""}
  }
}
```

##### Implementation details frontend
- There are 3 different files for displaying minibars: `minibar-positive.html`, `minibar-negative.html` and `minibar-mixed.html`
- Positive will display the `value` first and then the `minibar`. Both as a `td`-element
- Negative will display the `minibar` first and then the `value`. Both as a `td`-element
- Mixed will display the `value` and the `minibar` inside the `td` as a `div`-element but in the same order as listed above
- When resizing the graphic, the `EventLister` on the event `resize` implemented in the `getCardLayoutScript()` will be triggered 
- When the graphic is smaller than `400px`, the renderingInfoScript `renderMinibarsFunction()` will be called inside the `EventListener` listed above
- The function `renderMinibarsFunction()` then loads the elements of the column `selectedColumn` and `minibarColumn` which then will passed to the function `handleMinibarsMinWidthFunctionName()`
- The function `handleMinibarsMinWidthFunctionName()` then either removes or adds `q-table-minibar-cell-mobile` or `q-table-minibar--mixed-mobile` to the cell according to the `type` of the table which can be read out on the dataset `data-minibar` on each cell

### Footnotes [to the top](#table-of-contents)
<img src="/doc/footnotes.png" align="right" width=302 height=437>

Footnotes are a feature to display annotations in the table and the sources in the footer of the table.

##### Implementation details serverside
- The function `getFilteredMetaDataFootnotes()` will filter and sort all footnotes from `item.data.metaData`. The function will always return an object, when not used the object will be empty
- Those footnotes will then be passed to the function `getTableData()`
- Once the `tableData` is adjusted in `getTableData()`, there's a check if footnotes are set
- If there are footnotes, they will be passed to the function `appendFootnoteAnnotationsToTableData()` along with `tableData` and `options`
- In `appendFootnoteAnnotationsToTableData()` the `footnoteClass` will be calculated and determined if extra spacing is used or not 
- If there's a footnote in a cell where: The value is a number, minibar or a minibar follows or it's the last column. If one of the circumstances listed applies, then it'll be checked how many footnotes there are. If there are less than 10 footnotes the class `q-table-col-footnotes-single` will be used, if there are more 10 and more the class `q-table-col-footnotes-double`will be used. 
- Because the title in the Card-Layout is already set by the `:before`-selector, it's not possible to apply the annotation with this selector as well. Therefore we have to add the unicode to the dataset `data-label` when the Card-Layout is set so we map the footnote annoation value to the `unicode`. **Important**: The mapping of the value is from **1** to **9**.
- After applying the annotations to the `tableData`, the function `appendFootnoteAnnotationsToTableData()` should return an object like this:
```javascript
[
  [
    {
      type: "numeric",
      value: "Rank",
      classes: [],
      footnote: {
        value: 1,
        unicode: "¹",
        class: null
      }
    },
  ],
  [
    {
      type: "numeric",
      value: "3",
      classes: [
        "q-table-col-footnotes-cardlayout-single"
      ],
      footnote: {
        value: 2,
        unicode: "²",
        class: null
      }
    }
  ],
]
```

##### Implementation details frontend
- The `value` of the cell will be displayed inside a `span`-element with the class `q-table-annotation`
- The `span`-element has the dataset `data-annotation` and the value `cell.footnote.value` applied to it
- With the `:after`-selector, the dataset `data-annotation` will then be applied after the value
- For the sources of the annotations the `footnotes` array applied to the `context` will be looped and displayed in the footer

## License [to the top](#table-of-contents)
Copyright (c) 2019 Neue Zürcher Zeitung. All rights reserved.

This software is published under the MIT license.