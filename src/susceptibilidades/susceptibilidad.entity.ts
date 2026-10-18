
import {
  Column,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('susceptibilidades')
@Index(
  'UQ_susceptibilidades_planta_enfermedad',
  ['plantId', 'diseaseId'],
  { unique: true },
)
export class Susceptibility {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'plantaId', type: 'int' })
  plantId!: number;

  @Column({ name: 'enfermedadId', type: 'int' })
  diseaseId!: number;

  @Column({
    name: 'nivel',
    type: 'enum',
    enum: ['baja', 'media', 'alta'],
  })
  level!: string;
}
