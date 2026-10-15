import { Controller, Get, Query } from '@nestjs/common';
import { BrotesService } from './brotes.service.js';

@Controller('outbreaks')
export class BrotesController {
  constructor(private readonly brotesService: BrotesService) {}

  @Get('summary')
  obtenerResumen() {
    return this.brotesService.obtenerResumen();
  }

  @Get()
  obtenerFiltrados(
    @Query('region') region?: string,
    @Query('fechaDesde') fechaDesde?: string,
    @Query('fechaHasta') fechaHasta?: string,
    @Query('plantaId') plantaId?: string,
    @Query('enfermedadId') enfermedadId?: string,
  ) {
    return this.brotesService.obtenerFiltrados({
      region,
      fechaDesde,
      fechaHasta,
      plantaId,
      enfermedadId,
    });
  }
}