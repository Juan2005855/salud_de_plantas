
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DataSource } from 'typeorm';

import { validarSecuenciaAdn } from '../comun/validadores/validador-secuencia-adn.js';
import { CrearCultivoDto } from './dto/crear-cultivo.dto.js';
import { ActualizarCultivoDto } from './dto/actualizar-cultivo.dto.js';
import { FiltrarCultivoDto } from './dto/filtrar-cultivo.dto.js';

@Injectable()
export class CultivosService {
  constructor(private readonly dataSource: DataSource) {}

  private validarId(id: number): void {
    if (!Number.isInteger(id) || id <= 0) {
      throw new BadRequestException(
        'El identificador debe ser un entero mayor que cero.',
      );
    }
  }

  private validarTexto(valor: unknown, campo: string): void {
    if (typeof valor !== 'string' || valor.trim().length === 0) {
      throw new BadRequestException(
        `El campo ${campo} es obligatorio.`,
      );
    }
  }

  private validarFecha(fecha: string): void {
    if (
      typeof fecha !== 'string' ||
      !/^\d{4}-\d{2}-\d{2}$/.test(fecha)
    ) {
      throw new BadRequestException(
        'La fecha de siembra debe tener el formato YYYY-MM-DD.',
      );
    }

    const fechaComprobada = new Date(`${fecha}T00:00:00.000Z`);

    if (
      Number.isNaN(fechaComprobada.getTime()) ||
      fechaComprobada.toISOString().slice(0, 10) !== fecha
    ) {
      throw new BadRequestException(
        'La fecha de siembra no es válida.',
      );
    }

    const hoy = new Date().toISOString().slice(0, 10);

    if (fecha > hoy) {
      throw new BadRequestException(
        'La fecha de siembra no puede ser futura.',
      );
    }
  }

  private validarAdn(secuencia: string): void {
    if (!validarSecuenciaAdn(secuencia)) {
      throw new BadRequestException(
        'El código genético debe contener únicamente las letras A, C, G y T en mayúsculas, y no puede estar vacío.',
      );
    }
  }

  private async comprobarPlanta(plantaId: number): Promise<void> {
    this.validarId(plantaId);

    const plantas = await this.dataSource.query(
      'SELECT id FROM plantas WHERE id = ?',
      [plantaId],
    );

    if (plantas.length === 0) {
      throw new BadRequestException(
        `No existe la planta con identificador ${plantaId}.`,
      );
    }
  }

  private normalizarFecha(fecha: unknown): string {
    if (fecha instanceof Date) {
      return fecha.toISOString().slice(0, 10);
    }

    return String(fecha).slice(0, 10);
  }

  async listar(filtros: FiltrarCultivoDto = {}) {
    const condiciones: string[] = [];
    const parametros: unknown[] = [];

    if (filtros.plantaId !== undefined) {
      const plantaId = Number(filtros.plantaId);
      this.validarId(plantaId);

      condiciones.push('plantaId = ?');
      parametros.push(plantaId);
    }

    if (filtros.region !== undefined) {
      this.validarTexto(filtros.region, 'region');

      condiciones.push('region = ?');
      parametros.push(filtros.region.trim());
    }

    if (filtros.fechaDesde !== undefined) {
      this.validarFecha(filtros.fechaDesde);

      condiciones.push('fechaSiembra >= ?');
      parametros.push(filtros.fechaDesde);
    }

    if (filtros.fechaHasta !== undefined) {
      this.validarFecha(filtros.fechaHasta);

      condiciones.push('fechaSiembra <= ?');
      parametros.push(filtros.fechaHasta);
    }

    if (
      filtros.fechaDesde &&
      filtros.fechaHasta &&
      filtros.fechaDesde > filtros.fechaHasta
    ) {
      throw new BadRequestException(
        'La fechaDesde no puede ser posterior a fechaHasta.',
      );
    }

    const where =
      condiciones.length > 0
        ? `WHERE ${condiciones.join(' AND ')}`
        : '';

    return this.dataSource.query(
      `SELECT id, plantaId, lote, region, fechaSiembra,
              codigoGeneticoSemilla
       FROM cultivos
       ${where}
       ORDER BY id`,
      parametros,
    );
  }

  async obtenerPorId(id: number) {
    this.validarId(id);

    const cultivos = await this.dataSource.query(
      `SELECT id, plantaId, lote, region, fechaSiembra,
              codigoGeneticoSemilla
       FROM cultivos
       WHERE id = ?`,
      [id],
    );

    if (cultivos.length === 0) {
      throw new NotFoundException(
        `No existe el cultivo con identificador ${id}.`,
      );
    }

    return cultivos[0];
  }

