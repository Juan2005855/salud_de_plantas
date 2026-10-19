import { BadRequestException } from '@nestjs/common';

const PATRON_SECUENCIA = /^[ACGT]+$/;

export function validarSecuenciaAdn(valor: unknown, campo: string): string {
    if (valor === undefined || valor === null) {
        throw new BadRequestException(`El campo ${campo} es obligatorio`);
    }
    if (typeof valor !== 'string') {
        throw new BadRequestException(`El campo ${campo} debe ser texto`);
    }
    if (valor.length === 0) {
        throw new BadRequestException(`El campo ${campo} no puede estar vacio`);
    }
    if (!PATRON_SECUENCIA.test(valor)) {
        throw new BadRequestException(
            `El campo ${campo} solo puede contener las letras A, C, G y T en mayuscula, sin espacios ni otros caracteres`,
        );
    }
    return valor;
}