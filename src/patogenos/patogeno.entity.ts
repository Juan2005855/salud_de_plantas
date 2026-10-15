import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { TIPOS_PATOGENO } from './tipos-patogeno.js';

@Entity('patogenos')
export class Patogeno {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  nombre: string;

  @Column({ length: 150, unique: true })
  nombreCientifico: string;

  @Column({ type: 'enum', enum: TIPOS_PATOGENO })
  tipo: string;

  @Column({ length: 100 })
  transmision: string;

  @Column({ type: 'text' })
  secuenciaGenetica: string;
}