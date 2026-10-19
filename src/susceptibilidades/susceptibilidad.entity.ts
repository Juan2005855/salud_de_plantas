import {
  Column,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('susceptibilidades')
@Index(
  'UQ_susceptibilidades_planta_enfermedad',
  ['plantaId', 'enfermedadId'],
  { unique: true },
)
export class Susceptibilidad {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'plantaId', type: 'int' })
  plantaId!: number;

  @Column({ name: 'enfermedadId', type: 'int' })
  enfermedadId!: number;

  @Column({
    name: 'nivel',
    type: 'enum',
    enum: ['baja', 'media', 'alta'],
  })
  nivel!: string;
}