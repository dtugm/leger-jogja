import { Module } from '@nestjs/common';
import { Tiles3dService } from './services/tiles3d.service';
import { Tiles3dController } from './controllers/tiles3d.controller';
import { StorageModule } from '../storage/storage.module';
import { Tileset3dService } from './services/tileset3d.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Tiles3D } from './entities/tiles3d.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Tiles3D
    ]),
    StorageModule
  ],
  providers: [Tiles3dService, Tileset3dService],
  controllers: [Tiles3dController],
})
export class Tiles3dModule { }
