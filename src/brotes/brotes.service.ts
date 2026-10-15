import { BadRequestException, Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

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

      if (!Number.isInteger(plantaId) || plantaId <= 0) {
        throw new BadRequestException(
          'plantaId debe ser un número entero positivo.',
        );
      }

      condiciones.push('plantaId = ?');
      parametros.push(plantaId);
    }

    if (
      filtros.enfermedadId !== undefined &&
      filtros.enfermedadId !== ''
    ) {
      const enfermedadId = Number(filtros.enfermedadId);

      if (!Number.isInteger(enfermedadId) || enfermedadId <= 0) {
        throw new BadRequestException(
          'enfermedadId debe ser un número entero positivo.',
        );
      }

      condiciones.push('enfermedadId = ?');
      parametros.push(enfermedadId);
    }

    let consulta = `
      SELECT
        id,
        plantaId,
        enfermedadId,
        fecha,
        region,
        hectareasAfectadas
      FROM brotes
    `;

    if (condiciones.length > 0) {
      consulta += ` WHERE ${condiciones.join(' AND ')}`;
    }

    consulta += ' ORDER BY fecha DESC, id DESC';

    const filas: Array<{
      id: number | string;
      plantaId: number | string;
      enfermedadId: number | string;
      fecha: string | Date;
      region: string;
      hectareasAfectadas: string | number;
    }> = await this.dataSource.query(consulta, parametros);

    return filas.map((fila) => ({
      id: Number(fila.id),
      plantaId: Number(fila.plantaId),
      enfermedadId: Number(fila.enfermedadId),
      fecha: fila.fecha,
      region: fila.region,
      hectareasAfectadas: Number(fila.hectareasAfectadas),
    }));
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
}