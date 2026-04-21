import { Module } from '@nestjs/common';
import { AssetService } from './services/asset.service';
import { AssetController } from './controllers/asset.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Asset } from './entities/asset.entity';
import { SourceFileService } from './services/source-file.service';
import { SourceFile } from './entities/source-file.entity';
import { CitydbToolModule } from '../citydb-tool/citydb-tool.module';
import { ToolModule } from 'src/tool/tool.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Asset, SourceFile]),
    CitydbToolModule, 
    ToolModule
  ],
  controllers: [AssetController],
  providers: [AssetService, SourceFileService]
})
export class AssetModule { }
