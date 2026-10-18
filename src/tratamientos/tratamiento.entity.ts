import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('tratamientos')
export class Tratamiento {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'nombre', type: 'varchar', length: 100 })
  nombre!: string;

  @Column({ name: 'descripcionAplicacion', type: 'text' })
  descripcionAplicacion!: string;

  @Column({
    name: 'tipo',
    type: 'enum',
    enum: ['quimico', 'biologico', 'cultural'],
  })
  tipo!: string;

  @Column({ name: 'enfermedadId', type: 'int' })
  enfermedadId!: number;
}