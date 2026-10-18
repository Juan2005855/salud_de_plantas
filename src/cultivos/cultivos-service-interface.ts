import { CrearCultivoInDto } from "./dto/crear-cultivo-in-dto.js";
import { CrearCultivoOutDto } from "./dto/crear-cultivo-out-dto.js";
import { FiltrarCultivosInDto } from "./dto/filtrar-cultivos-in-dto.js";
import { ObtenerCultivosOutDto } from "./dto/obtener-cultivos-out-dto.js";
import { ObtenerCultivoOutDto } from "./dto/obtener-cultivo-out-dto.js";
import { ActualizarCultivoInDto } from "./dto/actualizar-cultivo-in-dto.js";
import { VerificarMutacionesOutDto } from "./dto/verificar-mutaciones-out-dto.js";

export interface CultivosServiceInterface {
    crearCultivo(crearCultivoInDTO: CrearCultivoInDto): Promise<CrearCultivoOutDto>;
    obtenerCultivo(cultivoId: number): Promise<ObtenerCultivoOutDto>;
    obtenerCultivos(filtros: FiltrarCultivosInDto): Promise<ObtenerCultivosOutDto>;
    actualizarCultivo(cultivoId: number, actualizarCultivoInDTO: ActualizarCultivoInDto): Promise<boolean>;
    eliminarCultivo(cultivoId: number): Promise<boolean>;
    verificarMutaciones(cultivoId: number): Promise<VerificarMutacionesOutDto>;
}