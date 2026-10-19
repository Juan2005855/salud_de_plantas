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

  async porPatogeno() {
    const brotes = await this.dataSource.query(`
      SELECT enfermedadId, COUNT(*) AS totalBrotes,
             COALESCE(SUM(hectareasAfectadas), 0) AS hectareasAfectadas
      FROM brotes
      GROUP BY enfermedadId
    `);

    const enfermedades = await this.dataSource.query(
      'SELECT id, patogenoId FROM enfermedades',
    );

    const patogenos = await this.dataSource.query(
      'SELECT id, nombre, nombreCientifico, tipo FROM patogenos',
    );

    const patogenoPorEnfermedad = new Map<number, number>();

    for (const enfermedad of enfermedades) {
      patogenoPorEnfermedad.set(
        Number(enfermedad.id),
        Number(enfermedad.patogenoId),
      );
    }

    const acumulado = new Map<
      number,
      { totalBrotes: number; hectareasAfectadas: number }
    >();

    for (const fila of brotes) {
      const patogenoId = patogenoPorEnfermedad.get(Number(fila.enfermedadId));

      if (patogenoId === undefined) {
        continue;
      }

      const actual = acumulado.get(patogenoId) ?? {
        totalBrotes: 0,
        hectareasAfectadas: 0,
      };

      actual.totalBrotes += Number(fila.totalBrotes);
      actual.hectareasAfectadas += Number(fila.hectareasAfectadas);
      acumulado.set(patogenoId, actual);
    }

    return patogenos
      .filter((patogeno: any) => acumulado.has(Number(patogeno.id)))
      .map((patogeno: any) => {
        const datos = acumulado.get(Number(patogeno.id))!;

        return {
          patogenoId: Number(patogeno.id),
          patogeno: patogeno.nombre,
          nombreCientifico: patogeno.nombreCientifico,
          tipo: patogeno.tipo,
          totalBrotes: datos.totalBrotes,
          hectareasAfectadas: Number(datos.hectareasAfectadas.toFixed(2)),
        };
      })
      .sort((a: any, b: any) => b.totalBrotes - a.totalBrotes);
  }
}