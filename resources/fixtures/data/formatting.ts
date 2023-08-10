import { LABEL_LEGEND_ID } from "@src/enums";
import type { TableFixture } from "@src/interfaces";

const fixture: TableFixture = {
  "title": "FIXTURE: formatting",
  "subtitle": "Subtitle",
  "data": {
    "table": [
      // prettier-ignore
      ["0",  "1",    "2",     "3",  "4", "5", "6", "7", "8"], // Header.
      ["ch", "9999", "10000", "10", "1", "1", "1", "1", "1"],
      ["de", "9999", "9999",  "10", "1", "1", "1", "1", "-1"],
      ["no flag", "9999", "1000",  "10", "1", "1", "1", "1", "0"],
    ],
    "metaData": {
      "cells": []
    }
  },
  "sources": [],
  "options": {
    hideTableHeader: true,
    showTableSearch: false,
    colorColumn: {
      colorColumnType: 'numerical',
      selectedColumn: null,
      numericalOptions: {
        labelLegend: LABEL_LEGEND_ID.AVERAGE,
        bucketType: 'ckmeans',
        numberBuckets: 2,
        scale: 'sequential',
        colorScheme: "",
        colorOverwrites: [],
        customBuckets: "",
      },
      categoricalOptions: {
        colorOverwrites: [],
        customCategoriesOrder: [],
      }
    },
    "cardLayout": false,
    "cardLayoutIfSmall": true,
    "minibar": {
      "invertColors": false,
      "barColor": {
        "positive": {
          "className": "",
          "colorCode": ""
        },
        "negative": {
          "className": "",
          "colorCode": ""
        }
      },
      "selectedColumn": null,
    },
    "formatting": [
      {
        "column": 0,
        "formattingType": "country_flags"
      },
      {
        "column": 1,
        "formattingType": "0"
      },
      {
        "column": 2,
        "formattingType": "0.00"
      },
      {
        "column": 3,
        "formattingType": "0.000"
      },
      {
        "column": 4,
        "formattingType": "0%"
      },
      {
        "column": 5,
        "formattingType": "0.0%"
      },
      {
        "column": 6,
        "formattingType": "0.00%"
      },
      {
        "column": 7,
        "formattingType": "0.000%"
      },
      {
        "column": 8,
        "formattingType": "arrow_sign_relative_int"
      }
    ]
  }
}

export default fixture;