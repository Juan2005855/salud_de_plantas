import { Module } from '@nestjs/common';
import { BrotesController } from './brotes.controller.js';
import { BrotesService } from './brotes.service.js';

@Module({
  controllers: [BrotesController],
  providers: [BrotesService],
  exports: [BrotesService],
})
export class BrotesModule {}
