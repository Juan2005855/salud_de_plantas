import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { EstadisticasService } from './estadisticas.service.js';

@ApiTags('Estadísticas')
@Controller('estadisticas/brotes')
export class EstadisticasController {
  constructor(
    private readonly estadisticasService: EstadisticasService,
  ) {}

  @Get('por-enfermedad')
  @ApiOperation({
    summary: 'Contar brotes y hectáreas afectadas por enfermedad',
  })
  @ApiResponse({
    status: 200,
    description:
      'Lista de enfermedades con su total de brotes y hectáreas afectadas, de mayor a menor.',
  })
  porEnfermedad() {
    return this.estadisticasService.porEnfermedad();
  }

  @Get('por-region')
  @ApiOperation({
    summary: 'Contar brotes y hectáreas afectadas por región',
  })
  @ApiResponse({
    status: 200,
    description:
      'Lista de regiones con su total de brotes y hectáreas afectadas, de mayor a menor.',
  })
  porRegion() {
    return this.estadisticasService.porRegion();
  }

  @Get('por-periodo')
  @ApiOperation({
    summary: 'Contar brotes y hectáreas afectadas por mes',
  })
  @ApiResponse({
    status: 200,
    description:
      'Lista de meses (formato AAAA-MM) con su total de brotes y hectáreas afectadas.',
  })
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
  @ApiOperation({
    summary: 'Contar brotes y hectáreas afectadas por planta',
  })
  @ApiResponse({
    status: 200,
    description:
      'Lista de plantas con su total de brotes y hectáreas afectadas, de mayor a menor.',
  })
  porPlanta() {
    return this.estadisticasService.porPlanta();
  }
}