import { ActualizarPatogenoDto } from './dto/actualizar-patogeno.dto.js';
import { CrearPatogenoDto } from './dto/crear-patogeno.dto.js';
import { ListarPatogenosOutDto } from './dto/listar-patogenos-out.dto.js';
import { PatogenoOutDto } from './dto/patogeno-out.dto.js';

export interface PatogenosServiceInterface {
  crearPatogeno(datos: CrearPatogenoDto): Promise<PatogenoOutDto>;
  obtenerPatogeno(id: number): Promise<PatogenoOutDto>;
  listarPatogenos(tipo?: string): Promise<ListarPatogenosOutDto>;
  actualizarPatogeno(
    id: number,
    datos: ActualizarPatogenoDto,
  ): Promise<PatogenoOutDto>;
  eliminarPatogeno(id: number): Promise<void>;
}