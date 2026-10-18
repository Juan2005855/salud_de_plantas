
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

import { PlantasService } from './plantas.service.js';
import { CrearPlantaDto } from './dto/crear-planta.dto.js';
import { ActualizarPlantaDto } from './dto/actualizar-planta.dto.js';
import { FiltrarPlantaDto } from './dto/filtrar-planta.dto.js';

@ApiTags('Plantas')
@Controller('plants')
export class PlantasController {
  constructor(private readonly plantasService: PlantasService) {}

  @Get()
  @ApiOperation({ summary: 'Listar y filtrar plantas' })
  @ApiResponse({ status: 200, description: 'Lista de plantas.' })
  @ApiResponse({ status: 400, description: 'Filtros inválidos.' })
  obtenerTodas(@Query() filtros: FiltrarPlantaDto) {
    return this.plantasService.obtenerTodas(filtros);
  }

  @Get(':id/diseases')
  @ApiOperation({ summary: 'Consultar las enfermedades de una planta' })
  @ApiResponse({ status: 200, description: 'Enfermedades y susceptibilidades de la planta.' })
  @ApiResponse({ status: 400, description: 'Identificador inválido.' })
  @ApiResponse({ status: 404, description: 'La planta no existe.' })
  obtenerEnfermedades(@Param('id', ParseIntPipe) id: number) {
    return this.plantasService.obtenerEnfermedades(id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Consultar una planta por su identificador' })
  @ApiResponse({ status: 200, description: 'Datos de la planta.' })
  @ApiResponse({ status: 400, description: 'Identificador inválido.' })
  @ApiResponse({ status: 404, description: 'La planta no existe.' })
  obtenerPorId(@Param('id', ParseIntPipe) id: number) {
    return this.plantasService.obtenerPorId(id);
  }

  @Post()
  @ApiOperation({ summary: 'Registrar una planta' })
  @ApiResponse({ status: 201, description: 'Planta creada correctamente.' })
  @ApiResponse({ status: 400, description: 'Datos inválidos.' })
  @ApiResponse({ status: 409, description: 'El nombre científico ya existe.' })
  crear(@Body() dto: CrearPlantaDto) {
    return this.plantasService.crear(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar una planta' })
  @ApiResponse({ status: 200, description: 'Planta actualizada correctamente.' })
  @ApiResponse({ status: 400, description: 'Datos inválidos.' })
  @ApiResponse({ status: 404, description: 'La planta no existe.' })
  actualizar(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ActualizarPlantaDto,
  ) {
    return this.plantasService.actualizar(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar una planta' })
  @ApiResponse({ status: 200, description: 'Planta eliminada correctamente.' })
  @ApiResponse({ status: 400, description: 'No se puede eliminar por registros asociados.' })
  @ApiResponse({ status: 404, description: 'La planta no existe.' })
  eliminar(@Param('id', ParseIntPipe) id: number) {
    return this.plantasService.eliminar(id);
  }
}
