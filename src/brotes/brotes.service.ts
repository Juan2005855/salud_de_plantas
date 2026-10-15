import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DataSource } from 'typeorm';

interface DatosBrote {
  plantaId?: number;
  enfermedadId?: number;
  fecha?: string;
  region?: string;
  hectareasAfectadas?: number;
}

interface FilaBrote {
  id: number | string;
  plantaId: number | string;
  enfermedadId: number | string;
  fecha: string | Date;
  region: string;
  hectareasAfectadas: string | number;
}

@Injectable()
export class BrotesService {
  constructor(private readonly dataSource: DataSource) {}

  async obtenerResumen() {
    const resultado: Array<{
      totalBrotes: number;
      hectareasAfectadas: string | number;
    }> = await this.dataSource.query(`
      SELECT
        COUNT(*) AS totalBrotes,
        COALESCE(SUM(hectareasAfectadas), 0) AS hectareasAfectadas
      FROM brotes
    `);

    const porRegion: Array<{
      region: string;
      totalBrotes: number;
      hectareasAfectadas: string | number;
    }> = await this.dataSource.query(`
      SELECT
        region,
        COUNT(*) AS totalBrotes,
        COALESCE(SUM(hectareasAfectadas), 0) AS hectareasAfectadas
      FROM brotes
      GROUP BY region
      ORDER BY region
    `);

    return {
      totalBrotes: Number(resultado[0].totalBrotes),
      hectareasAfectadas: Number(resultado[0].hectareasAfectadas),
      porRegion: porRegion.map((item) => ({
        region: item.region,
        totalBrotes: Number(item.totalBrotes),
        hectareasAfectadas: Number(item.hectareasAfectadas),
      })),
    };
  }

