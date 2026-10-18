import { Module } from '@nestjs/common';

import { CultivosController } from './cultivos.controller.js';
import { CultivosService } from './cultivos.service.js';

@Module({
  controllers: [CultivosController],
  providers: [CultivosService],
  exports: [CultivosService],
})
export class CultivosModule {}
