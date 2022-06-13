export function migrate(uncastedItem) {
    const item = uncastedItem;
    const data = item.data;
    let result = {
        isChanged: false,
        item: null,
    };
    let metaData = null;
    if (data && typeof data === 'object' && !Array.isArray(data)) {
        metaData = data.metaData;
    }
    if (metaData === undefined || metaData === null) {
        const castedData = data;
        let slicedData = castedData.slice();
        item.data = {
            table: slicedData,
            metaData: {
                cells: []
            }
        };
        result.isChanged = true;
    }
    result.item = item;
    return result;
}
;