  async obtenerFiltrados(filtros: {
    region?: string;
    fechaDesde?: string;
    fechaHasta?: string;
    plantaId?: string;
    enfermedadId?: string;
  }) {
    const condiciones: string[] = [];
    const parametros: (string | number)[] = [];

    if (filtros.region?.trim()) {
      condiciones.push('region = ?');
      parametros.push(filtros.region.trim());
    }

    if (filtros.fechaDesde) {
      this.validarFecha(filtros.fechaDesde, 'fechaDesde');
      condiciones.push('fecha >= ?');
      parametros.push(filtros.fechaDesde);
    }

    if (filtros.fechaHasta) {
      this.validarFecha(filtros.fechaHasta, 'fechaHasta');
      condiciones.push('fecha <= ?');
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

    if (filtros.plantaId !== undefined && filtros.plantaId !== '') {
      const plantaId = Number(filtros.plantaId);

      this.validarId(plantaId, 'plantaId');
      condiciones.push('plantaId = ?');
      parametros.push(plantaId);
    }

    if (
      filtros.enfermedadId !== undefined &&
      filtros.enfermedadId !== ''
    ) {
      const enfermedadId = Number(filtros.enfermedadId);

      this.validarId(enfermedadId, 'enfermedadId');
      condiciones.push('enfermedadId = ?');
      parametros.push(enfermedadId);
    }

    let consulta = `
      SELECT
        id, plantaId, enfermedadId, fecha, region, hectareasAfectadas
      FROM brotes
    `;

    if (condiciones.length > 0) {
      consulta += ` WHERE ${condiciones.join(' AND ')}`;
    }

    consulta += ' ORDER BY fecha DESC, id DESC';

    const filas: FilaBrote[] = await this.dataSource.query(
      consulta,
      parametros,
    );

    return filas.map((fila) => this.formatearBrote(fila));
  }

  async obtenerPorId(id: number) {
    this.validarId(id, 'id');

    const filas: FilaBrote[] = await this.dataSource.query(
      `SELECT id, plantaId, enfermedadId, fecha, region, hectareasAfectadas
       FROM brotes
       WHERE id = ?`,
      [id],
    );

    if (filas.length === 0) {
      throw new NotFoundException(`No existe un brote con id ${id}.`);
    }

    return this.formatearBrote(filas[0]);
  }

  async crear(datos: DatosBrote) {
    this.validarDatos(datos, true);

    await this.validarReferencias(
      datos.plantaId!,
      datos.enfermedadId!,
    );

    const resultado = await this.dataSource.query(
      `INSERT INTO brotes
        (plantaId, enfermedadId, fecha, region, hectareasAfectadas)
       VALUES (?, ?, ?, ?, ?)`,
      [
        datos.plantaId,
        datos.enfermedadId,
        datos.fecha,
        datos.region!.trim(),
        datos.hectareasAfectadas,
      ],
    );

    const id = Number(resultado.insertId);

    return this.obtenerPorId(id);
  }

  async actualizar(id: number, datos: DatosBrote) {
    this.validarId(id, 'id');
    await this.obtenerPorId(id);

    const campos: string[] = [];
    const parametros: (string | number)[] = [];

    if (datos.plantaId !== undefined) {
      this.validarId(datos.plantaId, 'plantaId');
      campos.push('plantaId = ?');
      parametros.push(datos.plantaId);
    }

    if (datos.enfermedadId !== undefined) {
      this.validarId(datos.enfermedadId, 'enfermedadId');
      campos.push('enfermedadId = ?');
      parametros.push(datos.enfermedadId);
    }

    if (
      datos.plantaId !== undefined ||
      datos.enfermedadId !== undefined
    ) {
      const actual = await this.obtenerPorId(id);

      await this.validarReferencias(
        datos.plantaId ?? actual.plantaId,
        datos.enfermedadId ?? actual.enfermedadId,
      );
    }

    if (datos.fecha !== undefined) {
      this.validarFecha(datos.fecha, 'fecha');
      campos.push('fecha = ?');
      parametros.push(datos.fecha);
    }

    if (datos.region !== undefined) {
      this.validarRegion(datos.region);
      campos.push('region = ?');
      parametros.push(datos.region.trim());
    }

    if (datos.hectareasAfectadas !== undefined) {
      this.validarHectareas(datos.hectareasAfectadas);
      campos.push('hectareasAfectadas = ?');
      parametros.push(datos.hectareasAfectadas);
    }

    if (campos.length === 0) {
      throw new BadRequestException(
        'Debes enviar al menos un campo para actualizar.',
      );
    }

    parametros.push(id);

    await this.dataSource.query(
      `UPDATE brotes SET ${campos.join(', ')} WHERE id = ?`,
      parametros,
    );

    return this.obtenerPorId(id);
  }

  async eliminar(id: number) {
    this.validarId(id, 'id');
    await this.obtenerPorId(id);

    await this.dataSource.query(
      'DELETE FROM brotes WHERE id = ?',
      [id],
    );

    return {
      mensaje: 'Brote eliminado correctamente.',
      id,
    };
  }

  private async validarReferencias(
    plantaId: number,
    enfermedadId: number,
  ) {
    const plantas = await this.dataSource.query(
      'SELECT id FROM plantas WHERE id = ?',
      [plantaId],
    );

    if (plantas.length === 0) {
      throw new BadRequestException(
        `No existe una planta con id ${plantaId}.`,
      );
    }

    const enfermedades = await this.dataSource.query(
      'SELECT id FROM enfermedades WHERE id = ?',
      [enfermedadId],
    );

    if (enfermedades.length === 0) {
      throw new BadRequestException(
        `No existe una enfermedad con id ${enfermedadId}.`,
      );
    }
  }

  private validarDatos(datos: DatosBrote, completo: boolean) {
    if (completo) {
      if (
        datos.plantaId === undefined ||
        datos.enfermedadId === undefined ||
        datos.fecha === undefined ||
        datos.region === undefined ||
        datos.hectareasAfectadas === undefined
      ) {
        throw new BadRequestException(
          'Debes enviar plantaId, enfermedadId, fecha, region y hectareasAfectadas.',
        );
      }
    }

    if (datos.plantaId !== undefined) {
      this.validarId(datos.plantaId, 'plantaId');
    }

    if (datos.enfermedadId !== undefined) {
      this.validarId(datos.enfermedadId, 'enfermedadId');
    }

    if (datos.fecha !== undefined) {
      this.validarFecha(datos.fecha, 'fecha');
    }

    if (datos.region !== undefined) {
      this.validarRegion(datos.region);
    }

    if (datos.hectareasAfectadas !== undefined) {
      this.validarHectareas(datos.hectareasAfectadas);
    }
  }

  private validarId(id: number, campo: string) {
    if (!Number.isInteger(id) || id <= 0) {
      throw new BadRequestException(
        `${campo} debe ser un número entero positivo.`,
      );
    }
  }

  private validarRegion(region: string) {
    if (
      typeof region !== 'string' ||
      region.trim().length === 0 ||
      region.trim().length > 100
    ) {
      throw new BadRequestException(
        'region es obligatoria y debe tener máximo 100 caracteres.',
      );
    }
  }

  private validarHectareas(hectareas: number) {
    if (
      typeof hectareas !== 'number' ||
      !Number.isFinite(hectareas) ||
      hectareas < 0 ||
      hectareas > 99999999.99 ||
      Math.round(hectareas * 100) !== hectareas * 100
    ) {
      throw new BadRequestException(
        'hectareasAfectadas debe ser un número entre 0 y 99999999.99, con máximo dos decimales.',
      );
    }
  }

  private validarFecha(fecha: string, nombreCampo: string) {
    const formatoValido = /^\d{4}-\d{2}-\d{2}$/.test(fecha);

    if (!formatoValido) {
      throw new BadRequestException(
        `${nombreCampo} debe tener el formato YYYY-MM-DD.`,
      );
    }

    const fechaConvertida = new Date(`${fecha}T00:00:00.000Z`);

    if (
      Number.isNaN(fechaConvertida.getTime()) ||
      fechaConvertida.toISOString().slice(0, 10) !== fecha
    ) {
      throw new BadRequestException(
        `${nombreCampo} no es una fecha válida.`,
      );
    }
  }

  private formatearBrote(fila: FilaBrote) {
    return {
      id: Number(fila.id),
      plantaId: Number(fila.plantaId),
      enfermedadId: Number(fila.enfermedadId),
      fecha: fila.fecha,
      region: fila.region,
      hectareasAfectadas: Number(fila.hectareasAfectadas),
    };
  }
}