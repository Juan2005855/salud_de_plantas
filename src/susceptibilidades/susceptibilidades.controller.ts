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

import { SusceptibilidadesService } from './susceptibilidades.service.js';
import { CrearSusceptibilidadDto } from './dto/crear-susceptibilidad.dto.js';
import { ActualizarSusceptibilidadDto } from './dto/actualizar-susceptibilidad.dto.js';

@ApiTags('Susceptibilidades')
@Controller('susceptibilidades')
export class SusceptibilidadesController {
  constructor(
    private readonly susceptibilidadesService: SusceptibilidadesService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Registrar una susceptibilidad' })
  @ApiResponse({
    status: 201,
    description: 'Susceptibilidad creada correctamente.',
  })
  @ApiResponse({
    status: 400,
    description:
      'Nivel inválido (debe ser baja, media o alta) o planta o enfermedad inexistente.',
  })
  @ApiResponse({
    status: 409,
    description:
      'Ya existe una susceptibilidad para esa planta y esa enfermedad.',
  })
  crear(@Body() datos: CrearSusceptibilidadDto) {
    return this.susceptibilidadesService.crear(datos);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todas las susceptibilidades' })
  @ApiResponse({
    status: 200,
    description: 'Lista de susceptibilidades.',
  })
  consultarTodos() {
    return this.susceptibilidadesService.consultarTodos();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Consultar una susceptibilidad por su identificador',
  })
  @ApiResponse({
    status: 200,
    description: 'Datos de la susceptibilidad.',
  })
  @ApiResponse({
    status: 400,
    description: 'El identificador es inválido.',
  })
  @ApiResponse({
    status: 404,
    description: 'La susceptibilidad no existe.',
  })
  consultarPorId(@Param('id', ParseIntPipe) id: number) {
    return this.susceptibilidadesService.consultarPorId(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar una susceptibilidad' })
  @ApiResponse({
    status: 200,
    description: 'Susceptibilidad actualizada correctamente.',
  })
  @ApiResponse({
    status: 400,
    description:
      'Nivel inválido o planta o enfermedad inexistente.',
  })
  @ApiResponse({
    status: 404,
    description: 'La susceptibilidad no existe.',
  })
  @ApiResponse({
    status: 409,
    description:
      'Ya existe otra susceptibilidad para esa planta y esa enfermedad.',
  })
  actualizar(
    @Param('id', ParseIntPipe) id: number,
    @Body() datos: ActualizarSusceptibilidadDto,
  ) {
    return this.susceptibilidadesService.actualizar(id, datos);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar una susceptibilidad' })
  @ApiResponse({
    status: 200,
    description: 'Susceptibilidad eliminada correctamente.',
  })
  @ApiResponse({
    status: 400,
    description: 'El identificador es inválido.',
  })
  @ApiResponse({
    status: 404,
    description: 'La susceptibilidad no existe.',
  })
  eliminar(@Param('id', ParseIntPipe) id: number) {
    return this.susceptibilidadesService.eliminar(id);
  }
}