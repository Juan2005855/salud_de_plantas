export class ActualizarTratamientoDto {
  nombre?: string;
  descripcionAplicacion?: string;
  tipo?: 'quimico' | 'biologico' | 'cultural';
  enfermedadId?: number;
}