import { CrearPlantaInDto } from "./dto/crear-planta-in-dto.js";
import { CrearPlantaOutDto } from "./dto/crear-planta-out-dto.js";
import { FiltrarPlantasInDto } from "./dto/filtrar-plantas-in-dto.js";
import { ObtenerPlantasOutDto } from "./dto/obtener-plantas-out-dto.js";
import { ObtenerPlantaOutDto } from "./dto/obtener-planta-out-dto.js";
import { ActualizarPlantaInDto } from "./dto/actualizar-planta-in-dto.js";

export interface PlantasServiceInterface {
    crearPlanta(crearPlantaInDTO: CrearPlantaInDto): Promise<CrearPlantaOutDto>;
    obtenerPlanta(plantaId: number): Promise<ObtenerPlantaOutDto>;
    obtenerPlantas(filtros: FiltrarPlantasInDto): Promise<ObtenerPlantasOutDto>;
    actualizarPlanta(plantaId: number, actualizarPlantaInDTO: ActualizarPlantaInDto): Promise<boolean>;
    eliminarPlanta(plantaId: number): Promise<boolean>;
}