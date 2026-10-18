import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CultivosService } from './cultivos.service.js';
import { CULTIVOS_SERVICE } from './tokens.js';
import { CultivosController } from './cultivos.controller.js';
import { Cultivo } from './cultivo.entity.js';
import { Planta } from '../plantas/planta.entity.js';

@Module({
  imports: [TypeOrmModule.forFeature([Cultivo, Planta])],
  providers: [
    {
      provide: CULTIVOS_SERVICE,
      useClass: CultivosService
    },
  ],
  controllers: [CultivosController],
})
export class CultivosModule {}