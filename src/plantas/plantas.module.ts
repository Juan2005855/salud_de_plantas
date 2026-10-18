import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Planta } from './planta.entity.js';
import { PlantasController } from './plantas.controller.js';
import { PlantasService } from './plantas.service.js';

@Module({
  imports: [TypeOrmModule.forFeature([Planta])],
  controllers: [PlantasController],
  providers: [PlantasService],
  exports: [PlantasService],
})
export class PlantasModule {}