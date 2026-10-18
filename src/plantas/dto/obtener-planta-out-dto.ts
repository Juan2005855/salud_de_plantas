import { ApiProperty } from '@nestjs/swagger';
import { TIPOS_CULTIVO } from '../../comun/constantes/valores-permitidos.js';

export class ObtenerPlantaOutDto {
    @ApiProperty({ description: 'Identificador de planta', example: 1 })
    id: number;

    @ApiProperty({ description: 'Nombre comun de la planta', example: 'Tomate' })
    nombreComun: string;

    @ApiProperty({ description: 'Nombre cientifico, no puede repetirse', example: 'Solanum lycopersicum' })
    nombreCientifico: string;

    @ApiProperty({ description: 'Familia botanica', example: 'Solanaceae' })
    familiaBotanica: string;

    @ApiProperty({ description: 'Tipo de cultivo', example: 'hortaliza', enum: TIPOS_CULTIVO })
    tipoCultivo: string;

    @ApiProperty({ description: 'Secuencia genetica de referencia, solo letras A, C, G y T en mayuscula', example: 'ATGCGTACGTTAGC' })
    secuenciaGenetica: string;
}