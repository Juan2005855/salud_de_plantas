
import { Module } from '@nestjs/common';
import { PatogenosController } from './patogenos.controller.js';
import { PatogenosService } from './patogenos.service.js';

@Module({
  controllers: [PatogenosController],
  providers: [PatogenosService],
  exports: [PatogenosService],
})
export class PatogenosModule {}
