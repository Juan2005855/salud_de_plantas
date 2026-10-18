import { Column, Entity, PrimaryGeneratedColumn, Unique } from 'typeorm';
import { TIPOS_CULTIVO } from '../comun/constantes/valores-permitidos.js';

@Entity('plantas')
@Unique('UQ_plantas_nombre_cientifico', ['nombreCientifico'])
export class Planta {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'nombreComun', type: 'varchar', length: 100 })
  nombreComun!: string;

  @Column({
    name: 'nombreCientifico',
    type: 'varchar',
    length: 150,
    unique: true,
  })
  nombreCientifico!: string;

  @Column({ name: 'familiaBotanica', type: 'varchar', length: 100 })
  familiaBotanica!: string;

  @Column({
    name: 'tipoCultivo',
    type: 'enum',
    enum: [...TIPOS_CULTIVO],
  })
  tipoCultivo!: string;

  @Column({ name: 'secuenciaGenetica', type: 'longtext' })
  secuenciaGenetica!: string;
}
