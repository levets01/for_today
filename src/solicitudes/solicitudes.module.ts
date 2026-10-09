import { Module } from '@nestjs/common';
import { SolicitudesService } from './solicitudes.service.js';
import { SolicitudesController } from './solicitudes.controller.js';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Solicitude } from './entities/solicitude.entity.js';

@Module({
  imports: [TypeOrmModule.forFeature([Solicitude])],
  controllers: [SolicitudesController],
  providers: [SolicitudesService],
})
export class SolicitudesModule {}
