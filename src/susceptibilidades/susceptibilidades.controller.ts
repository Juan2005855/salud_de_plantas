
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

import { SusceptibilidadesService } from './susceptibilidades.service.js';
import { CrearSusceptibilidadDto } from './dto/crear-susceptibilidad.dto.js';
import { ActualizarSusceptibilidadDto } from './dto/actualizar-susceptibilidad.dto.js';

@Controller('susceptibilities')
export class SusceptibilidadesController {
  constructor(
    private readonly susceptibilidadesService: SusceptibilidadesService,
  ) {}

  @Post()
  crear(@Body() datos: CrearSusceptibilidadDto) {
    return this.susceptibilidadesService.crear(datos);
  }

  @Get()
  consultarTodos() {
    return this.susceptibilidadesService.consultarTodos();
  }

  @Get(':id')
  consultarPorId(@Param('id', ParseIntPipe) id: number) {
    return this.susceptibilidadesService.consultarPorId(id);
  }

  @Patch(':id')
  actualizar(
    @Param('id', ParseIntPipe) id: number,
    @Body() datos: ActualizarSusceptibilidadDto,
  ) {
    return this.susceptibilidadesService.actualizar(id, datos);
  }

  @Delete(':id')
  eliminar(@Param('id', ParseIntPipe) id: number) {
    return this.susceptibilidadesService.eliminar(id);
  }
}
