import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Susceptibilidad } from './susceptibilidad.entity.js';
import { SusceptibilidadesService } from './susceptibilidades.service.js';
import { SusceptibilidadesController } from './susceptibilidades.controller.js';

@Module({
  imports: [TypeOrmModule.forFeature([Susceptibilidad])],
  controllers: [SusceptibilidadesController],
  providers: [SusceptibilidadesService],
  exports: [SusceptibilidadesService],
})
export class SusceptibilidadesModule {}