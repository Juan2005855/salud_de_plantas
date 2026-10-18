import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
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

  @Get('por-patogeno')
  @ApiOperation({ summary: 'Contar brotes y hectáreas afectadas por patógeno' })
  @ApiResponse({
    status: 200,
    description:
      'Lista de patógenos con su total de brotes y hectáreas afectadas, de mayor a menor.',
  })
  porPatogeno() {
    return this.estadisticasService.porPatogeno();
  }

  @Get('por-planta')
  porPlanta() {
    return this.estadisticasService.porPlanta();
  }
}