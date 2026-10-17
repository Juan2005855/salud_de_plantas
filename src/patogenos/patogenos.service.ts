
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import { TIPOS_PATOGENO } from './tipos-patogeno.js';
import { CrearPatogenoDto } from './dto/crear-patogeno.dto.js';
import { ActualizarPatogenoDto } from './dto/actualizar-patogeno.dto.js';
import { validarSecuenciaAdn } from '../comun/validadores/validador-secuencia-adn.js';

@Injectable()
export class PatogenosService {
  constructor(private readonly dataSource: DataSource) {}

  private validarId(id: number): void {
    if (!Number.isInteger(id) || id <= 0) {
      throw new BadRequestException(
        'El identificador debe ser un número entero positivo.',
      );
    }
  }

  private validarTexto(valor: unknown, campo: string): void {
    if (typeof valor !== 'string' || valor.trim().length === 0) {
      throw new BadRequestException(
        `${campo} es obligatorio y debe contener texto.`,
      );
    }
  }

  private validarDatos(
    datos: CrearPatogenoDto | ActualizarPatogenoDto,
    esCreacion: boolean,
  ): void {
    const camposTexto = [
      'nombre',
      'nombreCientifico',
      'tipo',
      'transmision',
      'secuenciaGenetica',
    ] as const;

    for (const campo of camposTexto) {
      const valor = datos[campo];

      if (esCreacion || valor !== undefined) {
        this.validarTexto(valor, campo);
      }
    }

    if (
      datos.tipo !== undefined &&
      !TIPOS_PATOGENO.includes(datos.tipo as (typeof TIPOS_PATOGENO)[number])
    ) {
      throw new BadRequestException(
        `El tipo debe ser uno de los siguientes: ${TIPOS_PATOGENO.join(', ')}.`,
      );
    }

    if (
      datos.secuenciaGenetica !== undefined &&
      !validarSecuenciaAdn(datos.secuenciaGenetica)
    ) {
      throw new BadRequestException(
        'La secuencia genética debe contener únicamente A, C, G y T en mayúsculas, y no puede estar vacía.',
      );
    }
  }

  private async validarNombreCientifico(
    nombreCientifico: string,
    idExcluir?: number,
  ): Promise<void> {
    const parametros: unknown[] = [nombreCientifico];

    let sql = 'SELECT id FROM patogenos WHERE nombreCientifico = ?';

    if (idExcluir !== undefined) {
      sql += ' AND id <> ?';
      parametros.push(idExcluir);
    }

    const encontrados: { id: number }[] =
      await this.dataSource.query(sql, parametros);

    if (encontrados.length > 0) {
      throw new ConflictException(
        'Ya existe un patógeno con ese nombre científico.',
      );
    }
  }

  async listar(): Promise<{ patogenos: unknown[] }> {
    const patogenos = await this.dataSource.query(
      `SELECT id, nombre, nombreCientifico, tipo, transmision, secuenciaGenetica
       FROM patogenos
       ORDER BY id`,
    );

    return { patogenos };
  }

  async obtenerPorId(id: number) {
    this.validarId(id);

    const resultados = await this.dataSource.query(
      `SELECT id, nombre, nombreCientifico, tipo, transmision, secuenciaGenetica
       FROM patogenos
       WHERE id = ?`,
      [id],
    );

    if (resultados.length === 0) {
      throw new NotFoundException(
        `No existe el patógeno con identificador ${id}.`,
      );
    }

    return resultados[0];
  }

  async crear(dto: CrearPatogenoDto) {
    this.validarDatos(dto, true);

    await this.validarNombreCientifico(dto.nombreCientifico.trim());

    const resultado = await this.dataSource.query(
      `INSERT INTO patogenos
       (nombre, nombreCientifico, tipo, transmision, secuenciaGenetica)
       VALUES (?, ?, ?, ?, ?)`,
      [
        dto.nombre.trim(),
        dto.nombreCientifico.trim(),
        dto.tipo,
        dto.transmision.trim(),
        dto.secuenciaGenetica,
      ],
    );

    // MySQL puede devolver el identificador dentro de insertId.
    const idInsertado = resultado?.insertId;
    const id = Number(idInsertado);

    if (
      idInsertado === undefined ||
      idInsertado === null ||
      !Number.isInteger(id) ||
      id <= 0
    ) {
      throw new InternalServerErrorException(
        'El patógeno se insertó, pero no se pudo recuperar su identificador.',
      );
    }

    return this.obtenerPorId(id);
  }

  async actualizar(id: number, dto: ActualizarPatogenoDto) {
    this.validarId(id);
    await this.obtenerPorId(id);
    this.validarDatos(dto, false);

    const camposPermitidos = [
      'nombre',
      'nombreCientifico',
      'tipo',
      'transmision',
      'secuenciaGenetica',
    ] as const;

    const asignaciones: string[] = [];
    const parametros: unknown[] = [];

    for (const campo of camposPermitidos) {
      const valor = dto[campo];

      if (valor !== undefined) {
        if (campo === 'nombreCientifico') {
          await this.validarNombreCientifico(valor.trim(), id);
        }

        asignaciones.push(`${campo} = ?`);

        parametros.push(
          typeof valor === 'string' &&
          campo !== 'tipo' &&
          campo !== 'secuenciaGenetica'
            ? valor.trim()
            : valor,
        );
      }
    }

    if (asignaciones.length === 0) {
      throw new BadRequestException(
        'Debes enviar al menos un campo para actualizar.',
      );
    }

    parametros.push(id);

    await this.dataSource.query(
      `UPDATE patogenos
       SET ${asignaciones.join(', ')}
       WHERE id = ?`,
      parametros,
    );

    return this.obtenerPorId(id);
  }

  async eliminar(id: number) {
    this.validarId(id);
    await this.obtenerPorId(id);

    const dependencias: { total: number }[] =
      await this.dataSource.query(
        'SELECT COUNT(*) AS total FROM enfermedades WHERE patogenoId = ?',
        [id],
      );

    if (Number(dependencias[0]?.total ?? 0) > 0) {
      throw new BadRequestException(
        'No se puede eliminar el patógeno porque tiene enfermedades asociadas.',
      );
    }

    await this.dataSource.query(
      'DELETE FROM patogenos WHERE id = ?',
      [id],
    );

    return {
      mensaje: 'Patógeno eliminado correctamente.',
      id,
    };
  }
}
