import { Body, Controller, Delete, Get, Inject, Param, Post, Put, Query } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { PLANTAS_SERVICE } from './tokens.js';
import type { PlantasServiceInterface } from './plantas-service-interface.js';
import { CrearPlantaInDto } from './dto/crear-planta-in-dto.js';
import { CrearPlantaOutDto } from './dto/crear-planta-out-dto.js';
import { ActualizarPlantaInDto } from './dto/actualizar-planta-in-dto.js';
import { ObtenerPlantaOutDto } from './dto/obtener-planta-out-dto.js';
import { ObtenerPlantasOutDto } from './dto/obtener-plantas-out-dto.js';
import { validarIdParametro } from '../comun/validadores/validaciones.js';

@ApiTags('plantas')
@Controller('plantas')
export class PlantasController {
    constructor(
        @Inject(PLANTAS_SERVICE)
        private readonly plantasService: PlantasServiceInterface
    ) {}

    @Post('')
    @ApiOperation({ summary: 'Registrar una planta' })
    @ApiBody({ type: CrearPlantaInDto })
    @ApiResponse({ status: 201, description: 'Planta creada', type: CrearPlantaOutDto })
    @ApiResponse({ status: 400, description: 'Datos invalidos, el mensaje indica cual campo y por que' })
    @ApiResponse({ status: 409, description: 'Ya existe una planta con ese nombre cientifico' })
    crearPlanta(@Body() dto: CrearPlantaInDto) {
        return this.plantasService.crearPlanta(dto);
    }

    @Get('')
    @ApiOperation({ summary: 'Listar plantas con filtros opcionales' })
    @ApiQuery({ name: 'nombre', required: false, description: 'Texto contenido en el nombre comun o cientifico' })
    @ApiQuery({ name: 'familiaBotanica', required: false, description: 'Familia botanica exacta' })
    @ApiQuery({ name: 'tipoCultivo', required: false, description: 'Tipo de cultivo' })
    @ApiResponse({ status: 200, type: ObtenerPlantasOutDto })
    @ApiResponse({ status: 400, description: 'Algun filtro tiene un valor invalido' })
    obtenerPlantas(@Query('nombre') nombre?: string, @Query('familiaBotanica') familiaBotanica?: string, @Query('tipoCultivo') tipoCultivo?: string) {
        return this.plantasService.obtenerPlantas({ nombre, familiaBotanica, tipoCultivo });
    }

    @Get(':id')
    @ApiOperation({ summary: 'Consultar una planta por id' })
    @ApiParam({ name: 'id', description: 'Identificador de planta', example: 1 })
    @ApiResponse({ status: 200, type: ObtenerPlantaOutDto })
    @ApiResponse({ status: 400, description: 'El id no es un entero positivo' })
    @ApiResponse({ status: 404, description: 'Planta no encontrada' })
    obtenerPlanta(@Param('id') id: string) {
        return this.plantasService.obtenerPlanta(validarIdParametro(id, 'id'));
    }

    @Put(':id')
    @ApiOperation({ summary: 'Actualizar una planta (se reemplazan todos los campos)' })
    @ApiParam({ name: 'id', description: 'Identificador de planta', example: 1 })
    @ApiBody({ type: ActualizarPlantaInDto })
    @ApiResponse({ status: 200, description: 'Actualizacion realizada', type: Boolean })
    @ApiResponse({ status: 400, description: 'Datos invalidos, el mensaje indica cual campo y por que' })
    @ApiResponse({ status: 404, description: 'Planta no encontrada' })
    @ApiResponse({ status: 409, description: 'Ya existe una planta con ese nombre cientifico' })
    actualizarPlanta(@Param('id') id: string, @Body() dto: ActualizarPlantaInDto) {
        return this.plantasService.actualizarPlanta(validarIdParametro(id, 'id'), dto);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Eliminar una planta' })
    @ApiParam({ name: 'id', description: 'Identificador de planta', example: 1 })
    @ApiResponse({ status: 200, description: 'Eliminacion realizada', type: Boolean })
    @ApiResponse({ status: 400, description: 'El id no es un entero positivo' })
    @ApiResponse({ status: 404, description: 'Planta no encontrada' })
    @ApiResponse({ status: 409, description: 'La planta tiene susceptibilidades, cultivos o brotes asociados y no se puede eliminar' })
    eliminarPlanta(@Param('id') id: string) {
        return this.plantasService.eliminarPlanta(validarIdParametro(id, 'id'));
    }
}