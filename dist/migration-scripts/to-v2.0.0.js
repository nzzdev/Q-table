export function migrate(uncastedItem) {
    const item = uncastedItem;
    let result = {
        isChanged: false,
        item: null,
    };
    if (item.options.minibar === undefined) {
        const parsedNumber = parseInt(item.options.minibarOptions || '');
        if (!isNaN(parsedNumber)) {
            let minibars = {
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
        }
        else {
            delete item.options.minibarOptions;
            result.isChanged = true;
        }
    }
    result.item = item;
    return result;
}
;
