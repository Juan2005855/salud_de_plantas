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

import { PatogenosService } from './patogenos.service.js';
import { CrearPatogenoDto } from './dto/crear-patogeno.dto.js';
import { ActualizarPatogenoDto } from './dto/actualizar-patogeno.dto.js';

@ApiTags('Patógenos')
@Controller('patogenos')
export class PatogenosController {
  constructor(
    private readonly patogenosService: PatogenosService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Listar todos los patógenos' })
  @ApiResponse({ status: 200, description: 'Lista de patógenos.' })
  listar() {
    return this.patogenosService.listar();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Consultar un patógeno por ID' })
  @ApiResponse({ status: 200, description: 'Patógeno encontrado.' })
  @ApiResponse({ status: 404, description: 'Patógeno no encontrado.' })
  obtenerPorId(@Param('id', ParseIntPipe) id: number) {
    return this.patogenosService.obtenerPorId(id);
  }

  @Post()
  @ApiOperation({ summary: 'Crear un patógeno' })
  @ApiResponse({ status: 201, description: 'Patógeno creado.' })
  @ApiResponse({ status: 400, description: 'Datos inválidos.' })
  @ApiResponse({ status: 409, description: 'Nombre científico duplicado.' })
  crear(@Body() dto: CrearPatogenoDto) {
    return this.patogenosService.crear(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un patógeno' })
  @ApiResponse({ status: 200, description: 'Patógeno actualizado.' })
  @ApiResponse({ status: 400, description: 'Datos inválidos.' })
  @ApiResponse({ status: 404, description: 'Patógeno no encontrado.' })
  actualizar(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ActualizarPatogenoDto,
  ) {
    return this.patogenosService.actualizar(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un patógeno' })
  @ApiResponse({ status: 200, description: 'Patógeno eliminado.' })
  @ApiResponse({ status: 400, description: 'Tiene enfermedades asociadas.' })
  @ApiResponse({ status: 404, description: 'Patógeno no encontrado.' })
  eliminar(@Param('id', ParseIntPipe) id: number) {
    return this.patogenosService.eliminar(id);
  }
}