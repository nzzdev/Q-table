"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
// Setup svelte environment.
require("svelte/register");
// Require tools.
var Ajv = require("ajv");
var Boom = require("@hapi/boom");
var fs = require("fs");
var UglifyJS = require("uglify-js");
// Directories.
var rootDir = __dirname + "/../../../";
var distDir = rootDir + 'dist/';
var resourcesDir = rootDir + "resources/";
var helpersDir = distDir + "helpers";
var viewsDir = distDir + "components/";
// const viewsDir = __dirname + "/../../views/";
var stylesDir = distDir + "styles/";
// Template file.
var tableTemplate = require(viewsDir + "Table.svelte")["default"];
var styleHashMap = require("".concat(stylesDir, "/hashMap.json"));
var getExactPixelWidth = require("".concat(helpersDir, "/toolRuntimeConfig.js")).getExactPixelWidth;
var dataHelpers = require("".concat(helpersDir, "/data.js"));
var footnoteHelpers = require("".concat(helpersDir, "/footnotes.js"));
var minibarHelpers = require("".concat(helpersDir, "/minibars.js"));
var colorColumnHelpers = require("".concat(helpersDir, "/colorColumn.js"));
var renderingInfoScripts = require("".concat(helpersDir, "/renderingInfoScript.js"));
// POSTed item will be validated against given schema
// hence we fetch the JSON schema...
var schemaString = JSON.parse(fs.readFileSync(resourcesDir + "schema.json", {
    encoding: "utf-8"
}));
var ajv = new Ajv();
var validate = ajv.compile(schemaString);
function validateAgainstSchema(item, options) {
    if (validate(item)) {
        return item;
    }
    else {
        throw Boom.badRequest(JSON.stringify(validate.errors));
    }
}
function validatePayload(payload, options, next) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (typeof payload !== "object") {
                        return [2 /*return*/, next(Boom.badRequest(), payload)];
                    }
                    if (typeof payload.item !== "object") {
                        return [2 /*return*/, next(Boom.badRequest(), payload)];
                    }
                    if (typeof payload.toolRuntimeConfig !== "object") {
                        return [2 /*return*/, next(Boom.badRequest(), payload)];
                    }
                    return [4 /*yield*/, validateAgainstSchema(payload.item, options)];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
