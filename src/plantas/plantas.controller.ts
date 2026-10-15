import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { PlantasService } from './plantas.service.js';

@Controller('plants')
export class PlantasController {
  constructor(private readonly plantasService: PlantasService) {}

  @Get(':id/diseases')
  obtenerEnfermedades(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.plantasService.obtenerEnfermedades(id);
  }
}
