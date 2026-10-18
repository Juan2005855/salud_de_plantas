
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DataSource } from 'typeorm';

import { Planta } from './planta.entity.js';
import { CrearPlantaDto } from './dto/crear-planta.dto.js';
import { ActualizarPlantaDto } from './dto/actualizar-planta.dto.js';
import { FiltrarPlantaDto } from './dto/filtrar-planta.dto.js';
import { validarSecuenciaAdn } from '../comun/validadores/validador-secuencia-adn.js';

const TIPOS_CULTIVO = [
  'hortaliza',
  'frutal',
  'cereal',
  'ornamental',
  'otro',
];

@Injectable()
export class PlantasService {
  constructor(private readonly dataSource: DataSource) {}

  // Comprueba que el identificador sea un entero positivo.
  private validarId(id: number): void {
    if (!Number.isInteger(id) || id <= 0) {
      throw new BadRequestException(
        'El identificador de la planta debe ser un entero mayor que cero.',
      );
    }
  }

  // Valida los campos enviados al crear o actualizar una planta.
  private validarCampos(
    dto: CrearPlantaDto | ActualizarPlantaDto,
  ): void {
    if (
      dto.nombreComun !== undefined &&
      (typeof dto.nombreComun !== 'string' ||
        !dto.nombreComun.trim())
    ) {
      throw new BadRequestException(
        'El nombre común es obligatorio.',
      );
    }

    if (
      dto.nombreCientifico !== undefined &&
      (typeof dto.nombreCientifico !== 'string' ||
        !dto.nombreCientifico.trim())
    ) {
      throw new BadRequestException(
        'El nombre científico es obligatorio.',
      );
    }

    if (
      dto.familiaBotanica !== undefined &&
      (typeof dto.familiaBotanica !== 'string' ||
        !dto.familiaBotanica.trim())
    ) {
      throw new BadRequestException(
        'La familia botánica es obligatoria.',
      );
    }

    if (
      dto.tipoCultivo !== undefined &&
      !TIPOS_CULTIVO.includes(dto.tipoCultivo)
    ) {
      throw new BadRequestException(
        `El tipo de cultivo debe ser uno de los siguientes: ${TIPOS_CULTIVO.join(', ')}.`,
      );
    }

    // El validador compartido devuelve la secuencia o lanza una excepción.
    if (dto.secuenciaGenetica !== undefined) {
      validarSecuenciaAdn(
        dto.secuenciaGenetica,
        'secuencia genética',
      );
    }
  }

  // Evita registrar dos plantas con el mismo nombre científico.
  private async validarNombreCientifico(
    nombreCientifico: string,
    excluirId?: number,
  ): Promise<void> {
    const sql = excluirId
      ? 'SELECT id FROM plantas WHERE nombreCientifico = ? AND id <> ?'
      : 'SELECT id FROM plantas WHERE nombreCientifico = ?';

    const parametros = excluirId
      ? [nombreCientifico.trim(), excluirId]
      : [nombreCientifico.trim()];

    const existentes: Array<{ id: number }> =
      await this.dataSource.query(sql, parametros);

    if (existentes.length > 0) {
      throw new BadRequestException(
        'Ya existe una planta con ese nombre científico.',
      );
    }
  }

  // Lista las plantas y permite aplicar filtros opcionales.
  async obtenerTodas(filtros: FiltrarPlantaDto = {}) {
    const condiciones: string[] = [];
    const parametros: unknown[] = [];

    const campos: Array<keyof FiltrarPlantaDto> = [
      'nombreComun',
      'nombreCientifico',
      'familiaBotanica',
      'tipoCultivo',
    ];

    for (const campo of campos) {
      const valor = filtros[campo];

      if (
        valor !== undefined &&
        typeof valor === 'string' &&
        valor.trim() !== ''
      ) {
        condiciones.push(`\`${campo}\` LIKE ?`);
        parametros.push(`%${valor.trim()}%`);
      }
    }

    const sql =
      'SELECT id, nombreComun, nombreCientifico, familiaBotanica, tipoCultivo, secuenciaGenetica FROM plantas' +
      (condiciones.length
        ? ` WHERE ${condiciones.join(' AND ')}`
        : '') +
      ' ORDER BY id';

    return this.dataSource.query(sql, parametros);
  }

  // Busca una planta por su identificador.
  async obtenerPorId(id: number) {
    this.validarId(id);

    const plantas: Planta[] = await this.dataSource.query(
      `SELECT id, nombreComun, nombreCientifico, familiaBotanica,
              tipoCultivo, secuenciaGenetica
       FROM plantas
       WHERE id = ?`,
      [id],
    );

    if (plantas.length === 0) {
      throw new NotFoundException(
        `No existe la planta con identificador ${id}.`,
      );
    }

    return plantas[0];
  }

