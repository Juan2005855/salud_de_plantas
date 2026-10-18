import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import type { FindOptionsWhere } from 'typeorm';
import { PlantasServiceInterface } from './plantas-service-interface.js';
import { CrearPlantaInDto } from './dto/crear-planta-in-dto.js';
import { CrearPlantaOutDto } from './dto/crear-planta-out-dto.js';
import { ActualizarPlantaInDto } from './dto/actualizar-planta-in-dto.js';
import { FiltrarPlantasInDto } from './dto/filtrar-plantas-in-dto.js';
import { ObtenerPlantaOutDto } from './dto/obtener-planta-out-dto.js';
import { ObtenerPlantasOutDto } from './dto/obtener-plantas-out-dto.js';
import { Planta } from './planta.entity.js';
import { Cultivo } from '../cultivos/cultivo.entity.js';
import { TIPOS_CULTIVO } from '../comun/constantes/valores-permitidos.js';
import { patronContiene } from '../comun/consultas/condiciones.js';
import { validarSecuenciaAdn } from '../comun/validadores/validador-secuencia-adn.js';
import {
    validarCuerpo,
    validarFiltroOpcion,
    validarFiltroTexto,
    validarOpcion,
    validarTexto,
} from '../comun/validadores/validaciones.js';

@Injectable()
export class PlantasService implements PlantasServiceInterface {
    constructor(
        @InjectRepository(Planta)
        private readonly repositorioPlantas: Repository<Planta>,
        @InjectRepository(Cultivo)
        private readonly repositorioCultivos: Repository<Cultivo>,
    ) {}

    async crearPlanta(crearPlantaInDTO: CrearPlantaInDto): Promise<CrearPlantaOutDto> {
        const datos = this.validarDatos(crearPlantaInDTO);
        await this.validarNombreCientificoUnico(datos.nombreCientifico);
        const planta = this.repositorioPlantas.create(datos);
        try {
            const plantaCreada = await this.repositorioPlantas.save(planta);
            return this.mapear(plantaCreada);
        } catch (error) {
            this.lanzarSiEsDuplicado(error, datos.nombreCientifico);
            throw error;
        }
    }

    async obtenerPlanta(plantaId: number): Promise<ObtenerPlantaOutDto> {
        const planta = await this.buscarPlanta(plantaId);
        return this.mapear(planta);
    }

    async obtenerPlantas(filtros: FiltrarPlantasInDto): Promise<ObtenerPlantasOutDto> {
        const nombre = validarFiltroTexto(filtros.nombre, 'nombre');
        const familiaBotanica = validarFiltroTexto(filtros.familiaBotanica, 'familiaBotanica');
        const tipoCultivo = validarFiltroOpcion(filtros.tipoCultivo, 'tipoCultivo', TIPOS_CULTIVO);

        const base: FindOptionsWhere<Planta> = {};
        if (familiaBotanica !== undefined) base.familiaBotanica = familiaBotanica;
        if (tipoCultivo !== undefined) base.tipoCultivo = tipoCultivo;
        const donde: FindOptionsWhere<Planta> | FindOptionsWhere<Planta>[] =
            nombre !== undefined
                ? [
                      { ...base, nombreComun: Like(patronContiene(nombre)) },
                      { ...base, nombreCientifico: Like(patronContiene(nombre)) },
                  ]
                : base;

        const plantas = await this.repositorioPlantas.find({ where: donde, order: { id: 'ASC' } });
        return { plantas: plantas.map((planta) => this.mapear(planta)) };
    }

    async actualizarPlanta(plantaId: number, actualizarPlantaInDTO: ActualizarPlantaInDto): Promise<boolean> {
        const datos = this.validarDatos(actualizarPlantaInDTO);
        await this.buscarPlanta(plantaId);
        await this.validarNombreCientificoUnico(datos.nombreCientifico, plantaId);
        try {
            await this.repositorioPlantas.update({ id: plantaId }, datos);
        } catch (error) {
            this.lanzarSiEsDuplicado(error, datos.nombreCientifico);
            throw error;
        }
        return true;
    }

    async eliminarPlanta(plantaId: number): Promise<boolean> {
        await this.buscarPlanta(plantaId);
        const cultivos = await this.repositorioCultivos.countBy({ plantaId });
        const susceptibilidades = await this.contarDependientes('susceptibilidades', plantaId);
        const brotes = await this.contarDependientes('brotes', plantaId);
        if (cultivos > 0 || susceptibilidades > 0 || brotes > 0) {
            throw new ConflictException(
                `No se puede eliminar la planta con id ${plantaId} porque tiene ${susceptibilidades} susceptibilidades, ${cultivos} cultivos y ${brotes} brotes asociados`,
            );
        }
        await this.repositorioPlantas.delete({ id: plantaId });
        return true;
    }

    private validarDatos(dto: unknown) {
        const cuerpo = validarCuerpo(dto);
        return {
            nombreComun: validarTexto(cuerpo.nombreComun, 'nombreComun', 100),
            nombreCientifico: validarTexto(cuerpo.nombreCientifico, 'nombreCientifico', 150),
            familiaBotanica: validarTexto(cuerpo.familiaBotanica, 'familiaBotanica', 100),
            tipoCultivo: validarOpcion(cuerpo.tipoCultivo, 'tipoCultivo', TIPOS_CULTIVO),
            secuenciaGenetica: validarSecuenciaAdn(cuerpo.secuenciaGenetica, 'secuenciaGenetica'),
        };
    }

    private async buscarPlanta(plantaId: number): Promise<Planta> {
        const planta = await this.repositorioPlantas.findOneBy({ id: plantaId });
        if (!planta) {
            throw new NotFoundException(`No se encontro la planta con id ${plantaId}`);
        }
        return planta;
    }

    private async validarNombreCientificoUnico(nombreCientifico: string, plantaIdPropia?: number): Promise<void> {
        const existente = await this.repositorioPlantas.findOneBy({ nombreCientifico });
        if (existente && existente.id !== plantaIdPropia) {
            throw new ConflictException(`Ya existe una planta con el nombre cientifico "${nombreCientifico}"`);
        }
    }

    private lanzarSiEsDuplicado(error: unknown, nombreCientifico: string): void {
        const codigo = (error as { code?: string; driverError?: { code?: string } }) ?? {};
        if (codigo.code === 'ER_DUP_ENTRY' || codigo.driverError?.code === 'ER_DUP_ENTRY') {
            throw new ConflictException(`Ya existe una planta con el nombre cientifico "${nombreCientifico}"`);
        }
    }

    private async contarDependientes(tabla: 'susceptibilidades' | 'brotes', plantaId: number): Promise<number> {
        const filas = await this.repositorioPlantas.manager.query(
            `SELECT COUNT(*) AS total FROM ${tabla} WHERE plantaId = ?`,
            [plantaId],
        );
        return Number(filas[0].total);
    }

    private mapear(planta: Planta): ObtenerPlantaOutDto {
        return {
            id: planta.id,
            nombreComun: planta.nombreComun,
            nombreCientifico: planta.nombreCientifico,
            familiaBotanica: planta.familiaBotanica,
            tipoCultivo: planta.tipoCultivo,
            secuenciaGenetica: planta.secuenciaGenetica,
        };
    }
}