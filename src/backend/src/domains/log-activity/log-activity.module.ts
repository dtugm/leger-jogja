import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LogActivityService } from './services/log-activity.service';
import { LogActivityController } from './controllers/log-activity.controller';
import { LogActivity } from './entities/log-activity.entity';

@Module({
  imports: [TypeOrmModule.forFeature([LogActivity])],
  controllers: [LogActivityController],
  providers: [LogActivityService],
  exports: [LogActivityService],
})
export class LogActivityModule {}
