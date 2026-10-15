import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('brotes')
export class Brote {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'plantaId', type: 'int' })
  plantaId!: number;

  @Column({ name: 'enfermedadId', type: 'int' })
  enfermedadId!: number;

  @Column({ name: 'fecha', type: 'date' })
  fecha!: string;

  @Column({ name: 'region', type: 'varchar', length: 100 })
  region!: string;

  @Column({
    name: 'hectareasAfectadas',
    type: 'decimal',
    precision: 10,
    scale: 2,
  })
  hectareasAfectadas!: string;
}
