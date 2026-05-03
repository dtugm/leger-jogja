import { Module } from '@nestjs/common';
import { GmlService } from './services/gml/gml.service';

@Module({
  providers: [GmlService],
  exports: [GmlService]
})
export class ToolModule {}
