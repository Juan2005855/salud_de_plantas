import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';

import { Planta } from './planta.entity.js';

@Injectable()
export class PlantasService {
  constructor(
    @InjectRepository(Planta)
    private readonly plantasRepository: Repository<Planta>,
    private readonly dataSource: DataSource,
  ) {}

  async obtenerEnfermedades(id: number) {
    if (!Number.isInteger(id) || id <= 0) {
      throw new BadRequestException(
        'El identificador de la planta debe ser un entero mayor que cero.',
      );
    }

    const planta = await this.plantasRepository.findOne({
      where: { id },
    });

    if (!planta) {
      throw new NotFoundException(`No existe la planta con identificador ${id}.`);
    }

    const susceptibilidades: Array<{
      enfermedadId: number;
      nivel: string;
    }> = await this.dataSource.query(
      'SELECT enfermedadId, nivel FROM susceptibilidades WHERE plantaId = ?',
      [id],
    );

    if (susceptibilidades.length === 0) {
      return {
        planta: {
          id: planta.id,
          nombreComun: planta.nombreComun,
          nombreCientifico: planta.nombreCientifico,
        },
        enfermedades: [],
      };
    }

    const enfermedades = [];

    for (const susceptibilidad of susceptibilidades) {
      const resultado = await this.dataSource.query(
        `SELECT id, nombre, descripcionSintomas, epocaRiesgo, patogenoId
         FROM enfermedades
         WHERE id = ?`,
        [susceptibilidad.enfermedadId],
      );

      if (resultado.length > 0) {
        enfermedades.push({
          ...resultado[0],
          nivelSusceptibilidad: susceptibilidad.nivel,
        });
      }
    }

    return {
      planta: {
        id: planta.id,
        nombreComun: planta.nombreComun,
        nombreCientifico: planta.nombreCientifico,
      },
      enfermedades,
    };
  }
}
