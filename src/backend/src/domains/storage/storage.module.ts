import { Module } from '@nestjs/common';
import { StorageService } from './services/storage.service';
import { ConfigModule} from '@nestjs/config';
import { ZipExtractorService } from './services/zip-extractor.service';

@Module({
  imports: [ConfigModule],
  providers: [
    ZipExtractorService,
    StorageService
  ],
  controllers: [],
  exports: [
    StorageService, 
    ZipExtractorService
  ]
})
export class StorageModule { }
