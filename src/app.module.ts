import { Module } from '@nestjs/common';
import { createObserveModule } from '@nestjs/observe';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { SolicitudesModule } from './solicitudes/solicitudes.module.js';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthGuard } from './common/guards/auth.guard.js';
import { Solicitude } from './solicitudes/entities/solicitude.entity.js';
import { SolicitudHistorial } from './solicitudes/entities/solicitud-historial.entity.js';

export const { ObserveModule, ObserveInstrument } = createObserveModule();

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: process.env.SQLITE_DB ?? 'data/sqlite.db',
      entities: [Solicitude, SolicitudHistorial],
      synchronize: true,
      logging: false,
    }),
    SolicitudesModule,
  ],
  controllers: [AppController],
  providers: [AppService, AuthGuard],
})
export class AppModule {}
