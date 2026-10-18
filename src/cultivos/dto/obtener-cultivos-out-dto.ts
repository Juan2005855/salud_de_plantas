import { ApiProperty } from '@nestjs/swagger';
import { ObtenerCultivoOutDto } from './obtener-cultivo-out-dto.js';

export class ObtenerCultivosOutDto {
    @ApiProperty({ type: () => [ObtenerCultivoOutDto] })
    cultivos: ObtenerCultivoOutDto[];
}