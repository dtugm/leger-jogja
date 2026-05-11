import { Module } from '@nestjs/common';
import { PmtilesService } from './services/pmtiles.service';
import { PmtilesController } from './controllers/pmtiles.controller';
import { StorageModule } from '../storage/storage.module';
import { CacheModule } from 'src/cache/cache.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Pmtiles } from './entities/pmtiles.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Pmtiles]), StorageModule, CacheModule],
  providers: [PmtilesService],
  controllers: [PmtilesController],
})
export class PmtilesModule {}
