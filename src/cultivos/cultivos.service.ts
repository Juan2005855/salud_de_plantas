import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import type { FindOptionsWhere } from 'typeorm';
import { CultivosServiceInterface } from './cultivos-service-interface.js';
import { CrearCultivoInDto } from './dto/crear-cultivo-in-dto.js';
import { CrearCultivoOutDto } from './dto/crear-cultivo-out-dto.js';
import { ActualizarCultivoInDto } from './dto/actualizar-cultivo-in-dto.js';
import { FiltrarCultivosInDto } from './dto/filtrar-cultivos-in-dto.js';
import { ObtenerCultivoOutDto } from './dto/obtener-cultivo-out-dto.js';
import { ObtenerCultivosOutDto } from './dto/obtener-cultivos-out-dto.js';
import { VerificarMutacionesOutDto } from './dto/verificar-mutaciones-out-dto.js';
import { Cultivo } from './cultivo.entity.js';
import { Planta } from '../plantas/planta.entity.js';
import { condicionRango, patronContiene } from '../comun/consultas/condiciones.js';
import {
    validarCuerpo,
    validarFechaNoFutura,
    validarFiltroFecha,
    validarFiltroId,
    validarFiltroTexto,
    validarIdCuerpo,
    validarRangoFechas,
    validarTexto,
} from '../comun/validadores/validaciones.js';
import { validarSecuenciaAdn } from '../comun/validadores/validador-secuencia-adn.js';

@Injectable()
export class CultivosService implements CultivosServiceInterface {
    constructor(
        @InjectRepository(Cultivo)
        private readonly repositorioCultivos: Repository<Cultivo>,
        @InjectRepository(Planta)
        private readonly repositorioPlantas: Repository<Planta>,
    ) {}

    async crearCultivo(crearCultivoInDTO: CrearCultivoInDto): Promise<CrearCultivoOutDto> {
        const datos = this.validarDatos(crearCultivoInDTO);
        await this.validarPlantaExiste(datos.plantaId);
        const cultivo = this.repositorioCultivos.create(datos);
        const cultivoCreado = await this.repositorioCultivos.save(cultivo);
        return this.mapear(cultivoCreado);
    }

    async obtenerCultivo(cultivoId: number): Promise<ObtenerCultivoOutDto> {
        const cultivo = await this.buscarCultivo(cultivoId);
        return this.mapear(cultivo);
    }

    async obtenerCultivos(filtros: FiltrarCultivosInDto): Promise<ObtenerCultivosOutDto> {
        const plantaId = validarFiltroId(filtros.plantaId, 'plantaId');
        const region = validarFiltroTexto(filtros.region, 'region');
        const lote = validarFiltroTexto(filtros.lote, 'lote');
        const desde = validarFiltroFecha(filtros.desde, 'desde');
        const hasta = validarFiltroFecha(filtros.hasta, 'hasta');
        validarRangoFechas(desde, hasta);

        const donde: FindOptionsWhere<Cultivo> = {};
        if (plantaId !== undefined) donde.plantaId = plantaId;
        if (region !== undefined) donde.region = region;
        if (lote !== undefined) donde.lote = Like(patronContiene(lote));
        const rango = condicionRango(desde, hasta);
        if (rango !== undefined) donde.fechaSiembra = rango;

        const cultivos = await this.repositorioCultivos.find({ where: donde, order: { id: 'ASC' } });
        return { cultivos: cultivos.map((cultivo) => this.mapear(cultivo)) };
    }

    async actualizarCultivo(cultivoId: number, actualizarCultivoInDTO: ActualizarCultivoInDto): Promise<boolean> {
        const datos = this.validarDatos(actualizarCultivoInDTO);
        await this.buscarCultivo(cultivoId);
        await this.validarPlantaExiste(datos.plantaId);
        await this.repositorioCultivos.update({ id: cultivoId }, datos);
        return true;
    }

    async eliminarCultivo(cultivoId: number): Promise<boolean> {
        await this.buscarCultivo(cultivoId);
        await this.repositorioCultivos.delete({ id: cultivoId });
        return true;
    }

    async verificarMutaciones(cultivoId: number): Promise<VerificarMutacionesOutDto> {
        const cultivo = await this.buscarCultivo(cultivoId);
        const planta = await this.repositorioPlantas.findOneBy({ id: cultivo.plantaId });
        if (!planta) {
            throw new NotFoundException(
                `No se encontro la planta con id ${cultivo.plantaId} a la que pertenece el cultivo ${cultivoId}`,
            );
        }
        const semilla = validarSecuenciaAdn(cultivo.codigoGeneticoSemilla, 'codigoGeneticoSemilla del cultivo');
        const referencia = validarSecuenciaAdn(planta.secuenciaGenetica, 'secuenciaGenetica de la planta');
        if (semilla.length !== referencia.length) {
            throw new BadRequestException(
                `No se pueden comparar las secuencias porque tienen longitudes diferentes: la semilla tiene ${semilla.length} letras y la referencia de la planta tiene ${referencia.length}`,
            );
        }
        const posicionesMutadas: number[] = [];
        for (let i = 0; i < semilla.length; i++) {
            if (semilla[i] !== referencia[i]) {
                posicionesMutadas.push(i + 1);
            }
        }
        return {
            cultivoId: cultivo.id,
            plantaId: planta.id,
            longitudSecuencia: semilla.length,
            totalMutaciones: posicionesMutadas.length,
            posicionesMutadas,
        };
    }

    private validarDatos(dto: unknown) {
        const cuerpo = validarCuerpo(dto);
        return {
            plantaId: validarIdCuerpo(cuerpo.plantaId, 'plantaId'),
            lote: validarTexto(cuerpo.lote, 'lote', 100),
            region: validarTexto(cuerpo.region, 'region', 100),
            fechaSiembra: validarFechaNoFutura(cuerpo.fechaSiembra, 'fechaSiembra'),
            codigoGeneticoSemilla: validarSecuenciaAdn(cuerpo.codigoGeneticoSemilla, 'codigoGeneticoSemilla'),
        };
    }

    private async buscarCultivo(cultivoId: number): Promise<Cultivo> {
        const cultivo = await this.repositorioCultivos.findOneBy({ id: cultivoId });
        if (!cultivo) {
            throw new NotFoundException(`No se encontro el cultivo con id ${cultivoId}`);
        }
        return cultivo;
    }

    private async validarPlantaExiste(plantaId: number): Promise<void> {
        if (!(await this.repositorioPlantas.existsBy({ id: plantaId }))) {
            throw new NotFoundException(`No se encontro la planta con id ${plantaId}`);
        }
    }

    private mapear(cultivo: Cultivo): ObtenerCultivoOutDto {
        return {
            id: cultivo.id,
            plantaId: cultivo.plantaId,
            lote: cultivo.lote,
            region: cultivo.region,
            fechaSiembra: cultivo.fechaSiembra,
            codigoGeneticoSemilla: cultivo.codigoGeneticoSemilla,
        };
    }
}