import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { EnfermedadesService } from './enfermedades.service.js';
import { CrearEnfermedadDto } from './dto/crear-enfermedad.dto.js';
import { ActualizarEnfermedadDto } from './dto/actualizar-enfermedad.dto.js';

@ApiTags('Enfermedades')
@Controller('enfermedades')
export class EnfermedadesController {
  constructor(
    private readonly enfermedadesService: EnfermedadesService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Listar todas las enfermedades' })
  @ApiResponse({
    status: 200,
    description: 'Lista de enfermedades.',
  })
  listar() {
    return this.enfermedadesService.listar();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Consultar una enfermedad por su identificador' })
  @ApiResponse({
    status: 200,
    description: 'Datos de la enfermedad.',
  })
  @ApiResponse({
    status: 400,
    description: 'El identificador es inválido.',
  })
  @ApiResponse({
    status: 404,
    description: 'La enfermedad no existe.',
  })
  obtenerPorId(@Param('id', ParseIntPipe) id: number) {
    return this.enfermedadesService.obtenerPorId(id);
  }

  @Get(':id/detalle')
  @ApiOperation({
    summary:
      'Consultar el detalle de una enfermedad con su patógeno y sus tratamientos',
  })
  @ApiResponse({
    status: 200,
    description:
      'Enfermedad junto con su patógeno asociado y la lista de tratamientos.',
  })
  @ApiResponse({
    status: 400,
    description: 'El identificador es inválido.',
  })
  @ApiResponse({
    status: 404,
    description: 'La enfermedad no existe.',
  })
  obtenerDetalle(@Param('id', ParseIntPipe) id: number) {
    return this.enfermedadesService.obtenerDetalle(id);
  }

  @Post()
  @ApiOperation({ summary: 'Registrar una enfermedad' })
  @ApiResponse({
    status: 201,
    description: 'Enfermedad creada correctamente.',
  })
  @ApiResponse({
    status: 400,
    description: 'Datos inválidos o patógeno inexistente.',
  })
  crear(@Body() dto: CrearEnfermedadDto) {
    return this.enfermedadesService.crear(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar una enfermedad' })
  @ApiResponse({
    status: 200,
    description: 'Enfermedad actualizada correctamente.',
  })
  @ApiResponse({
    status: 400,
    description: 'Datos inválidos o patógeno inexistente.',
  })
  @ApiResponse({
    status: 404,
    description: 'La enfermedad no existe.',
  })
  actualizar(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ActualizarEnfermedadDto,
  ) {
    return this.enfermedadesService.actualizar(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar una enfermedad' })
  @ApiResponse({
    status: 200,
    description: 'Enfermedad eliminada correctamente.',
  })
  @ApiResponse({
    status: 400,
    description: 'No se puede eliminar si tiene registros asociados.',
  })
  @ApiResponse({
    status: 404,
    description: 'La enfermedad no existe.',
  })
  eliminar(@Param('id', ParseIntPipe) id: number) {
    return this.enfermedadesService.eliminar(id);
  }
}