import { Controller, Get } from '@nestjs/common';
import { BrotesService } from './brotes.service.js';

@Controller('outbreaks')
export class BrotesController {
  constructor(private readonly brotesService: BrotesService) {}

  @Get('summary')
  obtenerResumen() {
    return this.brotesService.obtenerResumen();
  }
}
