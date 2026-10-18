export class ActualizarEnfermedadDto {
  nombre?: string;
  descripcionSintomas?: string;
  epocaRiesgo?:
    | 'primavera'
    | 'verano'
    | 'otoño'
    | 'invierno'
    | 'todo_el_año';
  patogenoId?: number;
}