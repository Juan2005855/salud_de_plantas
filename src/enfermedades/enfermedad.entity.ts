import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('enfermedades')
export class Enfermedad {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'nombre', type: 'varchar', length: 100 })
  nombre!: string;

  @Column({ name: 'descripcionSintomas', type: 'text' })
  descripcionSintomas!: string;

  @Column({
    name: 'epocaRiesgo',
    type: 'enum',
    enum: [
      'primavera',
      'verano',
      'otoño',
      'invierno',
      'todo_el_año',
    ],
  })
  epocaRiesgo!: string;

  @Column({ name: 'patogenoId', type: 'int' })
  patogenoId!: number;
}
