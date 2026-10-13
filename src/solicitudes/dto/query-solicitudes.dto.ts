import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsOptional, IsString, Min, Max, IsDateString } from 'class-validator';
import { SolicitudeEstado } from '../entities/solicitude.entity.js';

export class QuerySolicitudesDto {
  @ApiPropertyOptional({ enum: SolicitudeEstado })
  @IsOptional()
  @IsEnum(SolicitudeEstado)
  estado?: SolicitudeEstado;

  @ApiPropertyOptional({ description: 'Identificador del asesor asignado' })
  @IsOptional()
  @IsString()
  asesor?: string;

  @ApiPropertyOptional({ description: 'Texto parcial para filtrar por cliente' })
  @IsOptional()
  @IsString()
  cliente?: string;

  @ApiPropertyOptional({ description: 'Fecha ISO 8601 de inicio del filtro' })
  @IsOptional()
  @IsDateString()
  desde?: string;

  @ApiPropertyOptional({ description: 'Fecha ISO 8601 de fin del filtro' })
  @IsOptional()
  @IsDateString()
  hasta?: string;

  @ApiPropertyOptional({ default: 1, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ default: 10, minimum: 1, maximum: 100 })
  @IsOptional()
  @Type(() => Number)
  @Min(1)
  @Max(100)
  limit?: number = 10;
}
