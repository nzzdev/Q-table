var rootDir = __dirname + "/../../";
var distDir = rootDir + 'dist/';
var helpersDir = distDir + "helpers";
var Boom = require("@hapi/boom");
var Joi = require("joi");
var dataHelpers = require("".concat(helpersDir, "/data.js"));
var colorColumnHelpers = require("".concat(helpersDir, "/colorColumn.js"));
function getMinibarEnum(item) {
    var _a;
    if (item.data.table.length < 1) {
        return [null];
    }
    return (_a = [null]).concat.apply(_a, dataHelpers.getNumericColumns(item.data.table).map(function (col) { return col.index; }));
}
function getMinibarEnumTitles(item) {
    var _a;
    if (item.data.table.length < 1) {
        return ["keine"];
    }
    return (_a = ["keine"]).concat.apply(_a, dataHelpers.getNumericColumns(item.data.table).map(function (col) { return col.title; }));
}
function getColorColumnEnum(item) {
    var _a;
    if (item.data.table.length < 1) {
        return [null];
    }
    return (_a = [null]).concat.apply(_a, dataHelpers
        .getCategoricalColumns(item.data.table)
        .map(function (col) { return col.index; }));
}
function getColorColumnEnumTitles(item) {
    var _a;
    if (item.data.table.length < 1) {
        return ["keine"];
    }
    return (_a = ["keine"]).concat.apply(_a, dataHelpers
        .getCategoricalColumns(item.data.table)
        .map(function (col) { return col.title; }));
}
function getScaleEnumWithTitles(numericalOptions) {
    var enumValues = ["sequential"];
    var enumTitles = ["Sequentiell"];
    var bucketNumber = 0;
    if (numericalOptions.bucketType === "custom") {
        if (numericalOptions.customBuckets) {
            var buckets = numericalOptions.customBuckets.split(",");
            bucketNumber = buckets.length - 1;
        }
    }
    else {
        bucketNumber = numericalOptions.numberBuckets;
    }
    // Add valid bucket borders to enum as diverging values
    for (var i = 1; i < bucketNumber; i++) {
        enumValues.push("border-".concat(i));
        enumTitles.push("Divergierend ab Grenze ".concat(i));
    }
    // Add valid buckets to enum as diverging values
    for (var i = 1; i < bucketNumber - 1; i++) {
        enumValues.push("bucket-".concat(i));
        enumTitles.push("Divergierend ab Bucket ".concat(i + 1));
    }
    return {
        "enum": enumValues,
        "Q:options": {
            enum_titles: enumTitles
        }
    };
}
function getColorSchemeEnumWithTitles(numericalOptions) {
    if (numericalOptions.scale === "sequential") {
        return {
            "enum": ["one", "two", "three", "female", "male"],
            "Q:options": {
                enum_titles: [
                    "Schema 1 (Standard)",
                    "Schema 2 (Standard-Alternative)",
                    "Schema 3 (negative Bedeutung)",
                    "Schema weiblich",
                    "Schema männlich",
                ]
            }
        };
    }
    return {
        "enum": ["one", "two", "three", "gender"],
        "Q:options": {
            enum_titles: [
                "Schema 1 (Standard negativ/positiv)",
                "Schema 2 (neutral)",
                "Schema 3 (Alternative negativ/positiv)",
                "Schema weiblich/männlich",
            ]
        }
    };
}
function getMaxItemsNumerical(colorColumn) {
    return {
        maxItems: colorColumnHelpers.getNumberBuckets(colorColumn)
    };
}
function getMaxItemsCategorical(data, colorColumn) {
    try {
        // removing the header row first
        data = dataHelpers.getDataWithoutHeaderRow(data);
        return {
            maxItems: dataHelpers.getUniqueCategoriesCount(data, colorColumn)
        };
    }
    catch (_a) {
        return {
            maxItems: undefined
        };
    }
}
function getColorOverwriteEnumAndTitlesNumerical(colorColumn) {
    try {
        var enumValues = [null];
        var numberItems = colorColumnHelpers.getNumberBuckets(colorColumn);
        for (var index = 0; index < numberItems; index++) {
            enumValues.push(index + 1);
        }
        return {
            "enum": enumValues,
            "Q:options": {
                enum_titles: enumValues.map(function (value) {
                    return value === null ? "" : "".concat(value, ". Bucket ");
                })
            }
        };
    }
    catch (_a) {
        return {};
    }
}
function getColorOverwriteEnumAndTitlesCategorical(data, colorColumn) {
    data = dataHelpers.getDataWithoutHeaderRow(data);
    var customCategoriesOrder = colorColumn.categoricalOptions.customCategoriesOrder;
    var enumValues = [null];
    var categories = dataHelpers.getUniqueCategoriesObject(data, colorColumn).categories;
    var numberItems = categories.length;
    for (var index = 0; index < numberItems; index++) {
        enumValues.push(index + 1);
    }
    return {
        "enum": enumValues,
        "Q:options": {
            enum_titles: [""].concat(categories.map(function (category, index) { return "".concat(index + 1, " - ").concat(category); }))
        }
    };
}
function getCustomCategoriesOrderEnumAndTitlesCategorical(data, colorColumn) {
    try {
        data = dataHelpers.getDataWithoutHeaderRow(data);
        var categories = dataHelpers.getUniqueCategoriesObject(data, colorColumn).categories;
        return {
            "enum": categories,
            "Q:options": {
                enum_titles: categories
            }
        };
    }
    catch (ex) {
        console.log(ex);
        return {};
    }
}
module.exports = {
    method: "POST",
    path: "/dynamic-schema/{optionName}",
    options: {
        validate: {
            payload: Joi.object()
        }
    },
    handler: function (request, h) {
        var item = request.payload.item;
        var optionName = request.params.optionName;
        if (optionName === "selectedColumnMinibar") {
            return {
                "enum": getMinibarEnum(item),
                "Q:options": {
                    enum_titles: getMinibarEnumTitles(item)
                }
            };
        }
        if (optionName === "selectedColorColumn") {
            return {
                "enum": getColorColumnEnum(item),
                "Q:options": {
                    enum_titles: getColorColumnEnumTitles(item)
                }
            };
        }
        if (optionName === "scale") {
            return getScaleEnumWithTitles(item.options.colorColumn.numericalOptions);
        }
        if (optionName === "colorScheme") {
            return getColorSchemeEnumWithTitles(item.options.colorColumn.numericalOptions);
        }
        if (optionName === "colorOverwrites") {
            if (item.options.colorColumn.colorColumnType === "numerical") {
                return getMaxItemsNumerical(item.options.colorColumn);
            }
            else {
                return getMaxItemsCategorical(item.data.table, item.options.colorColumn);
            }
        }
        if (optionName === "colorOverwritesItem") {
            if (item.options.colorColumn.colorColumnType === "numerical") {
                return getColorOverwriteEnumAndTitlesNumerical(item.options.colorColumn);
            }
            else {
                return getColorOverwriteEnumAndTitlesCategorical(item.data.table, item.options.colorColumn);
            }
        }
        if (optionName === "customCategoriesOrder") {
            return getMaxItemsCategorical(item.data, item.options.colorColumn);
        }
        if (optionName === "customCategoriesOrderItem") {
            return getCustomCategoriesOrderEnumAndTitlesCategorical(item.data.table, item.options.colorColumn);
        }
        return Boom.badRequest();
    }
};