  async crear(dto: CrearCultivoDto) {
    await this.comprobarPlanta(Number(dto.plantaId));
    this.validarTexto(dto.lote, 'lote');
    this.validarTexto(dto.region, 'region');
    this.validarFecha(dto.fechaSiembra);
    this.validarAdn(dto.codigoGeneticoSemilla);

    const resultado = await this.dataSource.query(
      `INSERT INTO cultivos
       (plantaId, lote, region, fechaSiembra, codigoGeneticoSemilla)
       VALUES (?, ?, ?, ?, ?)`,
      [
        Number(dto.plantaId),
        dto.lote.trim(),
        dto.region.trim(),
        dto.fechaSiembra,
        dto.codigoGeneticoSemilla,
      ],
    );

    return this.obtenerPorId(Number(resultado.insertId));
  }

  async actualizar(id: number, dto: ActualizarCultivoDto) {
    this.validarId(id);

    const cultivo = await this.obtenerPorId(id);

    const plantaId =
      dto.plantaId === undefined
        ? Number(cultivo.plantaId)
        : Number(dto.plantaId);

    const lote = dto.lote ?? cultivo.lote;
    const region = dto.region ?? cultivo.region;

    const fechaSiembra =
      dto.fechaSiembra ?? this.normalizarFecha(cultivo.fechaSiembra);

    const codigoGeneticoSemilla =
      dto.codigoGeneticoSemilla ?? cultivo.codigoGeneticoSemilla;

    await this.comprobarPlanta(plantaId);
    this.validarTexto(lote, 'lote');
    this.validarTexto(region, 'region');
    this.validarFecha(fechaSiembra);
    this.validarAdn(codigoGeneticoSemilla);

    await this.dataSource.query(
      `UPDATE cultivos
       SET plantaId = ?, lote = ?, region = ?, fechaSiembra = ?,
           codigoGeneticoSemilla = ?
       WHERE id = ?`,
      [
        plantaId,
        lote.trim(),
        region.trim(),
        fechaSiembra,
        codigoGeneticoSemilla,
        id,
      ],
    );

    return this.obtenerPorId(id);
  }

  async eliminar(id: number) {
    this.validarId(id);
    await this.obtenerPorId(id);

    await this.dataSource.query(
      'DELETE FROM cultivos WHERE id = ?',
      [id],
    );

    return {
      mensaje: `El cultivo ${id} fue eliminado correctamente.`,
    };
  }

  // Compara el ADN de la semilla con la secuencia de referencia de la planta.
  async calcularMutaciones(id: number) {
    this.validarId(id);

    const cultivo = await this.obtenerPorId(id);

    const plantas = await this.dataSource.query(
      `SELECT id, nombreComun, nombreCientifico, secuenciaGenetica
       FROM plantas
       WHERE id = ?`,
      [Number(cultivo.plantaId)],
    );

    if (plantas.length === 0) {
      throw new NotFoundException(
        `No existe la planta con identificador ${cultivo.plantaId}.`,
      );
    }

    const planta = plantas[0];
    const secuenciaReferencia: string = planta.secuenciaGenetica;
    const secuenciaSemilla: string = cultivo.codigoGeneticoSemilla;

    if (
      !validarSecuenciaAdn(secuenciaReferencia) ||
      !validarSecuenciaAdn(secuenciaSemilla)
    ) {
      throw new BadRequestException(
        'Las secuencias de ADN deben contener únicamente A, C, G y T en mayúsculas, y no pueden estar vacías.',
      );
    }

    if (secuenciaReferencia.length !== secuenciaSemilla.length) {
      throw new BadRequestException(
        `Las secuencias tienen longitudes diferentes: referencia ${secuenciaReferencia.length}, semilla ${secuenciaSemilla.length}. No es posible calcular las mutaciones.`,
      );
    }

    const posicionesMutadas: number[] = [];

    for (let i = 0; i < secuenciaReferencia.length; i++) {
      if (secuenciaReferencia[i] !== secuenciaSemilla[i]) {
        posicionesMutadas.push(i + 1);
      }
    }

    return {
      cultivoId: Number(cultivo.id),
      plantaId: Number(cultivo.plantaId),
      nombreComun: planta.nombreComun,
      nombreCientifico: planta.nombreCientifico,
      longitudSecuencia: secuenciaReferencia.length,
      totalMutaciones: posicionesMutadas.length,
      posicionesMutadas,
    };
  }
}
