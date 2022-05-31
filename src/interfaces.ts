export type BucketType = 'ckmeans' | 'quantile' | 'equal' | 'custom';

interface ColorColumn {
    colorColumnType: string, //'numerical',
    numericalOptions: {
        labelLegend: string,
        bucketType: BucketType,
        numberBuckets: number,
        scale: string,
        colorScheme: string,
        colorOverwrites: Array<any>
    },
    categoricalOptions: {
        colorOverwrites: Array<any>,
        customCategoriesOrder: Array<any>,
    },
    selectedColumn: string | null,
}

export interface QTableConfig {
    acronym: string;
    data: {
        table: Array<Array<string>>,
        metadata: {
            cells: Array<any>
        }
    },
    sources: Array<any>,
    options: {
        hideTableHeader: Boolean,
        showTableSearch: Boolean,
        cardLayout: Boolean,
        cardLayoutIfSmall: Boolean,
        minibar: {
            invertColors: Boolean,
            barColor: {
                positive: { className: string, colorCode: string },
                negative: { className: string, colorCode: string },
            },
            selectedColumn: number
        },
        colorColumn: ColorColumn
    },
    title: string,
    subtitle: string,
    notes: string,
}

export interface ToolRuntimeConfig {
    fileRequestBaseUrl: string,
    toolBaseUrl: string,
    id: string,
    size: {
        width: Array<{value: number, comparison: '=' | '>' | '<' | '>=' | '<='}>
    },
    isPure: Boolean,
    requestId: string,
}