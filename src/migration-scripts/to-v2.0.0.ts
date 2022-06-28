export function migrate(uncastedItem: unknown): ReturnPayload {
  const item = uncastedItem as Item;

  const result: ReturnPayload = {
    isChanged: false,
    item: null,
  };

  if (item.options.minibar === undefined) {
    const parsedNumber = parseInt(item.options.minibarOptions || '');

    if (!isNaN(parsedNumber)) {
      const minibars: Minibar = {
        selectedColumn: parsedNumber + 1,
        barColor: {
          positive: {
            className: '',
            colorCode: ''
          },
          negative: {
            className: '',
            colorCode: ''
          }
        },
        invertColors: false
      };

      item.options['minibar'] = minibars;
      delete item.options.minibarOptions;
      result.isChanged = true;
    } else {
      delete item.options.minibarOptions;
      result.isChanged = true;
    }
  }

  result.item = item;
  return result;
}

interface ReturnPayload {
  isChanged: boolean,
  item: null | unknown,
}

interface Item {
  options: {
    minibarOptions?: string,
    minibar: Minibar | undefined,
  }
}

interface Minibar {
  selectedColumn: number,
  barColor: {
    positive: { className: string, colorCode: string },
    negative: { className: string, colorCode: string },
  },
  invertColors: boolean,
}
