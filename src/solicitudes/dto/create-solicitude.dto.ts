import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, MaxLength } from 'class-validator';

export class CreateSolicitudeDto {
	@ApiProperty({ description: 'Nombre del cliente' })
	@IsString()
	@IsNotEmpty()
	@MaxLength(200)
	cliente: string;

	@ApiProperty({ description: 'Descripción de la solicitud' })
	@IsString()
	@IsNotEmpty()
	descripcion: string;
}
