import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { SusceptibilidadesModule } from './susceptibilidades/susceptibilidades.module.js';
import { PlantasModule } from './plantas/plantas.module.js';
import { EnfermedadesModule } from './enfermedades/enfermedades.module.js';
import { BrotesModule } from './brotes/brotes.module.js';
import { EstadisticasModule } from './estadisticas/estadisticas.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql' as const,
        host: configService.get<string>('DB_HOST') ?? 'localhost',
        port: Number(configService.get<string>('DB_PORT') ?? 3306),
        username: configService.get<string>('DB_USERNAME') ?? 'root',
        password: configService.get<string>('DB_PASSWORD') ?? '',
        database: configService.get<string>('DB_DATABASE') ?? 'proyecto_back',
        autoLoadEntities: true,
        synchronize: false,
      }),
    }),

    SusceptibilidadesModule,
    PlantasModule,
    EnfermedadesModule,
    BrotesModule,
    EstadisticasModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}