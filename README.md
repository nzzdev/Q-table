# Q Table

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

- [Card-Layout](#card-layout)
- [Minibars](#minibars)
- [Footnotes](#footnotes)

### Card-Layout
Card-Layout is an option to display large tables well-arranged on mobile. 

#### General
- The Card-Layout renderingInfoScript contains an `EventListener` on the event `resize` which calculates the current size of the graphic
- When the graphic is smaller than `400px`, the renderingInfoScript `applyCardLayoutClassFunction` adds the class `q-table--card-layout` to the `dataObject` and replaces all its styles
- The column headers will then be hidden and each cell will display the `:before` selector containing its column header (e.g. `Header1`)

### Minibars

### Footnotes

## License
Copyright (c) 2018 Neue Zürcher Zeitung. All rights reserved.

This software is published under the MIT license.
