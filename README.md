# Q Table [![Build Status](https://travis-ci.com/nzzdev/Q-table.svg?token=g43MZxbtUcZ6QyxqUoJM&branch=dev)](https://travis-ci.com/nzzdev/Q-table)

**Maintainer**: [philipkueng](https://github.com/philipkueng)

Q Table is one tool of the Q toolbox to create tables.
Test it in the [demo](https://editor.q.tools).

## Table of contents

- [Installation](#installation)
- [Configuration](#configuration)
- [Development](#development)
- [Testing](#testing)
- [Deployment](#deployment)
- [Functionality](#functionality)
- [License](#license)

## Installation

```bash
git clone git@github.com:nzzdev/Q-table.git
cd ./Q-table
nvm use
npm install
npm run build
```

[to the top](#table-of-contents)

## Configuration

No configuration is needed for this tool.

[to the top](#table-of-contents)

## Development

Start the Q dev server:

```
npx @nzz/q-cli server
```

Run the Q tool:

```
node index.js
```

[to the top](#table-of-contents)

## Testing

The testing framework used in this repository is [Code](https://github.com/hapijs/code).

Run the tests:

```
npm run test
```

### Implementing a new test

When changing or implementing...

- A `route`, it needs to be tested in the `e2e-tests.js` file
- Something on the frontend, it needs to be tested in the `dom-tests.js` file

[to the top](#table-of-contents)

## Deployment

We provide automatically built [docker images](https://hub.docker.com/r/nzzonline/q-table/).
There are three options for deployment:

- Use the provided images
- Build your own docker images
- Deploy the service using another technology

### Use the provided docker images

1. Deploy `nzzonline/q-table` to a docker environment

[to the top](#table-of-contents)

## Functionality

The tool structure follows the general structure of each Q tool. Further information can be found in [Q server documentation - Developing tools](https://nzzdev.github.io/Q-server/developing-tools.html).

[to the top](#table-of-contents)

### Implementing a new feature

When implementing a new feature, a new file needs to be created under `heplers` containing the name of the feature. The file needs to export a function which will process the data and return in every case an `object`, when the function won't be used, the `object` needs to be empty. The `context` object will then contain the processed data.

[to the top](#table-of-contents)

### Features

#### Spacing

- Q-Table uses [CSS Table-Layout](https://developer.mozilla.org/en-US/docs/Web/CSS/table-layout) to adjust columns, rows and cells
- An algorythm discribes how large the width of each column and cell should be and to use the whole desktop width
- We want to give the responsability fully to the browser and don't want to calculate the layout by our own
- We want define rules based on the type of the column (Number, Text, Minibar) while numbers are right and text is left aligned

##### Rules for spacing

There's a CSS rule which contains that if the table doesn't use Card-Layout, the cell is not `q-talble-minibar-header` and the following cell is not `q-table__cell--numeric` then the `padding-left` will be `20px`.
Further spacing rules will be explained in the other features.

[to the top](#table-of-contents)

#### Collapsable table

<img src="/doc/show-more-button.png" align="right" width=300 height=306>
This is a feature to shorten large tables in the article and make them collapsable.

###### Implementation details

- When rendering the rows, the renderingInfoScript `getShowMoreButtonScript()` will check how many rows the table contains
- [This](https://github.com/nzzdev/Q-table/blob/e4fbf189ce8c1191cdfad2fac60ee9677cc8eda7/routes/rendering-info/web.js#L122-L127) is the matrix used to display/hide the rows
- If there are rows hidden, a new element will be created with the class `q-table_show-more-button` assigned
- Clicking on the button will either call the function `showRowsFunction()` or `hideRowsFunction()`
- When calling the `hideRowsFunction`, the table will be collapsed again and with the function `scrollIntoView()` scrolled back to the top of the table

[to the top](#table-of-contents)

#### Footnotes

<img src="/doc/footnotes.png" align="right" width=302 height=437>

Footnotes are a feature to display annotations in the table and the sources in the footer of the table. It uses the `metaData` feature of [Q-Editor](https://github.com/nzzdev/Q-editor/blob/d27d6f9e88a982b10e9e812139712026a7971977/client/src/elements/schema-editor/schema-editor-table.js). Footnotes with the same text will be merged together.

###### Implementation details serverside

- The function `getFootnotes()` will filter and sort all footnotes from `item.data.metaData`. Additional the data will be transitioned, that there will be listed only unique footnotes, with an array of coordinates, where the footnote will be placed. The function will always return an object, when not used the object will be empty.
- Those footnotes will then be passed to the function `getTableData()`
- Once the `tableData` is adjusted in `getTableData()`, there's a check if footnotes are set
- If there are footnotes, they will be passed to the function `appendFootnoteAnnotationsToTableData()` along with `tableData` and `options`
- In `appendFootnoteAnnotationsToTableData()` the `footnoteClass` will be calculated and determined if extra spacing is used or not
- Before appending the footnotes to the `tableData`, the footnotes array will be flattened and prepared to ease to complexity.
- [This](https://github.com/nzzdev/Q-table/blob/e4fbf189ce8c1191cdfad2fac60ee9677cc8eda7/helpers/footnotes.js#L62-L75) is the matrix how we apply spacing classes to the cell
- Because the title in the Card-Layout is already set by the `::before` pseudo element, it's not possible to apply the annotation with this selector as well. Therefore we have to add the unicode to the dataset `data-label` when the Card-Layout is set so we map the footnote annoation value to the `unicode`. **Important**: The mapping of the value is from **1** to **9**.
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
        class: null,
      },
    },
  ],
  [
    {
      type: "numeric",
      value: "3",
      classes: ["q-table-footnote-col-cardlayout-single"],
      footnote: {
        value: 2,
        unicode: "²",
        class: null,
      },
    },
  ],
];
```

###### Implementation details frontend

- The `value` of the cell will be displayed inside a `span`-element with the class `q-table-footnote-annotation`
- The `span`-element has the dataset `data-annotation` and the value `cell.footnote.value` applied to it
- With the `::after` pseudo element, the dataset `data-annotation` will then be applied after the value
- For the sources of the annotations the `footnotes` array applied to the `context` will be looped and displayed in the footer
- If the option `colorColumn` is selected, the footnote will be dispalyed in a seperate element and the color of the footnote will be set to `opacity: 0.65`

[to the top](#table-of-contents)
### Options

#### hideTableHeader

This options allows to hide the header of each column. By default it's `false`

###### Implementation details

- If the options is used, the table-header [won't be rendered](https://github.com/nzzdev/Q-table/blob/e4fbf189ce8c1191cdfad2fac60ee9677cc8eda7/views/table.html#L7-L24)

[to the top](#table-of-contents)

#### showTableSearch

<img src="/doc/table-search.png" align="right" width=300 height=400>

This option allows to show or hide the table search feature. The option is only available, when there are more than 16 rows in the table. Default value is `false`.

###### Implementation details
- By default the table is collapsed and the `q-table_show-more-button` is visible at the bottom of the table ([see Collapsable table](#collapsable-table)).
- When the user starts typing, all rows will be made visible and the `q-table_show-more-button` disappears.
- The actual search function triggers, as soon as the user types the second character.
- The filter searches through text-based columns only.
- When the user deletes his input, the table collapses and the `q-table_show-more-button` will be visible again.

[to the top](#table-of-contents)

###### Implementation details

- If the option is used, the input element for the table search won't be rendered.

[to the top](#table-of-contents)

#### cardLayout

<img src="/doc/card-layout.png" align="right" width=300 height=355>

Card-Layout is an option to display large tables well-arranged on mobile. There are 2 options to use it:

- Only show the Card-Layout in the mobile view
- Show the Card-Layout in every view

###### Implementation details

- The Card-Layout renderingInfoScript contains an `EventListener` on the event `resize` which calculates the current size of the graphic
- When the graphic is smaller than `400px`, the renderingInfoScript `applyCardLayoutClassFunction` adds the class `q-table--card-layout` to the `dataObject` and replaces all its styles
- The column headers will then be hidden and each cell will display the `::before` :pseudo element containing its column header (e.g. `Header1`)

[to the top](#table-of-contents)

#### minibar

<img src="/doc/minibars.png" align="right" width=427 height=202>
Minibars are a visual feature to display the difference between numbers in the table. Minibars are only useable on numeric columns. We decided not to support minibars in the Card-Layout because of [visual issues](https://3.basecamp.com/3500782/buckets/4515275/todos/1037397026).

###### Implementation details serverside

- The `option-availability` route will check if there are at least 3 columns and check if at least one if them is `numeric`
- Once the option will be shown, the `dynamic-schema` route will read all `numeric` columns and display them in the option
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

###### Implementation details frontend

- There are 3 different files for displaying minibars: `minibar-positive.html`, `minibar-negative.html` and `minibar-mixed.html`
- Positive will display the `value` first and then the `minibar`. Both as a `td`-element
- Negative will display the `minibar` first and then the `value`. Both as a `td`-element
- Mixed will display the `value` and the `minibar` inside the `td` as a `div`-element but in the same order as listed above
- When resizing the graphic, the `EventLister` on the event `resize` implemented in the `getCardLayoutScript()` will be triggered
- When the graphic is smaller than `400px`, the renderingInfoScript `renderMinibarsFunction()` will be called inside the `EventListener` listed above
- The function `renderMinibarsFunction()` then loads the elements of the column `selectedColumn` and `minibarColumn` which then will passed to the function `handleMinibarsMinWidthFunctionName()`
- The function `handleMinibarsMinWidthFunctionName()` then either removes or adds `q-table-minibar-cell-mobile` or `q-table-minibar--mixed-mobile` to the cell according to the `type` of the table which can be read out on the dataset `data-minibar` on each cell

[to the top](#table-of-contents)


#### colorColumn

This feature allows to select a column and colorize it. There are two types: 
- `numerical`
- `categorical`

##### Numerical 

When selecting the numerical option, the numbers inside the column will be split in buckets. Depending on the `bucketType`, the buckets will be calculated differently. 
This option will be displayed with columns containing numerical values only, otherwise an error will be displayed.

#### Label

The label allows to select between three options: 
- `noLabel` (default)
- `average`
- `median`

This value will then be displayed on the legend. 

###### BucektType

There are four different buckets and each of it comes with it's own properties: 

- Ckmeans, `numberBuckets`
- Quantile, `numberBuckets`
- Equal, `numberBuckets`
- Custom, , `numberBuckets` and `customBuckets`

###### Scale

The scale can be chosen from between two types: 
- `sequential`
- `diverging`

###### Custom Color

When having the expert-role added, the user is able to adjust the colors of the buckets. 

When selecting the `diverging`-option, the options from which border it will be spilt are dynamically listed too. 

##### Categorical

When selecting the categorical option, the values of the column will be mapped to categories. The categories will then be colored according to the color-scale. 

##### Legend 

The way the legend will be displayed is depending on the `colorColumnType`. When using numerical-option, the range of the values will be calculated by buckets, which can be changed on the options. The lowest and highest value will be displayed on the left and right end of the legend. 

Depending on the selected bucketing method, the legend will be displayed differently. The array passed to render the legend looks as following:

```javascript
buckets = [
    {
        from, // lowest bucket border value
        to, // highest bucket border value
        color, // color depending on the selected color schema
    },
]
```

If there's the case that one of the bucket has just a single value in it, the single bucket will be displayed below with a seperate icon. If there is an entry without a value, there will be an extra icon too, for displaying 'no data'.

The categorical legend will simply map the values to their colors.

###### Implementation details serverside


- Just like the feature minibars, the `option-availability` route will check if there are at least 3 columns to display this option\
- If the option is selected, through the `dynamic-schema` route, depending on which `colorColumnType` is selected, will display specific options
- **Important**: The function `getColorColumnContext()` will always return an object, when minibars aren't used the object is empty
- The function `getColorColumnContext()` uses three parameters: `colorColumn`(option), `data`(data from table) and `width`(content-width)
- If the option is selected, the function `getColorColumnContext()` will always return this object
```javascript
{
  categoricalOptions, // object
  colorColumnType, // string
  colors, // array
  legendData, // object
  numericalOptions, // object
  selectedColumn, // number
}
```

- Depedning on the selected `colorColumnType`, either `numerical` or `categorical`, some of the properties will be added 
- **Important**: The properties `categoricalOptions` and `numericalOptions` will always be an object, even if not selected
- If selecting the `colorColumnType` `numerical`, the following properties will be added 
```javascript
{
  methodBox, // object
  formattedValue, // array 
}
```

###### Implementation details frontend

- Either `numerical` or `categorical`, both table-cells will be colored with the referece to the `colors` array
- The legend will be displayed 100% on `desktop` and `mobile`, on `fullwidth` it will be displayed `640px` (size of the text in article)
- When resizing the graphic, the `EventLister` on the event `resize` implemented in the `renderColorColumnNumericalLegend()` will be triggered
- The legend will then be resized according to the `width`

#### Display options

Display options can be set before embedding the graphic in the article.

##### hideTitle

Allows to hide the title

[to the top](#table-of-contents)

## License

Copyright (c) Neue Zürcher Zeitung. All rights reserved.

This software is published under the [MIT](LICENSE) license.

[to the top](#table-of-contents)
