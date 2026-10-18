import { ApiProperty } from '@nestjs/swagger';

export class ObtenerCultivoOutDto {
    @ApiProperty({ description: 'Identificador de cultivo', example: 1 })
    id: number;

    @ApiProperty({ description: 'Id de la especie de planta sembrada, debe existir', example: 1 })
    plantaId: number;

    @ApiProperty({ description: 'Lote o finca donde se sembro', example: 'Finca La Esperanza lote 4' })
    lote: string;

    @ApiProperty({ description: 'Region de la siembra', example: 'Boyaca' })
    region: string;

    @ApiProperty({ description: 'Fecha de siembra (AAAA-MM-DD), no puede ser posterior a hoy', example: '2026-03-15' })
    fechaSiembra: string;

    @ApiProperty({ description: 'Codigo genetico de la semilla, solo letras A, C, G y T en mayuscula', example: 'ATGCGTACGTTAGA' })
    codigoGeneticoSemilla: string;
}