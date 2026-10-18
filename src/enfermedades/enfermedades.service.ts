import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DataSource } from 'typeorm';

import { PatogenosService } from '../patogenos/patogenos.service.js';
import { CrearEnfermedadDto } from './dto/crear-enfermedad.dto.js';
import { ActualizarEnfermedadDto } from './dto/actualizar-enfermedad.dto.js';

const EPOCAS_VALIDAS = [
  'primavera',
  'verano',
  'otoño',
  'invierno',
  'todo_el_año',
];

@Injectable()
export class EnfermedadesService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly patogenosService: PatogenosService,
  ) {}

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

  private validarEpoca(epoca: string): void {
    if (!EPOCAS_VALIDAS.includes(epoca)) {
      throw new BadRequestException(
        'La época debe ser primavera, verano, otoño, invierno o todo_el_año.',
      );
    }
  }

  private async comprobarPatogeno(patogenoId: number): Promise<void> {
    this.validarId(patogenoId);

    const patogenos = await this.dataSource.query(
      'SELECT id FROM patogenos WHERE id = ?',
      [patogenoId],
    );

    if (patogenos.length === 0) {
      throw new BadRequestException(
        `No existe el patógeno con identificador ${patogenoId}.`,
      );
    }
  }

  async listar() {
    return this.dataSource.query(
      `SELECT id, nombre, descripcionSintomas, epocaRiesgo, patogenoId
       FROM enfermedades
       ORDER BY id`,
    );
  }

  async obtenerPorId(id: number) {
    this.validarId(id);

    const enfermedades = await this.dataSource.query(
      `SELECT id, nombre, descripcionSintomas, epocaRiesgo, patogenoId
       FROM enfermedades
       WHERE id = ?`,
      [id],
    );

    if (enfermedades.length === 0) {
      throw new NotFoundException(
        `No existe la enfermedad con identificador ${id}.`,
      );
    }

    return enfermedades[0];
  }

  async obtenerDetalle(id: number) {
    const enfermedad = await this.obtenerPorId(id);

    const patogeno = await this.patogenosService.obtenerPorId(
      Number(enfermedad.patogenoId),
    );

    const tratamientos = await this.dataSource.query(
      `SELECT id, nombre, descripcionAplicacion, tipo, enfermedadId
       FROM tratamientos
       WHERE enfermedadId = ?
       ORDER BY id`,
      [id],
    );

    return { enfermedad, patogeno, tratamientos };
  }

  async crear(dto: CrearEnfermedadDto) {
    this.validarTexto(dto.nombre, 'nombre');
    this.validarTexto(dto.descripcionSintomas, 'descripcionSintomas');
    this.validarEpoca(dto.epocaRiesgo);

    await this.comprobarPatogeno(Number(dto.patogenoId));

    const resultado = await this.dataSource.query(
      `INSERT INTO enfermedades
       (nombre, descripcionSintomas, epocaRiesgo, patogenoId)
       VALUES (?, ?, ?, ?)`,
      [
        dto.nombre.trim(),
        dto.descripcionSintomas.trim(),
        dto.epocaRiesgo,
        Number(dto.patogenoId),
      ],
    );

    const id = Number(resultado.insertId);

    if (!Number.isInteger(id) || id <= 0) {
      throw new BadRequestException(
        'No fue posible obtener el identificador de la enfermedad creada.',
      );
    }

    return this.obtenerPorId(id);
  }

  async actualizar(id: number, dto: ActualizarEnfermedadDto) {
    const actual = await this.obtenerPorId(id);

    const nombre = dto.nombre ?? actual.nombre;
    const descripcionSintomas =
      dto.descripcionSintomas ?? actual.descripcionSintomas;
    const epocaRiesgo = dto.epocaRiesgo ?? actual.epocaRiesgo;
    const patogenoId =
      dto.patogenoId === undefined
        ? Number(actual.patogenoId)
        : Number(dto.patogenoId);

    this.validarTexto(nombre, 'nombre');
    this.validarTexto(descripcionSintomas, 'descripcionSintomas');
    this.validarEpoca(epocaRiesgo);
    await this.comprobarPatogeno(patogenoId);

    await this.dataSource.query(
      `UPDATE enfermedades
       SET nombre = ?, descripcionSintomas = ?,
           epocaRiesgo = ?, patogenoId = ?
       WHERE id = ?`,
      [
        nombre.trim(),
        descripcionSintomas.trim(),
        epocaRiesgo,
        patogenoId,
        id,
      ],
    );

    return this.obtenerPorId(id);
  }

  async eliminar(id: number) {
    await this.obtenerPorId(id);

    const dependencias = [
      {
        tabla: 'tratamientos',
        campo: 'enfermedadId',
        descripcion: 'tratamientos',
      },
      {
        tabla: 'susceptibilidades',
        campo: 'enfermedadId',
        descripcion: 'susceptibilidades',
      },
      {
        tabla: 'brotes',
        campo: 'enfermedadId',
        descripcion: 'brotes',
      },
    ];

    for (const dependencia of dependencias) {
      const resultado = await this.dataSource.query(
        `SELECT COUNT(*) AS total
         FROM ${dependencia.tabla}
         WHERE ${dependencia.campo} = ?`,
        [id],
      );

      const total = Number(resultado[0].total);

      if (total > 0) {
        throw new BadRequestException(
          `No se puede eliminar la enfermedad ${id} porque tiene ${total} registro(s) asociado(s) en ${dependencia.descripcion}.`,
        );
      }
    }

    await this.dataSource.query(
      'DELETE FROM enfermedades WHERE id = ?',
      [id],
    );

    return {
      mensaje: `La enfermedad ${id} fue eliminada correctamente.`,
    };
  }
}