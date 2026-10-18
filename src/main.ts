import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module.js';

async function iniciarAplicacion() {
  const app = await NestFactory.create(AppModule);

  const configuracionSwagger = new DocumentBuilder()
    .setTitle('API Salud de las Plantas')
    .setDescription(
      'API para gestionar plantas, patógenos, enfermedades, susceptibilidades, cultivos, tratamientos y brotes.',
    )
    .setVersion('1.0')
    .build();

  const documento = SwaggerModule.createDocument(
    app,
    configuracionSwagger,
  );

  SwaggerModule.setup('api/docs', app, documento);

  const puerto = process.env.PORT ?? 3000;

  await app.listen(puerto);

  console.log(`Aplicación ejecutándose en http://localhost:${puerto}`);
  console.log(`Documentación Swagger en http://localhost:${puerto}/api/docs`);
}

iniciarAplicacion();