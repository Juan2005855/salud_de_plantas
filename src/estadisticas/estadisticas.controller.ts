import { Controller, Get } from '@nestjs/common';
import { EstadisticasService } from './estadisticas.service.js';

@Controller('statistics/outbreaks')
export class EstadisticasController {
  constructor(
    private readonly estadisticasService: EstadisticasService,
  ) {}

  @Get('by-disease')
  porEnfermedad() {
    return this.estadisticasService.porEnfermedad();
  }

  @Get('by-region')
  porRegion() {
    return this.estadisticasService.porRegion();
  }

  @Get('by-period')
  porPeriodo() {
    return this.estadisticasService.porPeriodo();
  }

  @Get('by-plant')
  porPlanta() {
    return this.estadisticasService.porPlanta();
  }
}
