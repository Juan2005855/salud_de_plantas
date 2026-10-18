export class CrearTratamientoDto {
  nombre!: string;
  descripcionAplicacion!: string;
  tipo!: 'quimico' | 'biologico' | 'cultural';
  enfermedadId!: number;
}