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
import {
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { BrotesService } from './brotes.service.js';
import { CrearBroteDto } from './dto/crear-brote.dto.js';
import { ActualizarBroteDto } from './dto/actualizar-brote.dto.js';
import { FiltrarBroteDto } from './dto/filtrar-brote.dto.js';

@ApiTags('Brotes')
@Controller('brotes')
export class BrotesController {
  constructor(private readonly brotesService: BrotesService) {}

  @Get('resumen')
  @ApiOperation({
    summary: 'Consultar el resumen general de brotes y hectáreas afectadas',
  })
  @ApiResponse({
    status: 200,
    description:
      'Total de brotes y hectáreas afectadas, con el detalle por región.',
  })
  obtenerResumen() {
    return this.brotesService.obtenerResumen();
  }

  @Get()
  @ApiOperation({
    summary: 'Listar brotes con filtros opcionales',
  })
  @ApiResponse({ status: 200, description: 'Lista de brotes.' })
  @ApiResponse({
    status: 400,
    description: 'Algún filtro tiene un valor inválido.',
  })
  obtenerFiltrados(@Query() filtros: FiltrarBroteDto) {
    return this.brotesService.obtenerFiltrados({
      region: filtros.region,
      fechaDesde: filtros.fechaDesde,
      fechaHasta: filtros.fechaHasta,
      plantaId: filtros.plantaId,
      enfermedadId: filtros.enfermedadId,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Consultar un brote por su identificador' })
  @ApiResponse({ status: 200, description: 'Datos del brote.' })
  @ApiResponse({
    status: 400,
    description: 'El identificador es inválido.',
  })
  @ApiResponse({ status: 404, description: 'El brote no existe.' })
  obtenerPorId(@Param('id', ParseIntPipe) id: number) {
    return this.brotesService.obtenerPorId(id);
  }

  @Post()
  @ApiOperation({ summary: 'Registrar un brote' })
  @ApiResponse({
    status: 201,
    description: 'Brote creado correctamente.',
  })
  @ApiResponse({
    status: 400,
    description:
      'Datos inválidos, fecha futura, hectáreas no mayores que cero, o planta o enfermedad inexistente.',
  })
  crear(@Body() dto: CrearBroteDto) {
    return this.brotesService.crear(this.convertirDatos(dto));
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un brote' })
  @ApiResponse({
    status: 200,
    description: 'Brote actualizado correctamente.',
  })
  @ApiResponse({
    status: 400,
    description:
      'Datos inválidos, fecha futura, hectáreas no mayores que cero, o planta o enfermedad inexistente.',
  })
  @ApiResponse({ status: 404, description: 'El brote no existe.' })
  actualizar(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ActualizarBroteDto,
  ) {
    return this.brotesService.actualizar(
      id,
      this.convertirDatos(dto),
    );
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un brote' })
  @ApiResponse({
    status: 200,
    description: 'Brote eliminado correctamente.',
  })
  @ApiResponse({
    status: 400,
    description: 'El identificador es inválido.',
  })
  @ApiResponse({ status: 404, description: 'El brote no existe.' })
  eliminar(@Param('id', ParseIntPipe) id: number) {
    return this.brotesService.eliminar(id);
  }

  private convertirDatos(dto: CrearBroteDto | ActualizarBroteDto) {
    const datos = Object.assign({}, dto) as Record<string, unknown>;

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