import { ImportMode } from "../enums/import-mode.enum";

export interface ExportFileOptions {
  outputFile: string;
  objectId?: string;
  srid?: number;
  assetId?: string;
  sourceFileId?: string;
}

export interface ImportFileOptions {
  inputFile: string;
  importer: string;
  importMode: ImportMode;
}

export interface RemoveDataOptions {
  assetId?: string;
  sourceFileId?: string;
}