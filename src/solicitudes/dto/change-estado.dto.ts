import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { SolicitudeEstado } from '../entities/solicitude.entity.js';

export class ChangeEstadoDto {
  @ApiProperty({ enum: SolicitudeEstado })
  @IsEnum(SolicitudeEstado)
  estado: SolicitudeEstado;
}