  // Registra una planta nueva.
  async crear(dto: CrearPlantaDto) {
    this.validarCampos(dto);

    const obligatorios = [
      dto.nombreComun,
      dto.nombreCientifico,
      dto.familiaBotanica,
      dto.tipoCultivo,
      dto.secuenciaGenetica,
    ];

    if (
      obligatorios.some(
        (valor) =>
          typeof valor !== 'string' || !valor.trim(),
      )
    ) {
      throw new BadRequestException(
        'Todos los campos de la planta son obligatorios.',
      );
    }

    await this.validarNombreCientifico(dto.nombreCientifico);

    const resultado = await this.dataSource.query(
      `INSERT INTO plantas
       (nombreComun, nombreCientifico, familiaBotanica,
        tipoCultivo, secuenciaGenetica)
       VALUES (?, ?, ?, ?, ?)`,
      [
        dto.nombreComun.trim(),
        dto.nombreCientifico.trim(),
        dto.familiaBotanica.trim(),
        dto.tipoCultivo,
        dto.secuenciaGenetica,
      ],
    );

    const id = Number(resultado.insertId);

    if (!Number.isInteger(id) || id <= 0) {
      throw new BadRequestException(
        'No fue posible obtener el identificador de la planta creada.',
      );
    }

    return this.obtenerPorId(id);
  }

  // Actualiza solamente los campos enviados.
  async actualizar(id: number, dto: ActualizarPlantaDto) {
    await this.obtenerPorId(id);
    this.validarCampos(dto);

    const campos: string[] = [];
    const parametros: unknown[] = [];

    const permitidos: Array<keyof ActualizarPlantaDto> = [
      'nombreComun',
      'nombreCientifico',
      'familiaBotanica',
      'tipoCultivo',
      'secuenciaGenetica',
    ];

    for (const campo of permitidos) {
      const valor = dto[campo];

      if (valor !== undefined) {
        if (
          typeof valor !== 'string' ||
          !valor.trim()
        ) {
          throw new BadRequestException(
            `El campo ${campo} no puede estar vacío.`,
          );
        }

        campos.push(`\`${campo}\` = ?`);
        parametros.push(valor.trim());
      }
    }

    if (campos.length === 0) {
      throw new BadRequestException(
        'Debes enviar al menos un campo para actualizar.',
      );
    }

    if (dto.nombreCientifico !== undefined) {
      await this.validarNombreCientifico(
        dto.nombreCientifico,
        id,
      );
    }

    parametros.push(id);

    await this.dataSource.query(
      `UPDATE plantas
       SET ${campos.join(', ')}
       WHERE id = ?`,
      parametros,
    );

    return this.obtenerPorId(id);
  }

  // Evita eliminar plantas que tengan registros asociados.
  async eliminar(id: number) {
    await this.obtenerPorId(id);

    const dependencias = [
      {
        tabla: 'cultivos',
        campo: 'plantaId',
        nombre: 'cultivos',
      },
      {
        tabla: 'susceptibilidades',
        campo: 'plantaId',
        nombre: 'susceptibilidades',
      },
      {
        tabla: 'brotes',
        campo: 'plantaId',
        nombre: 'brotes',
      },
    ];

    for (const dependencia of dependencias) {
      const resultado: Array<{ total: number }> =
        await this.dataSource.query(
          `SELECT COUNT(*) AS total
           FROM ${dependencia.tabla}
           WHERE ${dependencia.campo} = ?`,
          [id],
        );

      if (Number(resultado[0]?.total ?? 0) > 0) {
        throw new BadRequestException(
          `No se puede eliminar la planta porque tiene registros asociados en ${dependencia.nombre}.`,
        );
      }
    }

    await this.dataSource.query(
      'DELETE FROM plantas WHERE id = ?',
      [id],
    );

    return {
      mensaje: 'Planta eliminada correctamente.',
    };
  }

  // Consulta las enfermedades asociadas a una planta.
  async obtenerEnfermedades(id: number) {
    this.validarId(id);

    const plantas: Planta[] = await this.dataSource.query(
      `SELECT id, nombreComun, nombreCientifico
       FROM plantas
       WHERE id = ?`,
      [id],
    );

    const planta = plantas[0];

    if (!planta) {
      throw new NotFoundException(
        `No existe la planta con identificador ${id}.`,
      );
    }

    const susceptibilidades: Array<{
      enfermedadId: number;
      nivel: string;
    }> = await this.dataSource.query(
      `SELECT enfermedadId, nivel
       FROM susceptibilidades
       WHERE plantaId = ?`,
      [id],
    );

    const enfermedades: Array<Record<string, unknown>> = [];

    for (const susceptibilidad of susceptibilidades) {
      const resultado = await this.dataSource.query(
        `SELECT id, nombre, descripcionSintomas,
                epocaRiesgo, patogenoId
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
