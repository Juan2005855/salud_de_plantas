
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';

import { Susceptibility } from './susceptibilidad.entity.js';
import { CrearSusceptibilidadDto } from './dto/crear-susceptibilidad.dto.js';
import { ActualizarSusceptibilidadDto } from './dto/actualizar-susceptibilidad.dto.js';

@Injectable()
export class SusceptibilidadesService {
  constructor(
    @InjectRepository(Susceptibility)
    private readonly repositorio: Repository<Susceptibility>,
    private readonly dataSource: DataSource,
  ) {}

  private validarNivel(level: string): void {
    const nivelesPermitidos = ['baja', 'media', 'alta'];

    if (!nivelesPermitidos.includes(level)) {
      throw new BadRequestException(
        'El nivel debe ser baja, media o alta.',
      );
    }
  }

  private validarId(id: number, campo: string): void {
    if (!Number.isInteger(id) || id <= 0) {
      throw new BadRequestException(
        `El campo ${campo} debe ser un número entero mayor que cero.`,
      );
    }
  }

  private async validarReferencias(
    plantId: number,
    diseaseId: number,
  ): Promise<void> {
    const plantas: Array<{ id: number }> =
      await this.dataSource.query(
        'SELECT id FROM plantas WHERE id = ?',
        [plantId],
      );

    if (plantas.length === 0) {
      throw new BadRequestException(
        `No existe una planta con ID ${plantId}.`,
      );
    }

    const enfermedades: Array<{ id: number }> =
      await this.dataSource.query(
        'SELECT id FROM enfermedades WHERE id = ?',
        [diseaseId],
      );

    if (enfermedades.length === 0) {
      throw new BadRequestException(
        `No existe una enfermedad con ID ${diseaseId}.`,
      );
    }
  }

  async crear(
    datos: CrearSusceptibilidadDto,
  ): Promise<Susceptibility> {
    this.validarId(datos.plantId, 'plantId');
    this.validarId(datos.diseaseId, 'diseaseId');
    this.validarNivel(datos.level);

    await this.validarReferencias(
      datos.plantId,
      datos.diseaseId,
    );

    const existente = await this.repositorio.findOne({
      where: {
        plantId: datos.plantId,
        diseaseId: datos.diseaseId,
      },
    });

    if (existente) {
      throw new ConflictException(
        'Ya existe una susceptibilidad para esta planta y enfermedad.',
      );
    }

    const susceptibilidad = this.repositorio.create(datos);

    try {
      return await this.repositorio.save(susceptibilidad);
    } catch (error: unknown) {
      if (this.esDuplicado(error)) {
        throw new ConflictException(
          'Ya existe una susceptibilidad para esta planta y enfermedad.',
        );
      }

      throw error;
    }
  }

  async consultarTodos(): Promise<Susceptibility[]> {
    return this.repositorio.find();
  }

  async consultarPorId(id: number): Promise<Susceptibility> {
    this.validarId(id, 'id');

    const susceptibilidad = await this.repositorio.findOne({
      where: { id },
    });

    if (!susceptibilidad) {
      throw new NotFoundException(
        `No existe la susceptibilidad con ID ${id}.`,
      );
    }

    return susceptibilidad;
  }

  async actualizar(
    id: number,
    datos: ActualizarSusceptibilidadDto,
  ): Promise<Susceptibility> {
    const actual = await this.consultarPorId(id);

    const plantId = datos.plantId ?? actual.plantId;
    const diseaseId = datos.diseaseId ?? actual.diseaseId;
    const level = datos.level ?? actual.level;

    this.validarId(plantId, 'plantId');
    this.validarId(diseaseId, 'diseaseId');
    this.validarNivel(level);

    await this.validarReferencias(plantId, diseaseId);

    const duplicada = await this.repositorio.findOne({
      where: { plantId, diseaseId },
    });

    if (duplicada && duplicada.id !== id) {
      throw new ConflictException(
        'Ya existe otra susceptibilidad para esta planta y enfermedad.',
      );
    }

    actual.plantId = plantId;
    actual.diseaseId = diseaseId;
    actual.level = level;

    try {
      return await this.repositorio.save(actual);
    } catch (error: unknown) {
      if (this.esDuplicado(error)) {
        throw new ConflictException(
          'Ya existe otra susceptibilidad para esta planta y enfermedad.',
        );
      }

      throw error;
    }
  }

  async eliminar(id: number): Promise<{ mensaje: string }> {
    const susceptibilidad = await this.consultarPorId(id);

    await this.repositorio.remove(susceptibilidad);

    return {
      mensaje: 'Susceptibilidad eliminada correctamente.',
    };
  }

  private esDuplicado(error: unknown): boolean {
    if (
      typeof error === 'object' &&
      error !== null &&
      'code' in error
    ) {
      const codigo = (error as { code?: string }).code;

      return codigo === 'ER_DUP_ENTRY';
    }

    return false;
  }
}
