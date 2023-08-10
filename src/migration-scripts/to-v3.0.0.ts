export function migrate(uncastedItem: unknown): ReturnPayload {
  const item = uncastedItem as Item;
  const data = item.data;

  const result: ReturnPayload = {
    isChanged: false,
    item: null,
  };

  let metaData: null | undefined | Record<string, unknown> = null;

  if (data && typeof data === 'object' && !Array.isArray(data)) {
    metaData = data.metaData;
  }

  if (metaData === undefined || metaData === null) {
    const castedData = data as unknown[];
    const slicedData = castedData.slice();

    item.data = {
      table: slicedData,
      metaData: {
        cells: [],
      },
    };

    result.isChanged = true;
  }

  result.item = item;

  return result;
}

interface Item {
  data: Data | undefined | null | unknown[];
}

interface Data {
  table: unknown[];
  metaData: Record<string, unknown>;
}

interface ReturnPayload {
  isChanged: boolean;
  item: unknown;
}
