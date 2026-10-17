import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DataSource } from 'typeorm';

import { CrearTratamientoDto } from './dto/crear-tratamiento.dto.js';
import { ActualizarTratamientoDto } from './dto/actualizar-tratamiento.dto.js';

@Injectable()
export class TratamientosService {
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

  private validarTipo(tipo: string): void {
    const tiposPermitidos = ['quimico', 'biologico', 'cultural'];

    if (!tiposPermitidos.includes(tipo)) {
      throw new BadRequestException(
        'El tipo debe ser quimico, biologico o cultural.',
      );
    }
  }

  private async comprobarEnfermedad(enfermedadId: number): Promise<void> {
    this.validarId(enfermedadId);

    const enfermedades = await this.dataSource.query(
      'SELECT id FROM enfermedades WHERE id = ?',
      [enfermedadId],
    );

    if (enfermedades.length === 0) {
      throw new BadRequestException(
        `No existe la enfermedad con identificador ${enfermedadId}.`,
      );
    }
  }

  async listar() {
    return this.dataSource.query(
      `SELECT id, nombre, descripcionAplicacion, tipo, enfermedadId
       FROM tratamientos
       ORDER BY id`,
    );
  }

  async obtenerPorId(id: number) {
    this.validarId(id);

    const tratamientos = await this.dataSource.query(
      `SELECT id, nombre, descripcionAplicacion, tipo, enfermedadId
       FROM tratamientos
       WHERE id = ?`,
      [id],
    );

    if (tratamientos.length === 0) {
      throw new NotFoundException(
        `No existe el tratamiento con identificador ${id}.`,
      );
    }

    return tratamientos[0];
  }

  async crear(dto: CrearTratamientoDto) {
    this.validarTexto(dto.nombre, 'nombre');
    this.validarTexto(dto.descripcionAplicacion, 'descripcionAplicacion');
    this.validarTipo(dto.tipo);
    await this.comprobarEnfermedad(Number(dto.enfermedadId));

    const resultado = await this.dataSource.query(
      `INSERT INTO tratamientos
       (nombre, descripcionAplicacion, tipo, enfermedadId)
       VALUES (?, ?, ?, ?)`,
      [
        dto.nombre.trim(),
        dto.descripcionAplicacion.trim(),
        dto.tipo,
        Number(dto.enfermedadId),
      ],
    );

    return this.obtenerPorId(Number(resultado.insertId));
  }

  async actualizar(id: number, dto: ActualizarTratamientoDto) {
    this.validarId(id);

    const tratamiento = await this.obtenerPorId(id);

    const nombre = dto.nombre ?? tratamiento.nombre;
    const descripcionAplicacion =
      dto.descripcionAplicacion ?? tratamiento.descripcionAplicacion;
    const tipo = dto.tipo ?? tratamiento.tipo;
    const enfermedadId =
      dto.enfermedadId === undefined
        ? Number(tratamiento.enfermedadId)
        : Number(dto.enfermedadId);

    this.validarTexto(nombre, 'nombre');
    this.validarTexto(
      descripcionAplicacion,
      'descripcionAplicacion',
    );
    this.validarTipo(tipo);
    await this.comprobarEnfermedad(enfermedadId);

    await this.dataSource.query(
      `UPDATE tratamientos
       SET nombre = ?, descripcionAplicacion = ?, tipo = ?,
           enfermedadId = ?
       WHERE id = ?`,
      [
        nombre.trim(),
        descripcionAplicacion.trim(),
        tipo,
        enfermedadId,
        id,
      ],
    );

    return this.obtenerPorId(id);
  }

  async eliminar(id: number) {
    this.validarId(id);
    await this.obtenerPorId(id);

    await this.dataSource.query(
      'DELETE FROM tratamientos WHERE id = ?',
      [id],
    );

    return {
      mensaje: `El tratamiento ${id} fue eliminado correctamente.`,
    };
  }
}