import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('plantas')
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
    enum: ['hortaliza', 'frutal', 'cereal', 'ornamental', 'otro'],
  })
  tipoCultivo!: string;

  @Column({ name: 'secuenciaGenetica', type: 'text' })
  secuenciaGenetica!: string;
}
