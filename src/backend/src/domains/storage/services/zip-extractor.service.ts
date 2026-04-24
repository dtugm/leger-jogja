import { Injectable } from '@nestjs/common';
import AdmZip from 'adm-zip';
import { StorageService } from './storage.service';

export interface UploadedFile {
  key: string;
  contentType?: string;
  url?: string;
}

@Injectable()
export class ZipExtractorService {
  constructor(
    private readonly storageService: StorageService,
  ) {}

  async extractAndUpload(
    zipBuffer: Buffer | string,
    destinationPrefix: string,
  ): Promise<UploadedFile[]> {
    const zip = new AdmZip(zipBuffer);
    const uploadedFiles: UploadedFile[] = [];

    for (const zipEntry of zip.getEntries()) {
      if (!zipEntry.isDirectory) {
        const fileBuffer = zipEntry.getData();
        const key = `${destinationPrefix}/${zipEntry.entryName}`;

        const uploadedFile = await this.storageService.uploadFile(
          key,
          fileBuffer,
          this.getContentType(zipEntry.name),
        );

        uploadedFiles.push({
          key: uploadedFile.key,
          url: uploadedFile.url
        });
      }
    }

    return uploadedFiles;
  }

  private getContentType(filename: string): string {
    const extension = filename.split('.').pop()?.toLowerCase() || '';
    const contentTypes: { [key: string]: string } = {
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      png: 'image/png',
      gif: 'image/gif',
      pdf: 'application/pdf',
      json: 'application/json',
      gltf: 'model/gltf+json',
      glb: 'model/gltf-binary',
      b3dm: 'application/octet-stream',
      i3dm: 'application/octet-stream',
      pnts: 'application/octet-stream',
      vctr: 'application/octet-stream',
      cmpt: 'application/octet-stream',
      tileset: 'application/json',
    };

    return contentTypes[extension] || 'application/octet-stream';
  }
}
