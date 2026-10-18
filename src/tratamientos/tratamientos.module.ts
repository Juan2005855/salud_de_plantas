import { Module } from '@nestjs/common';

import { TratamientosController } from './tratamientos.controller.js';
import { TratamientosService } from './tratamientos.service.js';

@Module({
  controllers: [TratamientosController],
  providers: [TratamientosService],
  exports: [TratamientosService],
})
export class TratamientosModule {}