import { ApiProperty } from '@nestjs/swagger';

export class VerificarMutacionesOutDto {
    @ApiProperty({ description: 'Identificador del cultivo verificado', example: 1 })
    cultivoId: number;

    @ApiProperty({ description: 'Identificador de la planta cuya secuencia de referencia se uso', example: 1 })
    plantaId: number;

    @ApiProperty({ description: 'Longitud de ambas secuencias', example: 14 })
    longitudSecuencia: number;

    @ApiProperty({ description: 'Cantidad de posiciones donde la semilla difiere de la referencia', example: 2 })
    totalMutaciones: number;

    @ApiProperty({ description: 'Posiciones con mutacion, empezando a contar desde 1', example: [3, 9], type: [Number] })
    posicionesMutadas: number[];
}