import { Module } from '@nestjs/common';
import { CitydbToolController } from './controllers/citydb-tool.controller';
import { CityDbToolService } from './services/citydb-tool.service';
import { ConfigModule } from '@nestjs/config';
import { CitydbQueryService } from './services/citydb-query.service';

@Module({
  imports: [ConfigModule],
  controllers: [CitydbToolController],
  providers: [CityDbToolService, CitydbQueryService],
  exports: [CityDbToolService, CitydbQueryService],
})
export class CitydbToolModule { }
