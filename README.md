# Q Table [![Build Status](https://travis-ci.com/nzzdev/Q-table.svg?token=g43MZxbtUcZ6QyxqUoJM&branch=dev)](https://travis-ci.com/nzzdev/Q-table)

[![Greenkeeper badge](https://badges.greenkeeper.io/nzzdev/Q-table.svg?token=70f2c40b32fd66edccfe705c14e1443e8e403768fadc870f4f22f749877c522b&ts=1549974271422)](https://greenkeeper.io/)

**Maintainer**: [manuelroth](https://github.com/manuelroth)

Q Table is one tool of the Q toolbox to create tables.
Test it in the [demo](https://editor.q.tools).

- [Installation](#installation)
- [Development](#development)
- [Implementation details](#implementation-details)
- [Features](#features)
- [License](#license)

## Installation

```bash
$ npm install
$ npm run build
```

## Development

Install the [Q cli](https://github.com/nzzdev/Q-cli) and start the Q dev server:

```
$ Q server
```

Run the Q tool:
```
$ node index.js
```

## Implementation details
The tool structure follows the general structure of each Q tool. Further information can be found in [Q server documentation - Developing tools](https://nzzdev.github.io/Q-server/developing-tools.html).

## Features

### Spacing

- Q-Table uses [CSS Table-Layout](https://developer.mozilla.org/en-US/docs/Web/CSS/table-layout) to adjust columns, rows and cells
- An algorythm discribes how large the width of each column and cell should be and to use the whole desktop width
- We want to give the responsability fully to the browser and don't want to calculate the layout by our own
- We want define rules based on the type of the column (Number, Text, Minibar)

#### Rules for spacing
###### Text after number
The spacing between text and number is by default pretty small, that's why we handle this by our own

![Text after number](https://user-images.githubusercontent.com/7341342/52629728-a8111f80-2eba-11e9-9980-6db1211cfdef.png# text-after-number)

##### Implementation details
There's a CSS rule which contains that if the table doesn't use Card-Layout, the cell is not `q-talble-minibar-header` and the following cell is not `q-table__cell--numeric` then the `padding-left` will be `20px`.


### Collapsable table
This is a feature to shorten large tables in the article and make them collapsable.

![Show more button](https://user-images.githubusercontent.com/7341342/52629726-a8111f80-2eba-11e9-9194-4597c030cb26.png# show-more-button)

##### Implementation details
- When rendering the rows, the renderingInfoScript `getShowMoreButtonScript()` will check how many rows the table contains
- If the table will be displayed as Card-Layout and contains more than 6 rows, the first 3 rows will be displayed, the rest will be hidden
- If the table will be displayed with the Card-Layout and contains more than 15 rows, the frist 10 will be displayed, the reest will be hidden
- If there are rows hidden, a new element will be created with the class `q-table_show-more-button` assigned
- Clicking on the button will either call the function `showRowsFunction()` or `hideRowsFunction()`
- When calling the `hideRowsFunction`, the table will be collapsed again and with the function `scrollIntoView()` scrolled back to the top of the table


### Card-Layout
Card-Layout is an option to display large tables well-arranged on mobile. There are 2 options to use it:
- Only show the Card-Layout in the mobile view
- Show the Card-Layout in every view

![Card-Layout](https://user-images.githubusercontent.com/7341342/52629727-a8111f80-2eba-11e9-90ee-cd957a4c66cd.png# card-layout)

##### Implementation details
- The Card-Layout renderingInfoScript contains an `EventListener` on the event `resize` which calculates the current size of the graphic
- When the graphic is smaller than `400px`, the renderingInfoScript `applyCardLayoutClassFunction` adds the class `q-table--card-layout` to the `dataObject` and replaces all its styles
- The column headers will then be hidden and each cell will display the `:before` selector containing its column header (e.g. `Header1`)

### Minibars
tbd

### Footnotes
tbd

## License
Copyright (c) 2019 Neue Zürcher Zeitung. All rights reserved.

This software is published under the MIT license.

img[src*="#text-after-number"] {
   width:150px;
   height:100px;
}

img[src*="#show-more-button"] {
   width:150px;
   height:100px;
}

img[src*="#card-layout"] {
   width:150px;
   height:100px;
}