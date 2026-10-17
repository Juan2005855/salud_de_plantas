import { Between, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import type { FindOperator } from 'typeorm';

export function patronContiene(texto: string): string {
    return `%${texto.replace(/[\\%_]/g, '\\$&')}%`;
}

export function condicionRango(desde: string | undefined, hasta: string | undefined): FindOperator<string> | undefined {
    if (desde !== undefined && hasta !== undefined) {
        return Between(desde, hasta);
    }
    if (desde !== undefined) {
        return MoreThanOrEqual(desde);
    }
    if (hasta !== undefined) {
        return LessThanOrEqual(hasta);
    }
    return undefined;
}