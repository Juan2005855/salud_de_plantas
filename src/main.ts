import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';

async function iniciarAplicacion() {
  const app = await NestFactory.create(AppModule);
  const puerto = process.env.PORT ?? 3000;

  await app.listen(puerto);
  console.log(`Aplicación ejecutándose en http://localhost:${puerto}`);
}

iniciarAplicacion();
