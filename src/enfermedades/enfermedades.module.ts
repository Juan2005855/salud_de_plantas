import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Enfermedad } from './enfermedad.entity.js';

@Module({
  imports: [TypeOrmModule.forFeature([Enfermedad])],
  exports: [TypeOrmModule],
})
export class EnfermedadesModule {}
