import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class AsignarSolicitudDto {
  @ApiProperty({ description: 'Nombre del usuario asesor al que se asigna la solicitud' })
  @IsString()
  @IsNotEmpty()
  asesorId: string;
}
