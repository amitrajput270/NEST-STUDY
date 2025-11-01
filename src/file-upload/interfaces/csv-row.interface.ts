export interface CsvRow {
    [key: string]: any;
}

export interface ProcessingResult {
    totalRows: number;
    processedRows: number;
    failedRows: number;
    errors: Array<{
        row: number;
        error: string;
    }>;
}
