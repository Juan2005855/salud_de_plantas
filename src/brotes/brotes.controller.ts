import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { BrotesService } from './brotes.service.js';

@Controller('brotes')
export class BrotesController {
  constructor(private readonly brotesService: BrotesService) {}

  @Get('resumen')
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

  @Get(':id')
  obtenerPorId(@Param('id', ParseIntPipe) id: number) {
    return this.brotesService.obtenerPorId(id);
  }

  @Post()
  crear(@Body() datos: Record<string, unknown>) {
    return this.brotesService.crear(this.convertirDatos(datos));
  }

  @Patch(':id')
  actualizar(
    @Param('id', ParseIntPipe) id: number,
    @Body() datos: Record<string, unknown>,
  ) {
    return this.brotesService.actualizar(
      id,
      this.convertirDatos(datos),
    );
  }

  @Delete(':id')
  eliminar(@Param('id', ParseIntPipe) id: number) {
    return this.brotesService.eliminar(id);
  }

  private convertirDatos(datos: Record<string, unknown>) {
    const resultado: {
      plantaId?: number;
      enfermedadId?: number;
      fecha?: string;
      region?: string;
      hectareasAfectadas?: number;
    } = {};

    if (datos.plantaId !== undefined) {
      resultado.plantaId = this.convertirNumero(
        datos.plantaId,
        'plantaId',
      );
    }

    if (datos.enfermedadId !== undefined) {
      resultado.enfermedadId = this.convertirNumero(
        datos.enfermedadId,
        'enfermedadId',
      );
    }

    if (datos.fecha !== undefined) {
      if (typeof datos.fecha !== 'string') {
        throw new BadRequestException(
          'fecha debe ser una cadena con formato YYYY-MM-DD.',
        );
      }

      resultado.fecha = datos.fecha;
    }

    if (datos.region !== undefined) {
      if (typeof datos.region !== 'string') {
        throw new BadRequestException('region debe ser un texto.');
      }

      resultado.region = datos.region;
    }

    if (datos.hectareasAfectadas !== undefined) {
      resultado.hectareasAfectadas = this.convertirNumero(
        datos.hectareasAfectadas,
        'hectareasAfectadas',
      );
    }

    return resultado;
  }

  private convertirNumero(valor: unknown, campo: string): number {
    if (typeof valor !== 'number' || !Number.isFinite(valor)) {
      throw new BadRequestException(
        `${campo} debe ser un número.`,
      );
    }

    return valor;
  }
}