module.exports = {
    method: "POST",
    path: "/rendering-info/web",
    options: {
        validate: {
            options: {
                allowUnknown: true
            },
            payload: validatePayload
        }
    },
    handler: function (request, h) {
        return __awaiter(this, void 0, void 0, function () {
            var renderingInfo, config, toolRuntimeConfig, width, itemDataCopy, dataWithoutHeaderRow, footnotes, minibarsAvailable, colorColumnAvailable, context, possibleToHaveToHideRows, _i, _a, script;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        renderingInfo = {
                            polyfills: ["Promise"],
                            stylesheets: [{
                                    name: styleHashMap["q-table"]
                                }]
                        };
                        config = request.payload.item;
                        toolRuntimeConfig = request.payload.toolRuntimeConfig;
                        width = getExactPixelWidth(toolRuntimeConfig);
                        itemDataCopy = config.data.table.slice(0);
                        dataWithoutHeaderRow = dataHelpers.getDataWithoutHeaderRow(itemDataCopy);
                        footnotes = footnoteHelpers.getFootnotes(config.data.metaData, config.options.hideTableHeader);
                        return [4 /*yield*/, request.server.inject({
                                url: "/option-availability/selectedColumnMinibar",
                                method: "POST",
                                payload: { item: config }
                            })];
                    case 1:
                        minibarsAvailable = _b.sent();
                        return [4 /*yield*/, request.server.inject({
                                url: "/option-availability/selectedColorColumn",
                                method: "POST",
                                payload: { item: config }
                            })];
                    case 2:
                        colorColumnAvailable = _b.sent();
                        context = {
                            item: config,
                            config: config,
                            tableData: dataHelpers.getTableData(config.data.table, footnotes, config.options),
                            minibar: minibarsAvailable.result.available
                                ? minibarHelpers.getMinibarContext(config.options, itemDataCopy)
                                : {},
                            footnotes: footnotes,
                            colorColumn: colorColumnAvailable.result.available
                                ? colorColumnHelpers.getColorColumnContext(config.options.colorColumn, dataWithoutHeaderRow, width)
                                : {},
                            numberOfRows: config.data.table.length - 1,
                            displayOptions: request.payload.toolRuntimeConfig.displayOptions || {},
                            noInteraction: request.payload.toolRuntimeConfig.noInteraction,
                            id: "q_table_".concat(request.query._id, "_").concat(Math.floor(Math.random() * 100000)).replace(/-/g, ""),
                            width: width
                        };
                        // if we have a width and cardLayoutIfSmall is true, we will initWithCardLayout
                        if (context.width &&
                            context.width < 400 &&
                            config.options.cardLayoutIfSmall) {
                            context.initWithCardLayout = true;
                        }
                        else if (config.options.cardLayout) {
                            context.initWithCardLayout = true;
                        }
                        // calculate the number of rows to hide
                        // if we init with card layout, we need to have minimum of 6 rows to hide all but 3 of them
                        // this calculation here is not correct if we didn't get the width, as it doesn't take small/wide layout into account
                        // but it's good enough to already apply display: none; in the markup to not use the complete height until the stylesheets/scripts are loaded
                        if (context.initWithCardLayout && context.numberOfRows >= 6) {
                            context.numberOfRowsToHide = context.numberOfRows - 3; // show 3 initially
                        }
                        else if (context.numberOfRows >= 15) {
                            // if we init without cardLayout, we hide rows if we have more than 15
                            context.numberOfRowsToHide = context.numberOfRows - 10; // show 10 initially
                        }
                        // if we have toolRuntimeConfig.noInteraction, we do not hide rows because showing them is not possible
                        if (request.payload.toolRuntimeConfig.noInteraction) {
                            context.numberOfRowsToHide = undefined;
                        }
                        try {
                            renderingInfo.markup = tableTemplate.render(context).html;
                        }
                        catch (ex) {
                            console.log(ex);
                        }
                        // the scripts need to know if we are confident that the numberOfRowsToHide is correct
                        // it's only valid if we had a fixed width given in toolRuntimeConfig, otherwise we reset it here to be calculated by the scripts again
                        if (context.width === undefined) {
                            context.numberOfRowsToHide = undefined;
                        }
                        possibleToHaveToHideRows = false;
                        // if we show cards, we hide if more or equal than 6
                        if (config.options.cardLayout && context.numberOfRows >= 6) {
                            possibleToHaveToHideRows = true;
                        }
                        // if we have cards for small, we hide if more or equal than 6
                        if (config.options.cardLayoutIfSmall && // we have cardLayoutIfSmall
                            (context.width === undefined || context.width < 400) && // width is unknown or below 400px
                            context.numberOfRows >= 6 // more than 6 rows
                        ) {
                            possibleToHaveToHideRows = true;
                        }
                        // if we have more than 15 rows, we probably have to hide rows
                        if (context.numberOfRows >= 15) {
                            possibleToHaveToHideRows = true;
                        }
                        if (request.payload.toolRuntimeConfig.noInteraction) {
                            possibleToHaveToHideRows = false;
                        }
                        renderingInfo.scripts = [];
                        // if we are going to add any script, we want the default script first
                        if ((config.options.cardLayout === false &&
                            config.options.cardLayoutIfSmall === true) ||
                            possibleToHaveToHideRows ||
                            Object.keys(context.minibar).length !== 0 ||
                            Object.keys(context.colorColumn).length !== 0) {
                            renderingInfo.scripts.push({
                                content: renderingInfoScripts.getDefaultScript(context)
                            });
                        }
                        // if we have cardLayoutIfSmall, we need to measure the width to set the class
                        // not needed if we have cardLayout all the time
                        if (config.options.cardLayout === false &&
                            config.options.cardLayoutIfSmall === true) {
                            renderingInfo.scripts.push({
                                content: renderingInfoScripts.getCardLayoutScript(context)
                            });
                        }
                        if (possibleToHaveToHideRows) {
                            renderingInfo.scripts.push({
                                content: renderingInfoScripts.getShowMoreButtonScript(context)
                            });
                        }
                        if (context.noInteraction !== true &&
                            config.options.showTableSearch === true) {
                            renderingInfo.scripts.push({
                                content: renderingInfoScripts.getSearchFormInputScript(context)
                            });
                        }
                        if (Object.keys(context.minibar).length !== 0) {
                            renderingInfo.scripts.push({
                                content: renderingInfoScripts.getMinibarsScript(context)
                            });
                        }
                        if (Object.keys(context.colorColumn).length !== 0) {
                            renderingInfo.scripts.push({
                                content: renderingInfoScripts.getColorColumnScript(context)
                            });
                        }
                        // minify the scripts
                        for (_i = 0, _a = renderingInfo.scripts; _i < _a.length; _i++) {
                            script = _a[_i];
                            script.content = UglifyJS.minify(script.content).code;
                        }
                        return [2 /*return*/, renderingInfo];
                }
            });
        });
    }
};
