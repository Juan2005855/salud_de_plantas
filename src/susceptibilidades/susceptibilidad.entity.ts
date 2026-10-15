
import {
  Column,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('susceptibilities')
@Index(
  'UQ_susceptibility_plant_disease',
  ['plantId', 'diseaseId'],
  { unique: true },
)
export class Susceptibility {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'int' })
  plantId!: number;

  @Column({ type: 'int' })
  diseaseId!: number;

  @Column({ type: 'varchar', length: 10 })
  level!: string;
}
