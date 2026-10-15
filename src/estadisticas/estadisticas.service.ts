import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class EstadisticasService {
  constructor(private readonly dataSource: DataSource) {}

  async porEnfermedad() {
    const filas = await this.dataSource.query(`
      SELECT enfermedadId, COUNT(*) AS totalBrotes,
             COALESCE(SUM(hectareasAfectadas), 0) AS hectareasAfectadas
      FROM brotes
      GROUP BY enfermedadId
      ORDER BY totalBrotes DESC
    `);

    const resultado = [];

    for (const fila of filas) {
      const enfermedades = await this.dataSource.query(
        'SELECT id, nombre FROM enfermedades WHERE id = ?',
        [fila.enfermedadId],
      );

      resultado.push({
        enfermedadId: Number(fila.enfermedadId),
        enfermedad: enfermedades[0]?.nombre ?? 'Desconocida',
        totalBrotes: Number(fila.totalBrotes),
        hectareasAfectadas: Number(fila.hectareasAfectadas),
      });
    }

    return resultado;
  }

  async porRegion() {
    const filas = await this.dataSource.query(`
      SELECT region, COUNT(*) AS totalBrotes,
             COALESCE(SUM(hectareasAfectadas), 0) AS hectareasAfectadas
      FROM brotes
      GROUP BY region
      ORDER BY totalBrotes DESC
    `);

    return filas.map((fila: any) => ({
      region: fila.region,
      totalBrotes: Number(fila.totalBrotes),
      hectareasAfectadas: Number(fila.hectareasAfectadas),
    }));
  }

  async porPeriodo() {
    const filas = await this.dataSource.query(`
      SELECT DATE_FORMAT(fecha, '%Y-%m') AS periodo,
             COUNT(*) AS totalBrotes,
             COALESCE(SUM(hectareasAfectadas), 0) AS hectareasAfectadas
      FROM brotes
      GROUP BY DATE_FORMAT(fecha, '%Y-%m')
      ORDER BY periodo
    `);

    return filas.map((fila: any) => ({
      periodo: fila.periodo,
      totalBrotes: Number(fila.totalBrotes),
      hectareasAfectadas: Number(fila.hectareasAfectadas),
    }));
  }

  async porPlanta() {
    const filas = await this.dataSource.query(`
      SELECT plantaId, COUNT(*) AS totalBrotes,
             COALESCE(SUM(hectareasAfectadas), 0) AS hectareasAfectadas
      FROM brotes
      GROUP BY plantaId
      ORDER BY totalBrotes DESC
    `);

    const resultado = [];

    for (const fila of filas) {
      const plantas = await this.dataSource.query(
        'SELECT id, nombreComun, nombreCientifico, tipoCultivo FROM plantas WHERE id = ?',
        [fila.plantaId],
      );

      resultado.push({
        plantaId: Number(fila.plantaId),
        nombreComun: plantas[0]?.nombreComun ?? 'Desconocida',
        nombreCientifico: plantas[0]?.nombreCientifico ?? null,
        tipoCultivo: plantas[0]?.tipoCultivo ?? null,
        totalBrotes: Number(fila.totalBrotes),
        hectareasAfectadas: Number(fila.hectareasAfectadas),
      });
    }

    return resultado;
  }
}