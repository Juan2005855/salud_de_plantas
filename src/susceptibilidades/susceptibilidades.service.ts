import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';

import { Susceptibilidad } from './susceptibilidad.entity.js';
import { CrearSusceptibilidadDto } from './dto/crear-susceptibilidad.dto.js';
import { ActualizarSusceptibilidadDto } from './dto/actualizar-susceptibilidad.dto.js';

@Injectable()
export class SusceptibilidadesService {
  constructor(
    @InjectRepository(Susceptibilidad)
    private readonly repositorio: Repository<Susceptibilidad>,
    private readonly dataSource: DataSource,
  ) {}

  private validarNivel(nivel: string): void {
    const nivelesPermitidos = ['baja', 'media', 'alta'];

    if (!nivelesPermitidos.includes(nivel)) {
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
    plantaId: number,
    enfermedadId: number,
  ): Promise<void> {
    const plantas: Array<{ id: number }> =
      await this.dataSource.query(
        'SELECT id FROM plantas WHERE id = ?',
        [plantaId],
      );

    if (plantas.length === 0) {
      throw new BadRequestException(
        `No existe una planta con ID ${plantaId}.`,
      );
    }

    const enfermedades: Array<{ id: number }> =
      await this.dataSource.query(
        'SELECT id FROM enfermedades WHERE id = ?',
        [enfermedadId],
      );

    if (enfermedades.length === 0) {
      throw new BadRequestException(
        `No existe una enfermedad con ID ${enfermedadId}.`,
      );
    }
  }

  async crear(
    datos: CrearSusceptibilidadDto,
  ): Promise<Susceptibilidad> {
    this.validarId(datos.plantaId, 'plantaId');
    this.validarId(datos.enfermedadId, 'enfermedadId');
    this.validarNivel(datos.nivel);

    await this.validarReferencias(
      datos.plantaId,
      datos.enfermedadId,
    );

    const existente = await this.repositorio.findOne({
      where: {
        plantaId: datos.plantaId,
        enfermedadId: datos.enfermedadId,
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

  async consultarTodos(): Promise<Susceptibilidad[]> {
    return this.repositorio.find();
  }

  async consultarPorId(id: number): Promise<Susceptibilidad> {
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
  ): Promise<Susceptibilidad> {
    const actual = await this.consultarPorId(id);

    const plantaId = datos.plantaId ?? actual.plantaId;
    const enfermedadId = datos.enfermedadId ?? actual.enfermedadId;
    const nivel = datos.nivel ?? actual.nivel;

    this.validarId(plantaId, 'plantaId');
    this.validarId(enfermedadId, 'enfermedadId');
    this.validarNivel(nivel);

    await this.validarReferencias(plantaId, enfermedadId);

    const duplicada = await this.repositorio.findOne({
      where: { plantaId, enfermedadId },
    });

    if (duplicada && duplicada.id !== id) {
      throw new ConflictException(
        'Ya existe otra susceptibilidad para esta planta y enfermedad.',
      );
    }

    actual.plantaId = plantaId;
    actual.enfermedadId = enfermedadId;
    actual.nivel = nivel;

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