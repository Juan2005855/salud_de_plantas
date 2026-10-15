import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { validarSecuenciaAdn } from '../comun/validadores/validador-secuencia-adn.js';
import { ActualizarPatogenoDto } from './dto/actualizar-patogeno.dto.js';
import { CrearPatogenoDto } from './dto/crear-patogeno.dto.js';
import { ListarPatogenosOutDto } from './dto/listar-patogenos-out.dto.js';
import { PatogenoOutDto } from './dto/patogeno-out.dto.js';
import { Patogeno } from './patogeno.entity.js';
import type { PatogenosServiceInterface } from './patogenos-service-interface.js';
import { TIPOS_PATOGENO } from './tipos-patogeno.js';

@Injectable()
export class PatogenosService implements PatogenosServiceInterface {
  constructor(
    @InjectRepository(Patogeno)
    private readonly patogenosRepository: Repository<Patogeno>,
  ) {}

  async crearPatogeno(datos: CrearPatogenoDto): Promise<PatogenoOutDto> {
    this.validarDatos(datos);
    await this.validarNombreCientificoUnico(datos.nombreCientifico);
    const patogeno = this.patogenosRepository.create({
      nombre: datos.nombre,
      nombreCientifico: datos.nombreCientifico,
      tipo: datos.tipo,
      transmision: datos.transmision,
      secuenciaGenetica: datos.secuenciaGenetica,
    });
    const guardado = await this.patogenosRepository.save(patogeno);
    return this.mapear(guardado);
  }

  async obtenerPatogeno(id: number): Promise<PatogenoOutDto> {
    const idValido = this.validarId(id);
    const patogeno = await this.patogenosRepository.findOneBy({ id: idValido });
    if (!patogeno) {
      throw new NotFoundException(`Patógeno con id ${idValido} no encontrado`);
    }
    return this.mapear(patogeno);
  }

  async listarPatogenos(tipo?: string): Promise<ListarPatogenosOutDto> {
    if (tipo !== undefined && !TIPOS_PATOGENO.includes(tipo)) {
      throw new BadRequestException(
        `El tipo debe ser uno de: ${TIPOS_PATOGENO.join(', ')}`,
      );
    }
    const patogenos = await this.patogenosRepository.find({
      where: tipo ? { tipo } : {},
      order: { id: 'ASC' },
    });
    return { patogenos: patogenos.map((patogeno) => this.mapear(patogeno)) };
  }

  async actualizarPatogeno(
    id: number,
    datos: ActualizarPatogenoDto,
  ): Promise<PatogenoOutDto> {
    const idValido = this.validarId(id);
    this.validarDatos(datos);
    await this.validarNombreCientificoUnico(datos.nombreCientifico, idValido);
    const resultado = await this.patogenosRepository.update(idValido, {
      nombre: datos.nombre,
      nombreCientifico: datos.nombreCientifico,
      tipo: datos.tipo,
      transmision: datos.transmision,
      secuenciaGenetica: datos.secuenciaGenetica,
    });
    if (resultado.affected === 0) {
      throw new NotFoundException(`Patógeno con id ${idValido} no encontrado`);
    }
    return this.obtenerPatogeno(idValido);
  }

  async eliminarPatogeno(id: number): Promise<void> {
    const idValido = this.validarId(id);
    const resultado = await this.patogenosRepository.delete(idValido);
    if (resultado.affected === 0) {
      throw new NotFoundException(`Patógeno con id ${idValido} no encontrado`);
    }
  }

  private validarId(id: number): number {
    const numero = Number(id);
    if (!Number.isInteger(numero) || numero <= 0) {
      throw new BadRequestException('El id debe ser un número entero positivo');
    }
    return numero;
  }

  private esTextoValido(valor: unknown, maximo: number): boolean {
    return (
      typeof valor === 'string' &&
      valor.trim().length > 0 &&
      valor.trim().length <= maximo
    );
  }

  private validarDatos(datos: CrearPatogenoDto | ActualizarPatogenoDto): void {
    if (!datos || typeof datos !== 'object') {
      throw new BadRequestException('El cuerpo de la petición es obligatorio');
    }
    const errores: string[] = [];
    if (!this.esTextoValido(datos.nombre, 100)) {
      errores.push(
        'El nombre es obligatorio y debe tener máximo 100 caracteres',
      );
    }
    if (!this.esTextoValido(datos.nombreCientifico, 150)) {
      errores.push(
        'El nombre científico es obligatorio y debe tener máximo 150 caracteres',
      );
    }
    if (!TIPOS_PATOGENO.includes(datos.tipo)) {
      errores.push(`El tipo debe ser uno de: ${TIPOS_PATOGENO.join(', ')}`);
    }
    if (!this.esTextoValido(datos.transmision, 100)) {
      errores.push(
        'La transmisión es obligatoria y debe tener máximo 100 caracteres',
      );
    }
    if (!validarSecuenciaAdn(datos.secuenciaGenetica)) {
      errores.push(
        'La secuencia genética es obligatoria y solo puede contener las letras A, C, G y T',
      );
    }
    if (errores.length > 0) {
      throw new BadRequestException(errores);
    }
  }

  private async validarNombreCientificoUnico(
    nombreCientifico: string,
    idActual?: number,
  ): Promise<void> {
    const existente = await this.patogenosRepository.findOneBy({
      nombreCientifico,
    });
    if (existente && existente.id !== idActual) {
      throw new ConflictException(
        `Ya existe un patógeno con el nombre científico ${nombreCientifico}`,
      );
    }
  }

  private mapear(patogeno: Patogeno): PatogenoOutDto {
    return {
      id: patogeno.id,
      nombre: patogeno.nombre,
      nombreCientifico: patogeno.nombreCientifico,
      tipo: patogeno.tipo,
      transmision: patogeno.transmision,
      secuenciaGenetica: patogeno.secuenciaGenetica,
    };
  }
}
