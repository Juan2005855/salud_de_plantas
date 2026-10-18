import { BadRequestException } from '@nestjs/common';

const ID_MAXIMO = 2147483647;
const PATRON_FECHA = /^\d{4}-\d{2}-\d{2}$/;

function fechaHoy(): string {
    const zonaHoraria = process.env.ZONA_HORARIA ?? 'America/Bogota';
    return new Intl.DateTimeFormat('en-CA', {
        timeZone: zonaHoraria,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    }).format(new Date());
}

export function validarCuerpo(cuerpo: unknown): Record<string, unknown> {
    if (cuerpo === null || cuerpo === undefined || typeof cuerpo !== 'object' || Array.isArray(cuerpo)) {
        throw new BadRequestException('El cuerpo de la peticion es obligatorio y debe ser un objeto JSON');
    }
    return cuerpo as Record<string, unknown>;
}

export function validarTexto(valor: unknown, campo: string, maximo: number = 255): string {
    if (valor === undefined || valor === null) {
        throw new BadRequestException(`El campo ${campo} es obligatorio`);
    }
    if (typeof valor !== 'string') {
        throw new BadRequestException(`El campo ${campo} debe ser texto`);
    }
    const texto = valor.trim();
    if (texto.length === 0) {
        throw new BadRequestException(`El campo ${campo} no puede estar vacio`);
    }
    if (texto.length > maximo) {
        throw new BadRequestException(`El campo ${campo} no puede superar ${maximo} caracteres`);
    }
    return texto;
}

export function validarOpcion(valor: unknown, campo: string, permitidos: readonly string[]): string {
    if (valor === undefined || valor === null) {
        throw new BadRequestException(`El campo ${campo} es obligatorio`);
    }
    if (typeof valor !== 'string' || !permitidos.includes(valor)) {
        throw new BadRequestException(`El campo ${campo} debe ser uno de: ${permitidos.join(', ')}`);
    }
    return valor;
}

export function validarIdCuerpo(valor: unknown, campo: string): number {
    if (valor === undefined || valor === null) {
        throw new BadRequestException(`El campo ${campo} es obligatorio`);
    }
    if (typeof valor !== 'number' || !Number.isInteger(valor) || valor < 1 || valor > ID_MAXIMO) {
        throw new BadRequestException(`El campo ${campo} debe ser un numero entero positivo`);
    }
    return valor;
}

export function validarIdParametro(valor: unknown, campo: string): number {
    if (typeof valor !== 'string' || !/^[1-9]\d*$/.test(valor) || Number(valor) > ID_MAXIMO) {
        throw new BadRequestException(`El parametro ${campo} debe ser un numero entero positivo`);
    }
    return Number(valor);
}

export function validarFecha(valor: unknown, campo: string): string {
    if (valor === undefined || valor === null) {
        throw new BadRequestException(`El campo ${campo} es obligatorio`);
    }
    if (typeof valor !== 'string' || !PATRON_FECHA.test(valor)) {
        throw new BadRequestException(`El campo ${campo} debe tener el formato AAAA-MM-DD`);
    }
    const [anio, mes, dia] = valor.split('-').map(Number);
    const fecha = new Date(Date.UTC(anio, mes - 1, dia));
    const esReal =
        fecha.getUTCFullYear() === anio && fecha.getUTCMonth() === mes - 1 && fecha.getUTCDate() === dia;
    if (!esReal || anio < 1900) {
        throw new BadRequestException(`El campo ${campo} no es una fecha valida`);
    }
    return valor;
}

export function validarFechaNoFutura(valor: unknown, campo: string): string {
    const fecha = validarFecha(valor, campo);
    if (fecha > fechaHoy()) {
        throw new BadRequestException(`El campo ${campo} no puede ser posterior a la fecha de hoy (${fechaHoy()})`);
    }
    return fecha;
}

export function validarFiltroTexto(valor: unknown, campo: string): string | undefined {
    if (valor === undefined) {
        return undefined;
    }
    if (typeof valor !== 'string' || valor.trim().length === 0) {
        throw new BadRequestException(`El filtro ${campo} debe ser un texto no vacio`);
    }
    return valor.trim();
}

export function validarFiltroOpcion(valor: unknown, campo: string, permitidos: readonly string[]): string | undefined {
    if (valor === undefined) {
        return undefined;
    }
    if (typeof valor !== 'string' || !permitidos.includes(valor)) {
        throw new BadRequestException(`El filtro ${campo} debe ser uno de: ${permitidos.join(', ')}`);
    }
    return valor;
}

export function validarFiltroId(valor: unknown, campo: string): number | undefined {
    if (valor === undefined) {
        return undefined;
    }
    return validarIdParametro(valor, campo);
}

export function validarFiltroFecha(valor: unknown, campo: string): string | undefined {
    if (valor === undefined) {
        return undefined;
    }
    return validarFecha(valor, campo);
}

export function validarRangoFechas(desde: string | undefined, hasta: string | undefined): void {
    if (desde !== undefined && hasta !== undefined && desde > hasta) {
        throw new BadRequestException('El filtro desde no puede ser posterior al filtro hasta');
    }
}