
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

import { TratamientosService } from './tratamientos.service.js';
import { CrearTratamientoDto } from './dto/crear-tratamiento.dto.js';
import { ActualizarTratamientoDto } from './dto/actualizar-tratamiento.dto.js';

@ApiTags('Tratamientos')
@Controller('treatments')
export class TratamientosController {
  constructor(
    private readonly tratamientosService: TratamientosService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Listar todos los tratamientos' })
  @ApiResponse({
    status: 200,
    description: 'Lista de tratamientos.',
  })
  listar() {
    return this.tratamientosService.listar();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Consultar un tratamiento por su identificador' })
  @ApiResponse({
    status: 200,
    description: 'Datos del tratamiento.',
  })
  @ApiResponse({
    status: 400,
    description: 'El identificador es inválido.',
  })
  @ApiResponse({
    status: 404,
    description: 'El tratamiento no existe.',
  })
  obtenerPorId(@Param('id', ParseIntPipe) id: number) {
    return this.tratamientosService.obtenerPorId(id);
  }

  @Post()
  @ApiOperation({ summary: 'Registrar un tratamiento' })
  @ApiResponse({
    status: 201,
    description: 'Tratamiento creado correctamente.',
  })
  @ApiResponse({
    status: 400,
    description: 'Datos inválidos o enfermedad inexistente.',
  })
  crear(@Body() dto: CrearTratamientoDto) {
    return this.tratamientosService.crear(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un tratamiento' })
  @ApiResponse({
    status: 200,
    description: 'Tratamiento actualizado correctamente.',
  })
  @ApiResponse({
    status: 400,
    description: 'Datos inválidos o enfermedad inexistente.',
  })
  @ApiResponse({
    status: 404,
    description: 'El tratamiento no existe.',
  })
  actualizar(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ActualizarTratamientoDto,
  ) {
    return this.tratamientosService.actualizar(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un tratamiento' })
  @ApiResponse({
    status: 200,
    description: 'Tratamiento eliminado correctamente.',
  })
  @ApiResponse({
    status: 400,
    description: 'El identificador es inválido.',
  })
  @ApiResponse({
    status: 404,
    description: 'El tratamiento no existe.',
  })
  eliminar(@Param('id', ParseIntPipe) id: number) {
    return this.tratamientosService.eliminar(id);
  }
}
