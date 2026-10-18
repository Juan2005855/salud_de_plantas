import { ApiProperty } from '@nestjs/swagger';
import { ObtenerPlantaOutDto } from './obtener-planta-out-dto.js';

export class ObtenerPlantasOutDto {
    @ApiProperty({ type: () => [ObtenerPlantaOutDto] })
    plantas: ObtenerPlantaOutDto[];
}