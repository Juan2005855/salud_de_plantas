import { Controller, Get } from '@nestjs/common';
import { EstadisticasService } from './estadisticas.service.js';

@Controller('estadisticas/brotes')
export class EstadisticasController {
  constructor(
    private readonly estadisticasService: EstadisticasService,
  ) {}

  @Get('por-enfermedad')
  porEnfermedad() {
    return this.estadisticasService.porEnfermedad();
  }

  @Get('por-region')
  porRegion() {
    return this.estadisticasService.porRegion();
  }

  @Get('por-periodo')
  porPeriodo() {
    return this.estadisticasService.porPeriodo();
  }

  @Get('por-planta')
  porPlanta() {
    return this.estadisticasService.porPlanta();
  }
}