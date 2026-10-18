import { Body, Controller, Delete, Get, Inject, Param, Post, Put, Query } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CULTIVOS_SERVICE } from './tokens.js';
import type { CultivosServiceInterface } from './cultivos-service-interface.js';
import { CrearCultivoInDto } from './dto/crear-cultivo-in-dto.js';
import { CrearCultivoOutDto } from './dto/crear-cultivo-out-dto.js';
import { ActualizarCultivoInDto } from './dto/actualizar-cultivo-in-dto.js';
import { ObtenerCultivoOutDto } from './dto/obtener-cultivo-out-dto.js';
import { ObtenerCultivosOutDto } from './dto/obtener-cultivos-out-dto.js';
import { validarIdParametro } from '../comun/validadores/validaciones.js';
import { VerificarMutacionesOutDto } from './dto/verificar-mutaciones-out-dto.js';

@ApiTags('cultivos')
@Controller('cultivos')
export class CultivosController {
    constructor(
        @Inject(CULTIVOS_SERVICE)
        private readonly cultivosService: CultivosServiceInterface
    ) {}

    @Post('')
    @ApiOperation({ summary: 'Registrar un cultivo' })
    @ApiBody({ type: CrearCultivoInDto })
    @ApiResponse({ status: 201, description: 'Cultivo creado', type: CrearCultivoOutDto })
    @ApiResponse({ status: 400, description: 'Datos invalidos, el mensaje indica cual campo y por que' })
    @ApiResponse({ status: 404, description: 'La planta indicada no existe' })
    crearCultivo(@Body() dto: CrearCultivoInDto) {
        return this.cultivosService.crearCultivo(dto);
    }

    @Get('')
    @ApiOperation({ summary: 'Listar cultivos con filtros opcionales' })
    @ApiQuery({ name: 'plantaId', required: false, description: 'Id de la planta' })
    @ApiQuery({ name: 'region', required: false, description: 'Region exacta' })
    @ApiQuery({ name: 'lote', required: false, description: 'Texto contenido en el lote' })
    @ApiQuery({ name: 'desde', required: false, description: 'Fecha de siembra minima (AAAA-MM-DD)' })
    @ApiQuery({ name: 'hasta', required: false, description: 'Fecha de siembra maxima (AAAA-MM-DD)' })
    @ApiResponse({ status: 200, type: ObtenerCultivosOutDto })
    @ApiResponse({ status: 400, description: 'Algun filtro tiene un valor invalido' })
    obtenerCultivos(@Query('plantaId') plantaId?: string, @Query('region') region?: string, @Query('lote') lote?: string, @Query('desde') desde?: string, @Query('hasta') hasta?: string) {
        return this.cultivosService.obtenerCultivos({ plantaId, region, lote, desde, hasta });
    }

    @Get(':id')
    @ApiOperation({ summary: 'Consultar un cultivo por id' })
    @ApiParam({ name: 'id', description: 'Identificador de cultivo', example: 1 })
    @ApiResponse({ status: 200, type: ObtenerCultivoOutDto })
    @ApiResponse({ status: 400, description: 'El id no es un entero positivo' })
    @ApiResponse({ status: 404, description: 'Cultivo no encontrado' })
    obtenerCultivo(@Param('id') id: string) {
        return this.cultivosService.obtenerCultivo(validarIdParametro(id, 'id'));
    }

    @Get(':id/verificacion-mutaciones')
    @ApiOperation({ summary: 'Contar mutaciones de la semilla del cultivo frente a la secuencia de referencia de su especie' })
    @ApiParam({ name: 'id', description: 'Identificador de cultivo', example: 1 })
    @ApiResponse({ status: 200, type: VerificarMutacionesOutDto })
    @ApiResponse({ status: 404, description: 'Cultivo no encontrado' })
    @ApiResponse({ status: 400, description: 'El id no es un entero positivo, o las secuencias tienen longitudes diferentes y no se pueden comparar' })
    verificarMutaciones(@Param('id') id: string) {
        return this.cultivosService.verificarMutaciones(validarIdParametro(id, 'id'));
    }

    @Put(':id')
    @ApiOperation({ summary: 'Actualizar un cultivo (se reemplazan todos los campos)' })
    @ApiParam({ name: 'id', description: 'Identificador de cultivo', example: 1 })
    @ApiBody({ type: ActualizarCultivoInDto })
    @ApiResponse({ status: 200, description: 'Actualizacion realizada', type: Boolean })
    @ApiResponse({ status: 400, description: 'Datos invalidos, el mensaje indica cual campo y por que' })
    @ApiResponse({ status: 404, description: 'Cultivo no encontrado, o la planta indicada no existe' })
    actualizarCultivo(@Param('id') id: string, @Body() dto: ActualizarCultivoInDto) {
        return this.cultivosService.actualizarCultivo(validarIdParametro(id, 'id'), dto);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Eliminar un cultivo' })
    @ApiParam({ name: 'id', description: 'Identificador de cultivo', example: 1 })
    @ApiResponse({ status: 200, description: 'Eliminacion realizada', type: Boolean })
    @ApiResponse({ status: 400, description: 'El id no es un entero positivo' })
    @ApiResponse({ status: 404, description: 'Cultivo no encontrado' })
    eliminarCultivo(@Param('id') id: string) {
        return this.cultivosService.eliminarCultivo(validarIdParametro(id, 'id'));
    }
}