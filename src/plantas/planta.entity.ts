import { Column, Entity, PrimaryGeneratedColumn, Unique } from 'typeorm';
import { TIPOS_CULTIVO } from '../comun/constantes/valores-permitidos.js';

@Entity('plantas')
@Unique('UQ_plantas_nombre_cientifico', ['nombreCientifico'])
export class Planta {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'varchar', length: 100 })
    nombreComun: string;

    @Column({ type: 'varchar', length: 150 })
    nombreCientifico: string;

    @Column({ type: 'varchar', length: 100 })
    familiaBotanica: string;

    @Column({ type: 'enum', enum: [...TIPOS_CULTIVO] })
    tipoCultivo: string;

    @Column({ type: 'longtext' })
    secuenciaGenetica: string;
}