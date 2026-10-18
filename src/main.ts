import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configuracion = new DocumentBuilder()
    .setTitle('API Breaze in the Moon')
    .setDescription('API central de sanidad vegetal para registrar plantas, cultivos y verificar mutaciones geneticas')
    .setVersion('1.0')
    .build();
  const documento = SwaggerModule.createDocument(app, configuracion);
  SwaggerModule.setup('api-docs', app, documento);

  await app.listen(process.env.PORT ?? 3000);
}
await bootstrap();