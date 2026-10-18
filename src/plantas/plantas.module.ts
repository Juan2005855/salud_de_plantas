import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlantasService } from './plantas.service.js';
import { PLANTAS_SERVICE } from './tokens.js';
import { PlantasController } from './plantas.controller.js';
import { Planta } from './planta.entity.js';
import { Cultivo } from '../cultivos/cultivo.entity.js';

@Module({
  imports: [TypeOrmModule.forFeature([Planta, Cultivo])],
  providers: [
    {
      provide: PLANTAS_SERVICE,
      useClass: PlantasService,
    },
  ],
  controllers: [PlantasController],
})
export class PlantasModule {}
