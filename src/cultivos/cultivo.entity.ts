
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('cultivos')
export class Cultivo {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'plantaId', type: 'int' })
  plantaId!: number;

  @Column({ name: 'lote', type: 'varchar', length: 100 })
  lote!: string;

  @Column({ name: 'region', type: 'varchar', length: 100 })
  region!: string;

  @Column({ name: 'fechaSiembra', type: 'date' })
  fechaSiembra!: string;

  @Column({ name: 'codigoGeneticoSemilla', type: 'text' })
  codigoGeneticoSemilla!: string;
}
