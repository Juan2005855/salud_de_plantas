import { Injectable } from '@nestjs/common';
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
}
