import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('patogenos')
export class Patogeno {
  @PrimaryGeneratedColumn({ name: 'patogeno_id' })
  id: number;

  @Column({ name: 'nombre' })
  nombre: string;

  @Column({ name: 'nombre_cientifico', unique: true })
  nombreCientifico: string;

  @Column({ name: 'tipo' })
  tipo: string;

  @Column({ name: 'transmision' })
  transmision: string;

  @Column({ name: 'secuencia_referencia', type: 'longtext' })
  secuenciaReferencia: string;
}