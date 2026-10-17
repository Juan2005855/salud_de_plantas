
import {
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

import { CultivosService } from './cultivos.service.js';
import { CrearCultivoDto } from './dto/crear-cultivo.dto.js';
import { ActualizarCultivoDto } from './dto/actualizar-cultivo.dto.js';
import { FiltrarCultivoDto } from './dto/filtrar-cultivo.dto.js';

@ApiTags('Cultivos')
@Controller('crops')
export class CultivosController {
  constructor(
    private readonly cultivosService: CultivosService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Listar y filtrar cultivos' })
  @ApiResponse({
    status: 200,
    description: 'Lista de cultivos.',
  })
  @ApiResponse({
    status: 400,
    description: 'Los filtros enviados son inválidos.',
  })
  listar(@Query() filtros: FiltrarCultivoDto) {
    return this.cultivosService.listar(filtros);
  }

  @Get(':id/mutations')
  @ApiOperation({
    summary: 'Calcular las mutaciones del ADN de un cultivo',
  })
  @ApiResponse({
    status: 200,
    description: 'Cantidad y posiciones de las mutaciones encontradas.',
  })
  @ApiResponse({
    status: 400,
    description: 'Las secuencias de ADN son inválidas o tienen longitudes diferentes.',
  })
  @ApiResponse({
    status: 404,
    description: 'El cultivo o su planta no existen.',
  })
  calcularMutaciones(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.cultivosService.calcularMutaciones(id);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Consultar un cultivo por su identificador',
  })
  @ApiResponse({
    status: 200,
    description: 'Datos del cultivo.',
  })
  @ApiResponse({
    status: 400,
    description: 'El identificador es inválido.',
  })
  @ApiResponse({
    status: 404,
    description: 'El cultivo no existe.',
  })
  obtenerPorId(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.cultivosService.obtenerPorId(id);
  }

  @Post()
  @ApiOperation({ summary: 'Registrar un cultivo' })
  @ApiResponse({
    status: 201,
    description: 'Cultivo creado correctamente.',
  })
  @ApiResponse({
    status: 400,
    description: 'Los datos enviados son inválidos o la planta no existe.',
  })
  crear(@Body() dto: CrearCultivoDto) {
    return this.cultivosService.crear(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un cultivo' })
  @ApiResponse({
    status: 200,
    description: 'Cultivo actualizado correctamente.',
  })
  @ApiResponse({
    status: 400,
    description: 'Los datos enviados son inválidos.',
  })
  @ApiResponse({
    status: 404,
    description: 'El cultivo no existe.',
  })
  actualizar(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ActualizarCultivoDto,
  ) {
    return this.cultivosService.actualizar(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un cultivo' })
  @ApiResponse({
    status: 200,
    description: 'Cultivo eliminado correctamente.',
  })
  @ApiResponse({
    status: 400,
    description: 'El identificador es inválido.',
  })
  @ApiResponse({
    status: 404,
    description: 'El cultivo no existe.',
  })
  eliminar(@Param('id', ParseIntPipe) id: number) {
    return this.cultivosService.eliminar(id);
  }
}
