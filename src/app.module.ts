import { Module } from '@nestjs/common';
import { MysqlModule } from './comun/mysql/mysql.module.js';
import { PlantasModule } from './plantas/plantas.module.js';
import { CultivosModule } from './cultivos/cultivos.module.js';

@Module({
  imports: [MysqlModule, PlantasModule, CultivosModule],
  controllers: [],
  providers: [],
})
export class AppModule {}