export interface AddAttributeToGML {
    assetId: string;
    sourceFileId: string;
    filepath: string;
    validFrom?: string;
    validTo?: string;
}

export interface normalizeCityGML {
    filepath: string;
    outputPath: string;
    datasetName: string;
}