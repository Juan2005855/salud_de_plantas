import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Enfermedad } from './enfermedad.entity.js';
import { EnfermedadesController } from './enfermedades.controller.js';
import { EnfermedadesService } from './enfermedades.service.js';

@Module({
  imports: [TypeOrmModule.forFeature([Enfermedad])],
  controllers: [EnfermedadesController],
  providers: [EnfermedadesService],
  exports: [EnfermedadesService, TypeOrmModule],
})
export class EnfermedadesModule {}